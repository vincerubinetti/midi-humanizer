import { useAtom } from "jotai";
import Group from "@/components/Group";
import Select from "@/components/Select";
import { midi, track } from "@/state";

const Info = () => {
  const [getMidi] = useAtom(midi);
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
    <Group label="Track">
      <Select
        label="Select"
        options={instruments}
        value={getTrack}
        onChange={setTrack}
      />
    </Group>
  );
};

export default Info;
