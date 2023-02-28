import React from "react";
import { Box } from "./Box";
import { InvalidComponent } from "./InvalidComponent";
import { Shape } from "./Shape";

export class ComponentRegistry {
  private readonly _components: Map<string, React.ElementType> = new Map();

  register(name: string, component: React.ElementType): void {
    this._components.set(name, component);
  }

  getComponent(name: string): React.ElementType {
    const component = this._components.get(name.toLowerCase());
    return component ?? InvalidComponent;
  }
}

export const componentRegistry = new ComponentRegistry();

componentRegistry.register("box", Box);
componentRegistry.register("shape", Shape);
