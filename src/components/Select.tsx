import classes from "./Select.module.css";

type Props<Option> = {
  label: string;
  options: Option[];
  value: number;
  onChange: (value: number) => void;
};

const Select = <Option extends string>({
  label,
  options,
  onChange,
}: Props<Option>) => (
  <label className="control">
    <span className="control-label">{label}</span>
    <select
      className={classes.select + " control-primary"}
      onChange={(event) => onChange(event.target.selectedIndex)}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default Select;
