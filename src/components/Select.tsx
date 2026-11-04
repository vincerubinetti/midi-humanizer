import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { clamp } from "lodash";

type Props = {
  label?: ReactNode;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<"label">, "onChange">;

export default function Select({
  label,
  options,
  value,
  onChange,
  className,
  ...props
}: Props) {
  return (
    <label
      className={clsx(
        "group col-span-full grid cursor-pointer grid-cols-subgrid items-center gap-2 rounded-md",
        className,
      )}
      {...props}
    >
      {label}
      <select
        className="col-span-2 flex cursor-pointer appearance-none items-center justify-center rounded-md bg-accent p-2 text-white hover:bg-black"
        value={value}
        onChange={({ target }) => onChange(target.value)}
        onKeyDown={({ key }) => {
          /** quick keyboard selection */
          let index = options.findIndex((option) => option.value === value);
          if (key === "ArrowLeft") index--;
          if (key === "ArrowRight") index++;
          index = clamp(index, 0, options.length - 1);
          const newValue = options[index]?.value;
          if (!newValue) return;
          onChange(String(newValue));
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
