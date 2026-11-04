import { useAtom, useAtomValue } from "jotai";
import Checkbox from "@/components/Checkbox";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import { editAllAtom, midiAtom, reset, trackIndexAtom } from "@/state";

export default function Track() {
  /** global state */
  const midi = useAtomValue(midiAtom);
  const [trackIndex, setTrackIndex] = useAtom(trackIndexAtom);
  const [editAll, setEditAll] = useAtom(editAllAtom);

  if (!midi) return <></>;

  /** list of instruments */
  const instruments = midi.tracks.map(({ name, instrument }, index) => ({
    value: String(index),
    label: `${index + 1}. ${name} - ${instrument.name}`,
  }));

  return (
    <fieldset className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4">
      <legend>Track</legend>
      <Select
        options={instruments}
        value={String(trackIndex)}
        onChange={(value) => setTrackIndex(Number(value))}
        aria-label="Track"
      />
      <Tooltip content="Whether to update all tracks together. If on, editing a control sets value for all tracks, not just selected one.">
        <Checkbox
          className="flex!"
          label="Edit all"
          value={editAll}
          onChange={setEditAll}
        />
      </Tooltip>
      <Tooltip
        content={
          editAll
            ? "Reset values to defaults for all tracks."
            : "Reset values to defaults for this track."
        }
      >
        <button className="w-32" onClick={reset}>
          Reset
        </button>
      </Tooltip>
    </fieldset>
  );
}
