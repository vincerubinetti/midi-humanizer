import type { DragEventHandler } from "react";
import { useRef, useState } from "react";
import { useEventListener } from "@reactuses/core";
import { Midi } from "@tonejs/midi";
import clsx from "clsx";
import { useAtom } from "jotai";
import { startCase } from "lodash";
import Tooltip from "@/components/Tooltip";
import { filename, humanized, midi } from "@/state";
import { downloadData } from "@/util/file";

export default function File() {
  /** global state */
  const [getMidi, setMidi] = useAtom(midi);
  const [getFilename, setFilename] = useAtom(filename);
  const [getHumanized] = useAtom(humanized);

  /** local state */
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  /** upload file */
  const onLoad = async (file: File) => {
    try {
      /** get data from file upload */
      const data = (await file.arrayBuffer()) || "";

      /** parse midi */
      const midi = new Midi(data);
      console.debug(midi);

      /** set state data */
      if (!midi.name) midi.name = startCase(file.name.replace(/\.midi?$/, ""));
      setMidi(midi);
      setFilename(file.name);
    } catch (error) {
      console.error(error);
    }

    /** reset file input so the same file could be re-selected */
    if (input.current) input.current.value = "";
  };

  /** save file */
  const onSave = () => {
    if (!getHumanized) return;
    downloadData(getHumanized.toArray(), getFilename, "audio/midi");
  };

  /** add drag enter listener to window, because overlay not interactable until dragging started */
  useEventListener("dragenter", () => setDragging(true), window);

  /** on button file drop */
  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onLoad(file as unknown as File);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <input
        ref={input}
        onChange={(event) => {
          const file = event.target?.files?.[0];
          if (file) onLoad(file);
        }}
        type="file"
        accept="audio/midi"
        className="hidden"
      />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div>{getMidi?.name}</div>
        <div>{getFilename}</div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Tooltip content="Load MIDI file. Or drag and drop file onto window.">
          <button className="w-40" onClick={() => input?.current?.click()}>
            Load
          </button>
        </Tooltip>
        <button className="w-40" onClick={onSave}>
          Save
        </button>
      </div>
      <div
        className={clsx(
          "fixed inset-0 z-100 grid place-items-center bg-black/75 text-white",
          dragging
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDrop(event);
        }}
      >
        Drop MIDI File
      </div>
    </div>
  );
}
