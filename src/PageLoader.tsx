import React, { ReactElement, useEffect, useState } from "react";
import { atom, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { ViewDefinitionContext } from "./ViewDefinitionContext";
import { ComponentLoaderAtomic } from "./ComponentLoaderAtomic";
import ReactJson from "react-json-view";
import * as sp from "./sp.json";

export interface ICustomProperty {
  name: string;
  description: string;
  defaultValue: string | number | null;
}

export interface IComponentPersist {
  componentType: string;
  props?: Record<string, unknown>;
  children?: IComponentPersist[];
  context?: Record<string, unknown>;
  bindings?: Record<string, unknown>;
}

export interface IComponent {
  id: string;
  componentType: string;
  props?: Record<string, unknown>;
  children?: string[];
  context?: Record<string, unknown>;
  bindings?: Record<string, unknown>;
}

export type ComponentParam = { id: string; component?: IComponent };
export const componentsAtomFamily = atomFamily(
  (param: ComponentParam) => atom({ id: param.id, component: param.component }),
  (a: ComponentParam, b: ComponentParam) => a.id === b.id
);

export type ContextParam = { id: string; context?: Record<string, unknown> };
export const contextAtomFamily = atomFamily(
  (param: ContextParam) => atom({ id: param.id, context: param.context }),
  (a: ContextParam, b: ContextParam) => a.id === b.id
);

export const componentsAtom = atom<string[]>([]);
export let viewAtom = atom<IComponent | null>(null);

export const PageLoader = (): ReactElement => {
  const setComponents = useSetAtom(componentsAtom);

  const [rootComponent, setRootComponent] = useState<IComponent | null>(null);

  useEffect(() => {
    const loadComponent = (
      componentPersist: IComponentPersist,
      currentContext: Record<string, unknown>
    ): IComponent | null => {
      if (componentPersist != null && setComponents != null) {
        let componentType = componentPersist.componentType;
        let childIds: string[] = [];
        let ctx = currentContext;
        if (componentPersist.context != null) {
          ctx = { ...currentContext, ...componentPersist.context };
        }
        if (componentPersist.children != null) {
          componentPersist.children.forEach((childComponentPersist) => {
            let childComponent = loadComponent(childComponentPersist, ctx);
            if (childComponent != null) {
              childIds.push(childComponent.id);
            }
          });
        }
        let component: IComponent = {
          ...structuredClone(componentPersist),
          id: `${componentType}:${Math.random().toString(16).substring(2, 10)}`,
          children: childIds ? childIds : undefined
        };
        componentsAtomFamily({ id: component.id, component: component });
        contextAtomFamily({ id: component.id, context: ctx });
        setComponents((prev) => [...prev, component.id!]);
        return component;
      }
      return null;
    };
    if (sp["definition"] != null) {
      let rootComponent = loadComponent(sp["definition"], { globalCtx: 2 });
      setRootComponent(rootComponent);
    }
  }, [setComponents]);

  return rootComponent?.id == null ? (
    <></>
  ) : (
    <ComponentLoaderAtomic id={rootComponent.id} />
  );
};
