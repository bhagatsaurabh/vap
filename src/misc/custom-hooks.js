import { useEffect, useRef } from "react";

export const useAfterMount = (callback, cleanup) => {
  const mounted = useRef(false);
  const called = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      if (!called.current) callback();
      called.current = true;
    }
    mounted.current = true;

    return cleanup;
  }, []);
};
