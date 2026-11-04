import type { ComponentProps, ReactNode } from "react";
import { Slider } from "@base-ui/react";
import clsx from "clsx";

type Props = {
  label: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
} & Omit<ComponentProps<"label">, "onChange">;

export default function Range({
  label,
  min,
  max,
  step,
  value,
  defaultValue,
  onChange,
  className,
  ...props
}: Props) {
  return (
    <label
      {...props}
      className={clsx(
        "group relative isolate col-span-full grid grid-cols-subgrid items-center gap-2",
        className,
      )}
      onDoubleClick={() => onChange(defaultValue)}
    >
      {label}
      <Slider.Root
        className="flex grow flex-col gap-2"
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Control className="flex cursor-pointer touch-none items-center p-2 text-accent select-none group-hover:text-black">
          <Slider.Track className="h-1 w-full rounded-full bg-off-white group-hover:bg-light-gray">
            <Slider.Indicator className="rounded-full bg-accent group-hover:bg-black" />
            <Slider.Thumb className="size-4 rounded-full bg-current has-focus-visible:outline-2" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <input
        className="w-10 rounded-md"
        type="number"
        step={step}
        value={value}
        onChange={({ target }) => onChange(Number(target.value))}
      />
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-md group-hover:bg-off-white" />
    </label>
  );
}
