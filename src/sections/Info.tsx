import { useAtom } from "jotai";
import Detail from "@/components/Detail";
import Group from "@/components/Group";
import { filename, midi } from "@/state";

const Info = () => {
  const [getMidi] = useAtom(midi);
  const [getFilename] = useAtom(filename);

  if (!getMidi) return <></>;

  return (
    <Group label="Info">
      <Detail label="File" value={getFilename} />
      <Detail label="Name" value={getMidi?.name} />
    </Group>
  );
};

export default Info;
