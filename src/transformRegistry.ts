export type GenericFunction = (...args: unknown[]) => unknown;

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export class TransformRegistry {
  private readonly _transforms: Map<string, GenericFunction> = new Map();

  register(name: string, method: GenericFunction): void {
    this._transforms.set(name, method);
  }

  getTransform(name: string): GenericFunction | null {
    return this._transforms.get(name) ?? null;
  }
}

export const transformRegistry = new TransformRegistry();

export const formatPrecision = (
  value: unknown,
  precision: unknown
): unknown => {
  if (!isNumber(precision)) {
    throw Error(
      `invalid precision, expected number but received ${typeof precision}`
    );
  }

  const precisionToUse = precision > 20 ? 20 : precision;

  if (!isNumber(value)) {
    throw Error(`invalid value, expected number but received ${typeof value}`);
  }

  switch (value) {
    case Infinity:
      return "+INF";
    case -Infinity:
      return "-INF";

    default:
      if (isNaN(value as number)) {
        return "NaN";
      }

      return precision === -1
        ? value.toString()
        : value.toFixed(precisionToUse);
  }
};

transformRegistry.register("formatPrecision", formatPrecision);
