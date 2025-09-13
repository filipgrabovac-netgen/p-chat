import { createContext, useContext, cache } from "react";

export type GlobalStateDataType = {
  default: string;
};

const GlobalStateContext = createContext<GlobalStateDataType>({
  default: "default",
});

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <GlobalStateContext.Provider value={{ default: "default" }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

export const getGlobalState = cache(() => {
  if (typeof window !== "undefined") {
    throw new Error(
      "getGlobalState can only be called from the client, use useGlobalState instead"
    );
  }
  return useGlobalState();
});
