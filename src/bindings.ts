import { transformRegistry } from "./transformRegistry";

export type IBindingTransform = (...args: unknown[]) => unknown;

export const BINDING_CODE = {
  context: "context",
  transform: "transform",
  data: "data"
} as const;

export type BindingCode = keyof typeof BINDING_CODE;

export interface IBindingValue {
  dataId: string;
  code: BindingCode;
  raw: string;
  accessor?: string[];
}

export type IBindingItem = IBindingValue | IBindingTransform | unknown;
export type IBinding = IBindingItem[];

export interface IRawBindingRef {
  binding: string;
  initialValue?: unknown;
  prop: string;
}

export interface IBindingRef {
  binding: IBinding;
  initialValue?: unknown;
  path: string[];
}

export interface IBindingDataRef<T> {
  id: string;
  code: BindingCode;
  details: T;
}

const numberRegex = /^[0-9.]*$/;

export const getRawBindingItems = (binding: string): unknown[] => {
  return binding.split(",").map((x) => {
    const trimmed = x.trim();

    // Check if its a explicity cast as a string constant e.g. "'name'" or "'4'"
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.substring(1, trimmed.length - 1);
    }

    // Check if its a number constant "43.489"
    if (trimmed.match(numberRegex)) {
      const num = parseFloat(trimmed);
      return num;
    }

    return trimmed;
  });
};

export const isObject = (value?: unknown): value is unknown => {
  return value != null && typeof value === "object";
};

export const isString = (value: unknown): value is unknown => {
  return typeof value === "string";
};

export const isRawBinding = (value: unknown): value is unknown => {
  return isString(value);
};

export const getRawBindings = (
  data: Record<string, unknown>,
  rootPath: string[] = [],
  doCleanBindings = false
): IRawBindingRef[] => {
  const result: IRawBindingRef[] = [];
  for (const prop in data) {
    if ({}.hasOwnProperty.call(data, prop) && data[prop] != null) {
      const value = data[prop];
      if (prop === "bindings" && isObject(value)) {
        for (const binding in value as Record<string, unknown>) {
          if ({}.hasOwnProperty.call(value, binding)) {
            const rawBinding = value[binding];
            if (isRawBinding(rawBinding)) {
              result.push({
                binding: rawBinding as string,
                initialValue: data[binding],
                path: [...rootPath, binding]
              });
            }
          }
        }
        if (doCleanBindings) {
          delete data.bindings;
        }
      } else if (isObject(value)) {
        result.push(
          ...getRawBindings(
            value as Record<string, unknown>,
            [...rootPath, prop],
            doCleanBindings
          )
        );
      }
    }
  }
  return result;
};

export const getBindingCode = (
  value: string
): { code: string; value: string } | null => {
  const regex = new RegExp("^{([a-zA-Z0-9]*):(.*)}$");
  const match = value.match(regex);

  if (match == null) {
    return null;
  }

  return {
    code: match[1],
    value: match[2]
  };
};

export const isBindingCode = (code: string): code is BindingCode => {
  return {}.hasOwnProperty.call(BINDING_CODE, code);
};

export const getBindingItem = (
  item: unknown,
  context?: Record<string, unknown>
): [IBindingItem, IBindingDataRef<unknown> | undefined] => {
  if (!isString(item)) {
    return [item, undefined];
  }
  const parsedItem = context ? resolveContextBindings(item, context) : item;

  if (parsedItem == null) {
    return [item, undefined];
  }

  if (!isString(parsedItem)) {
    return [parsedItem, undefined];
  }

  const data = getBindingCode(parsedItem as string);

  if (data == null) {
    return [parsedItem, undefined];
  }

  if (!isBindingCode(data.code)) {
    return [parsedItem, undefined];
  }

  if (data.code === BINDING_CODE.transform) {
    return [transformRegistry.getTransform(data.value), undefined];
  }

  const parser = bindingRegistry[data.code];
  if (parser == null) {
    return [parsedItem, undefined];
  }

  const { dataRef, accessor } = parser(data.value);

  return [
    {
      code: data.code,
      accessor: accessor,
      raw: item,
      dataId: dataRef.id
    },
    dataRef
  ];
};

export const getBindings = (
  target: object,
  context?: Record<string, unknown>,
  rootPath: string[] = [],
  doCleanBindings = false
): IParsedBindings => {
  const rawBindings = getRawBindings(
    target as Record<string, unknown>,
    rootPath,
    doCleanBindings
  );

  const dataRefs: IBindingDataRef<unknown>[] = [];
  const refs: IBindingRef[] = [];

  for (const rawBinding of rawBindings) {
    const binding = getRawBindingItems(rawBinding.binding).map(
      (x): IBindingItem => {
        const [bindingItem, dataRef] = getBindingItem(x, context);
        if (dataRef != null && !dataRefs.some((y) => y.id === dataRef.id)) {
          dataRefs.push(dataRef);
        }
        return bindingItem;
      }
    );
    refs.push({
      binding,
      initialValue: rawBinding.initialValue,
      path: rawBinding.path
    });
  }

  return {
    dataRefs,
    refs
  };
};
