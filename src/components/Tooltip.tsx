import type { ReactElement, ReactNode } from "react";
import { Tooltip as _Tooltip } from "@base-ui/react";

type Props = {
  children: ReactElement<Record<string, unknown>>;
  content: ReactNode;
};

const offset = 16;
const padding = 16;
const arrow = 12;

export default function Tooltip({ children, content }: Props) {
  return (
    <_Tooltip.Provider delay={200}>
      <_Tooltip.Root disableHoverablePopup>
        <_Tooltip.Trigger render={children} />
        <_Tooltip.Portal>
          <_Tooltip.Positioner
            sideOffset={offset}
            collisionPadding={padding}
            className="z-20"
          >
            <_Tooltip.Popup className="flex w-80 max-w-max flex-col gap-2 rounded-md bg-black p-2 text-white">
              <_Tooltip.Arrow className="text-black data-[side=bottom]:bottom-full data-[side=bottom]:rotate-180 data-[side=top]:top-full">
                <Arrow />
              </_Tooltip.Arrow>
              {content}
            </_Tooltip.Popup>
          </_Tooltip.Positioner>
        </_Tooltip.Portal>
      </_Tooltip.Root>
    </_Tooltip.Provider>
  );
}

export function Arrow() {
  return (
    <svg
      viewBox={[-arrow, -arrow, 2 * arrow, 2 * arrow].join(" ")}
      width={arrow}
    >
      <path
        d={`M 0 0 L -${arrow} -${arrow} L ${arrow} -${arrow}`}
        className="fill-current"
      />
    </svg>
  );
}
