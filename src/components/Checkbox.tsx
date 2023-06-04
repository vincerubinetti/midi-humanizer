import classes from "./Checkbox.module.css";

type Props = {
  label: string;
  tooltip?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const Checkbox = ({ label, tooltip, value, onChange }: Props) => (
  <label className="control">
    <span className="control-label" data-tooltip={tooltip}>
      {label}
    </span>
    <input
      type="checkbox"
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
      className={classes.input}
    />
  </label>
);

export default Checkbox;
