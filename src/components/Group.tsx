import { ReactNode } from "react";
import classes from "./Group.module.css";

type Props = {
  label: string;
  children: ReactNode;
};

const Group = ({ label, children }: Props) => (
  <fieldset className={classes.group}>
    <legend>{label}</legend>
    {children}
  </fieldset>
);

export default Group;
