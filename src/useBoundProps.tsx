import { Atom, atom, PrimitiveAtom, useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { componentsAtomFamily, contextAtomFamily } from "./PageLoader";
import { atomWithObservable } from "jotai/utils";
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import {
  getRawBindings,
  isRawBinding,
  IRawBindingRef,
  getBindingCode
} from "./bindings";

const counterSubject = interval(1000).pipe(map((i) => i));
const counterAtom = atomWithObservable(() => counterSubject);

const doublerAtom = atom({ invoke: (n: number) => n * 2 });

interface IBoundProps {
  boundProps?: Record<string, unknown>;
}

export const useBoundProps = (id: string): IBoundProps => {
  const [component] = useAtom(componentsAtomFamily({ id }));

  const [contextAtom] = useAtom(contextAtomFamily({ id }));

  const boundPropsAtom = useMemo(() => {
    const innerAtom = atom<Record<string, unknown>>({});
    const outerAtom = atom(
      (get) => {
        const doubler = get(doublerAtom);
        const counter = get(counterAtom);
        return {
          ...get(innerAtom),
          ...{ text: "Crap" + doubler.invoke(counter as number) }
        };
      },
      (get, set, val) => {
        set(innerAtom, val as Record<string, unknown>);
      }
    );
    outerAtom.onMount = (setAtom) => {
      let bindings: Record<string, unknown> = component.component
        ?.bindings as Record<string, unknown>;

      const result: IRawBindingRef[] = [];
      if (component.component?.bindings) {
        for (const binding in bindings) {
          if ({}.hasOwnProperty.call(bindings, binding)) {
            const rawBinding = bindings[binding];
            if (isRawBinding(rawBinding)) {
              let code = getBindingCode(rawBinding as string);
              result.push({
                binding: rawBinding as string,
                prop: binding
              });
            }
          }
        }
      }
      setAtom({ text: "Blah" });
    };

    return outerAtom;
  }, [id]);

  const [boundProps] = useAtom(boundPropsAtom);

  return { boundProps: boundProps };
};
