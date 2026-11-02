import { useAtom } from "jotai";
import { midi, track } from "@/state";

export default function Track() {
  const [getMidi] = useAtom(midi);
  const [getTrack, setTrack] = useAtom(track);

  if (!getMidi) return <></>;

  /** list of instruments */
  const instruments = getMidi.tracks.map(
    (track, index) =>
      index +
      1 +
      ". " +
      [
        track.name,
        track.instrument.name,
        track.instrument.family,
        track.instrument.percussion ? "percussion" : "",
      ]
        .filter(Boolean)
        .join(" | "),
  );

  return (
    <label>
      Track
      <select
        className="w-40"
        value={getTrack}
        onChange={({ target }) => setTrack(Number(target.value))}
      >
        {instruments.map((instrument, index) => (
          <option key={index} value={index}>
            {instrument}
          </option>
        ))}
      </select>
    </label>
  );
}
