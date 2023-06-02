import { ChangeEvent, useRef } from "react";
import { Midi } from "@tonejs/midi";
import Group from "@/components/Group";
import { useState } from "@/global/state";
import { downloadData } from "@/util/file";

type FileEvent = ChangeEvent<HTMLInputElement> & {
  target: EventTarget & { files: FileList };
};

const File = () => {
  const input = useRef<HTMLInputElement>(null);

  const midi = useState((state) => state.midi);
  const filename = useState((state) => state.filename);
  const humanizedNotes = useState((state) => state.humanizedNotes);

  const onClick = () => input?.current?.click();

  const onLoad = async ({ target }: FileEvent) => {
    const file = target?.files[0];
    const data = (await file.arrayBuffer()) || "";
    const midi = new Midi(data);

    useState.setState({ midi, filename: file.name });
    if (input.current) input.current.value = "";
  };

  const onSave = () => {
    if (!midi) return;
    midi.tracks[0].notes = humanizedNotes;
    downloadData(midi.toArray(), filename, "audio/midi");
  };

  return (
    <Group label={filename ? `File (${filename})` : "File"}>
      <input
        ref={input}
        onChange={onLoad}
        type="file"
        accept="audio/midi"
        style={{ display: "none" }}
      />
      <button onClick={onClick}>Load</button>
      <button onClick={onSave}>Save</button>
    </Group>
  );
};

export default File;
