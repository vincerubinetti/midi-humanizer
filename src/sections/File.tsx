import { ChangeEvent, useRef } from "react";
import { useAtom } from "jotai";
import { Midi } from "@tonejs/midi";
import Button from "@/components/Button";
import Group from "@/components/Group";
import { filename, humanized, incSeed, midi, options } from "@/state";
import { downloadData } from "@/util/file";

type FileEvent = ChangeEvent<HTMLInputElement> & {
  target: EventTarget & { files: FileList };
};

const File = () => {
  const input = useRef<HTMLInputElement>(null);

  const [, setMidi] = useAtom(midi);
  const [getOptions] = useAtom(options);
  const [getFilename, setFilename] = useAtom(filename);
  const [getHumanized] = useAtom(humanized);

  /** click actual file input on button click */
  const onClick = () => input?.current?.click();

  /** upload file */
  const onLoad = async ({ target }: FileEvent) => {
    /** get data from file upload */
    const file = target?.files[0];
    const data = (await file.arrayBuffer()) || "";

    /** parse midi */
    const midi = new Midi(data);
    console.info(midi);

    /** set state data */
    setMidi(midi);
    setFilename(file.name);

    /** increment seeds */
    if (getOptions.incSeed) incSeed();

    /** reset file input so the same file could be re-selected */
    if (input.current) input.current.value = "";
  };

  /** save file */
  const onSave = () => {
    if (!getHumanized) return;
    downloadData(getHumanized.toArray(), getFilename, "audio/midi");
  };

  return (
    <Group label="File">
      <input
        ref={input}
        onChange={onLoad}
        type="file"
        accept="audio/midi"
        style={{ display: "none" }}
      />
      <Button onClick={onClick}>Load</Button>
      <Button onClick={onSave}>Save</Button>
    </Group>
  );
};

export default File;
