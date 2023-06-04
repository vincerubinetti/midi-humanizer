import { DragEventHandler, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Midi } from "@tonejs/midi";
import Button from "@/components/Button";
import Group from "@/components/Group";
import { filename, humanized, incSeed, midi, options, preview } from "@/state";
import { downloadData } from "@/util/file";
import classes from "./File.module.css";

const File = () => {
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const [, setMidi] = useAtom(midi);
  const [getOptions] = useAtom(options);
  const [getFilename, setFilename] = useAtom(filename);
  const [getHumanized] = useAtom(humanized);

  /** click actual file input on button click */
  const onClick = () => input?.current?.click();

  /** upload file */
  const onLoad = async (file: File) => {
    if (file.type !== "audio/midi") return;

    /** get data from file upload */
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

  /** on button drag file over, set drag flag on */
  const onDragEnter = () => setDragging(true);

  /** add drag enter listener to window, because overlay not interactable until dragging started */
  useEffect(() => {
    window.addEventListener("dragenter", onDragEnter);
    () => window.removeEventListener("dragenter", onDragEnter);
  });

  /** on button drag file off, set drag flag off */
  const onDragLeave = () => setDragging(false);

  /** on button drag file */
  const onDragOver: DragEventHandler<HTMLDivElement> = (event) =>
    event.preventDefault();

  /** on button file drop */
  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onLoad(file as unknown as File);
  };

  return (
    <Group label="File">
      <input
        ref={input}
        onChange={(event) => {
          const file = event.target?.files?.[0];
          if (file) onLoad(file);
        }}
        type="file"
        accept="audio/midi"
        style={{ display: "none" }}
      />
      <Button onClick={onClick}>Load</Button>
      <Button onClick={onSave}>Save</Button>
      <Button onClick={preview}>Preview</Button>
      <div
        className={classes.overlay}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        data-dragging={dragging}
      >
        Drop MIDI File
      </div>
    </Group>
  );
};

export default File;
