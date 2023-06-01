import classes from "./Range.module.css";

type Props = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

const Range = ({ label, min, max, step, value, onChange }: Props) => (
  <label className={classes.container}>
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
