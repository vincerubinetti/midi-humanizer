import { useEffect, useRef } from "react";

export const useViewBox = () => {
  const svg = useRef<SVGGeometryElement>(null);

  useEffect(() => {
    if (!svg.current) return;
    const { x, y, width, height } = svg.current.getBBox();
    const viewBox = [x, y, width, height].map((v) => Math.round(v)).join(" ");
    svg.current.setAttribute("viewBox", viewBox);
  });

  return svg;
};
