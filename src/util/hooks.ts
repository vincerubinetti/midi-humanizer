import { useEffect, useRef, useState } from "react";

/** wrapper around useResizeObserver for sensical ref typing */
export const useSize = <T extends Element>() => {
  const [bbox, setBbox] = useState<DOMRect>();
  const ref = useRef<T>(null);

  /** setup resize observer */
  const observer = new ResizeObserver(() => {
    if (!ref.current) return;
    /** get and set dimensions */
    setBbox(ref.current?.getBoundingClientRect());
  });

  /** observe element with observer */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    observer.observe(element, { box: "content-box" });
    return () => observer.unobserve(element);
  });

  return { ref, width: bbox?.width || 0, height: bbox?.height || 0 };
};
