import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "@reactuses/core";
import { clamp } from "lodash";

/** base transform identity */
const identity = {
  translate: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
};

type Transform = typeof identity;

/** handle pan/zoom for element, with independent x and y axes */
export const useTransform = (
  ref: RefObject<Element | null>,
  {
    left = -Infinity,
    right = Infinity,
    top = -Infinity,
    bottom = Infinity,
    minScaleX = 0.0001,
    maxScaleX = 10000,
    minScaleY = 0.0001,
    maxScaleY = 10000,
    scaleRateX = 0.001,
    scaleRateY = 0.001,
  } = {},
) => {
  /** limit transform */
  const limit = useCallback(
    ({ translate, scale }: Transform) => {
      /** limit zoom */
      scale.x = clamp(scale.x, minScaleX, maxScaleX);
      scale.y = clamp(scale.y, minScaleY, maxScaleY);

      /** limit pan */
      const { width = 0, height = 0 } =
        ref.current?.getBoundingClientRect() || {};
      translate.x = clamp(
        translate.x,
        -scale.x * right,
        -scale.x * left + width,
      );
      translate.y = clamp(
        translate.y,
        -scale.y * bottom,
        -scale.y * top + height,
      );

      return { translate, scale };
    },
    [ref, left, right, top, bottom, minScaleX, maxScaleX, minScaleY, maxScaleY],
  );

  /** current transform state */
  const [transform, setTransform] = useState(identity);

  /** limit when anything affecting limit func changes */
  useEffect(() => {
    // eslint-disable-next-line
    setTransform(limit);
  }, [limit]);

  /** modifiers for independent x/y control */
  const modifiers = (
    { altKey, shiftKey, ctrlKey, metaKey }: WheelEvent | PointerEvent,
    strict = false,
  ) => {
    if (altKey || !strict) return "xy";
    if (shiftKey) return "x";
    if (ctrlKey || metaKey) return "y";
    return "";
  };

  /** handle mouse wheel */
  useEventListener(
    "wheel",
    (event: WheelEvent) => {
      /** modifiers for independent x/y control */
      const axes = modifiers(event, true);
      if (!axes) return;

      /** prevent page scroll */
      event.preventDefault();

      /** event details */
      const { deltaY, clientX, clientY } = event;
      const target = event.currentTarget as Element;
      const { left, top } = target.getBoundingClientRect();
      const pointX = clientX - left;
      const pointY = clientY - top;

      setTransform(({ translate, scale }) => {
        /** new transform values */
        let newTransform = { translate: { ...translate }, scale: { ...scale } };

        /** calculate horizontal */
        if (axes.includes("x")) {
          newTransform.scale.x = scale.x * Math.exp(-deltaY * scaleRateX);
          newTransform = limit(newTransform);
          newTransform.translate.x =
            pointX - (pointX - translate.x) * (newTransform.scale.x / scale.x);
          newTransform = limit(newTransform);
        }

        /** calculate vertical */
        if (axes.includes("y")) {
          newTransform.scale.y = scale.y * Math.exp(-deltaY * scaleRateY);
          newTransform = limit(newTransform);
          newTransform.translate.y =
            pointY - (pointY - translate.y) * (newTransform.scale.y / scale.y);
          newTransform = limit(newTransform);
        }

        return newTransform;
      });
    },
    ref,
    { passive: false },
  );

  /** drag state */
  const drag = useRef<PointerEvent | null>(null);

  /** handle drag move */
  useEventListener(
    "pointermove",
    (event: PointerEvent) => {
      /** modifiers for independent x/y control */
      const axes = modifiers(event);
      if (!axes) return;

      /** prevent page drag */
      event.preventDefault();

      if (!drag.current) return;
      if (drag.current.pointerId !== event.pointerId) return;

      /** change in position */
      const dx = axes.includes("x") ? event.clientX - drag.current.clientX : 0;
      const dy = axes.includes("y") ? event.clientY - drag.current.clientY : 0;

      /** update drag state */
      drag.current = event;

      /** update transform */
      setTransform(({ translate, scale }) =>
        limit({
          translate: { x: translate.x + dx, y: translate.y + dy },
          scale,
        }),
      );
    },
    ref,
  );

  /** handle drag start */
  useEventListener(
    "pointerdown",
    (event: PointerEvent) => {
      /** avoid bottom right corner (resize handle) */
      const target = event.currentTarget as Element;
      const bbox = target.getBoundingClientRect();
      if (event.clientX > bbox.right - 20 && event.clientY > bbox.bottom - 20)
        return;

      /** prevent page drag */
      event.preventDefault();

      /** update drag state */
      drag.current = event;

      /** capture pointer for drag */
      target.setPointerCapture(event.pointerId);
    },
    ref,
  );

  /** handle drag end */
  const end = (event: PointerEvent) => {
    event.preventDefault();
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };
  useEventListener("pointerup", end, ref);
  useEventListener("pointercancel", end, ref);

  /** reset */
  useEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
      setTransform(identity);
    },
    ref,
  );

  return [transform] as const;
};
