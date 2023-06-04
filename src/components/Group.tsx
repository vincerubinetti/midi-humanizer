import { ReactNode } from "react";
import classes from "./Group.module.css";

type Props = {
  label: string;
  tooltip?: string;
  children: ReactNode;
};

const Group = ({ label, tooltip, children }: Props) => (
  <fieldset className={classes.group}>
    <legend data-tooltip={tooltip}>{label}</legend>
    {children}
  </fieldset>
);

export default Group;
