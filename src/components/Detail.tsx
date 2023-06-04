type Props = {
  label: string;
  value?: string;
};

const Detail = ({ label, value }: Props) => (
  <label className="control">
    <span className="control-label">{label}</span>
    <span className="control-primary">{value || "-"}</span>
  </label>
);

export default Detail;
