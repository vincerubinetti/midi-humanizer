import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, track } from "@/state";

export default function Drift() {
  /** global state */
  const [getTrack] = useAtom(track);
  const get = getTrack.drift;

  return (
    <fieldset>
      <legend>Drift</legend>

      <Tooltip content="Max amount to drift starts left/right randomly, in ticks.">
        <Range
          label="Rand."
          min={-10}
          max={10}
          step={1}
          value={get.amount}
          defaultValue={defaults.drift.amount}
          onChange={(value) =>
            setTrack((track) => {
              track.drift.amount = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of drift randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={get.seed}
          defaultValue={defaults.drift.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.drift.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Start drifting toward new value every this many of ticks. Lower = faster, higher = slower.">
        <Range
          label="Step"
          min={96 * 0.5}
          max={96 * 10}
          step={1}
          value={get.step}
          defaultValue={defaults.drift.step}
          onChange={(value) =>
            setTrack((track) => {
              track.drift.step = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
