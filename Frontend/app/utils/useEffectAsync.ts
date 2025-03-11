import { useEffect } from "react";

const useEffectAsync = (
  callback: CallableFunction,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
};

export default useEffectAsync;
