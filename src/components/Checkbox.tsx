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
      className="group relative isolate col-span-full grid cursor-pointer grid-cols-subgrid items-center gap-2 rounded-md hover:bg-off-white"
      {...props}
    >
      {label}
      <div className="relative col-start-2 -col-end-1 grid size-5 place-items-center rounded-md bg-accent text-white *:absolute group-hover:bg-black focus-within:outline-2">
        <input
          className="sr-only"
          type="checkbox"
          checked={value}
          onChange={({ target }) => onChange(target.checked)}
        />
        {value && <CheckIcon />}
      </div>
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-md group-hover:bg-off-white" />
    </label>
  );
}
