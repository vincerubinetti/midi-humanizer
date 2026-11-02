import type { ComponentProps, ReactNode } from "react";
import { Slider } from "@base-ui/react";

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
  ...props
}: Props) {
  return (
    <label
      {...props}
      className="group relative isolate col-span-full grid grid-cols-subgrid gap-4"
      onDoubleClick={() => onChange(defaultValue)}
    >
      <div className="absolute -inset-1 -z-10 rounded-md group-hover:bg-off-white" />
      {label}
      <Slider.Root
        value={value}
        onValueChange={(value) => {
          if (!value) return;
          onChange?.(value);
        }}
        min={min}
        max={max}
        step={step}
        className="flex min-w-10 grow flex-col gap-2"
      >
        <Slider.Control className="flex cursor-pointer touch-none items-center p-2 text-accent select-none group-hover:text-black">
          <Slider.Track className="h-1 w-full rounded-full bg-off-white group-hover:bg-light-gray">
            <Slider.Indicator className="rounded-full bg-accent group-hover:bg-black" />
            <Slider.Thumb className="size-4 rounded-full bg-current has-focus-visible:outline-2" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <input
        className="w-12 min-w-0 rounded-md"
        type="number"
        step={step}
        value={value}
        onChange={({ target }) => onChange(Number(target.value))}
      />
    </label>
  );
}
