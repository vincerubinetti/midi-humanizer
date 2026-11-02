import type { ComponentProps, ReactNode } from "react";
import { CheckIcon } from "lucide-react";

type Props = {
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
} & Omit<ComponentProps<"label">, "onChange">;

export default function Checkbox({ label, value, onChange, ...props }: Props) {
  return (
    <label
      className="group relative isolate col-span-full grid cursor-pointer grid-cols-subgrid gap-4 rounded-md hover:bg-off-white"
      {...props}
    >
      <div className="absolute -inset-1 -z-10 rounded-md group-hover:bg-off-white" />
      {label}
      <div className="relative grid size-5 place-items-center rounded-md bg-accent text-white *:absolute group-hover:bg-black focus-within:outline-2">
        <input
          type="checkbox"
          checked={value}
          onChange={({ target }) => onChange(target.checked)}
          className="sr-only"
        />
        {value && <CheckIcon />}
      </div>
    </label>
  );
}
