import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useState
} from "react";

export interface IViewDefinitionContext {
  viewDefinitionContext: Record<string, unknown>;
}

export const ViewDefinitionContext = createContext({
  viewDefinitionContext: {},
  setViewDefinitionContext: () => {}
} as IViewDefinitionContext);

export const ViewDefinitionContextProvider = ({
  children
}: PropsWithChildren<null>): ReactElement => {
  const { viewDefinitionContext: parentViewDefinitionContext } = useContext(
    ViewDefinitionContext
  );
  const [viewDefinitionContext, setViewDefinitionContext] = useState(
    parentViewDefinitionContext
  );
  const value = { viewDefinitionContext, setViewDefinitionContext };

  return (
    <ViewDefinitionContext.Provider value={value}>
      {children}
    </ViewDefinitionContext.Provider>
  );
};
