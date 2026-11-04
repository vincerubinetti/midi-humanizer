import { useAtom } from "jotai";
import Select from "@/components/Select";
import { midi, track } from "@/state";

export default function Track() {
  /** global state */
  const [getMidi] = useAtom(midi);
  const [getTrack, setTrack] = useAtom(track);

  if (!getMidi) return <></>;

  /** list of instruments */
  const instruments = getMidi.tracks.map(({ name, instrument }, index) => ({
    value: String(index),
    label: `${index + 1}. ${name} - ${instrument.name}`,
  }));

  return (
    <div className="grid grid-cols-[auto_auto]">
      <Select
        label="Track"
        options={instruments}
        value={String(getTrack)}
        onChange={(value) => setTrack(Number(value))}
      />
    </div>
  );
}
