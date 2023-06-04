import classes from "./Checkbox.module.css";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const Checkbox = ({ label, value, onChange }: Props) => (
  <label className="control">
    <span className="control-label">{label}</span>
    <input
      type="checkbox"
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
      className={classes.input}
    />
  </label>
);

export default Checkbox;
