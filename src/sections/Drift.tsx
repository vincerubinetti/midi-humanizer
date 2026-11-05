import { useAtomValue } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaultsAtom, ppqAtom, setTrack, trackAtom } from "@/state";

export default function Drift() {
  /** global state */
  const defaults = useAtomValue(defaultsAtom);
  const { drift } = useAtomValue(trackAtom);
  const ppq = useAtomValue(ppqAtom);

  return (
    <fieldset>
      <legend>Drift</legend>

      <Tooltip content="Max amount to drift randomly, in ticks.">
        <Range
          label="Rand."
          min={-ppq / 4}
          max={ppq / 4}
          step={1}
          value={drift.amount}
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
          value={drift.seed}
          defaultValue={defaults.drift.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.drift.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Start drifting toward new value every this many of ticks.">
        <Range
          label="Step"
          min={ppq / 2}
          max={ppq * 4}
          step={1}
          value={drift.step}
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
