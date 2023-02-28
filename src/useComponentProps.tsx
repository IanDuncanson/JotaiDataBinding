import { useAtom } from "jotai";
import { useState } from "react";
import {
  componentsAtomFamily
} from "./PageLoader";
import { useBoundProps } from "./useBoundProps";

interface IComponentProps {
  props?: Record<string, unknown>;
}

export const useComponentProps = (id: string): IComponentProps => {
  const [component] = useAtom(componentsAtomFamily({ id }));

  const [currentProps] = useState<Record<string, unknown> | undefined>(
    component.component?.props
  );
  const { boundProps } = useBoundProps(id);
  return { props: { ...currentProps, ...boundProps } };
};
