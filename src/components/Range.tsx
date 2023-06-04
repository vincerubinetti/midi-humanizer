import classes from "./Range.module.css";

type Props = {
  label: string;
  tooltip?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
};

const Range = ({
  label,
  tooltip,
  min,
  max,
  step,
  value,
  defaultValue,
  onChange,
}: Props) => (
  <label className="control">
    <span
      className={"control-label"}
      onDoubleClick={() => onChange(defaultValue)}
      data-tooltip={tooltip + " Double-click to reset."}
    >
      {label}
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={classes.input + " control-primary"}
    />
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={classes.value + " control-secondary"}
    />
  </label>
);

export default Range;
