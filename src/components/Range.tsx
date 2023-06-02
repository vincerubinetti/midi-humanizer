import classes from "./Range.module.css";

type Props = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
};

const Range = ({
  label,
  min,
  max,
  step,
  value,
  defaultValue,
  onChange,
}: Props) => (
  <label
    className={classes.container}
    onDoubleClick={() => onChange(defaultValue)}
  >
    <span className={classes.label}>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={classes.input}
    />
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={classes.value}
    />
  </label>
);

export default Range;
