import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, track } from "@/state";

export default function Start() {
  /** global state */
  const [getTrack] = useAtom(track);
  const get = getTrack.start;

  return (
    <fieldset>
      <legend>Starts</legend>
      <Tooltip content="Amount of randomness. Max amount to shift note starts left/right, in ticks.">
        <Range
          label="Rand."
          min={0}
          max={10}
          step={1}
          value={get.randomness}
          defaultValue={defaults.start.randomness}
          onChange={(value) =>
            setTrack((track) => {
              track.start.randomness = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of note start randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={get.seed}
          defaultValue={defaults.start.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.start.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all note starts left/right, in ticks.">
        <Range
          label="Shift"
          min={-10}
          max={10}
          step={1}
          value={get.shift}
          defaultValue={defaults.start.shift}
          onChange={(value) =>
            setTrack((track) => {
              track.start.shift = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
