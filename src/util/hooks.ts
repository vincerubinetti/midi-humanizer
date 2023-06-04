import { useRef } from "react";
import useResizeObserver from "use-resize-observer";

/** wrapper around useResizeObserver for sensical ref typing */
export const useSize = <T extends Element>() => {
  const ref = useRef<T>(null);
  const { width = 0, height = 0 } = useResizeObserver<T>({ ref });
  return { ref, width, height };
};
