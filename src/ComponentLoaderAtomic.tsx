import React, { ReactElement } from "react";
import { atom, useAtom } from "jotai";
import { componentRegistry } from "./ComponentRegistry";
import { componentsAtomFamily } from "./PageLoader";
import { InvalidComponent } from "./InvalidComponent";
import { useComponentProps } from "./useComponentProps";

interface IComponentLoaderAtomic {
  id: string;
}

export const ComponentLoaderAtomic = ({
  id
}: IComponentLoaderAtomic): ReactElement => {
  const [componentAtom] = useAtom(componentsAtomFamily({ id }));
  const { props } = useComponentProps(componentAtom.id);

  if (componentAtom.component == null) {
    return <InvalidComponent />;
  }
  const Component = componentRegistry.getComponent(
    componentAtom.component.componentType ?? "Invalid"
  );
  return (
    <Component {...props} key={id}>
      {componentAtom.component.children?.map((childId) =>
        childId ? (
          <ComponentLoaderAtomic
            key={childId as string}
            id={childId as string}
          />
        ) : (
          <></>
        )
      )}
    </Component>
  );
};
