import { useAtom } from "jotai";
import Detail from "@/components/Detail";
import Group from "@/components/Group";
import Select from "@/components/Select";
import { filename, midi, track } from "@/state";

const Meta = () => {
  const [getMidi] = useAtom(midi);
  const [getFilename] = useAtom(filename);
  const [getTrack, setTrack] = useAtom(track);

  if (!getMidi) return <></>;

  /** list of instruments */
  const instruments =
    getMidi.tracks.map((track) => {
      const { name, family, percussion } = track.instrument;
      return [name, family, percussion ? "percussion" : ""]
        .filter(Boolean)
        .join(" | ");
    }) || [];

  return (
    <Group label="Info">
      <Detail label="File" value={getFilename} />
      <Detail label="Name" value={getMidi?.name} />
      <Select
        label="Track"
        options={instruments}
        value={getTrack}
        onChange={setTrack}
      />
    </Group>
  );
};

export default Meta;
