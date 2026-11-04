import type { DragEventHandler } from "react";
import { useRef, useState } from "react";
import { useEventListener } from "@reactuses/core";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import Tooltip from "@/components/Tooltip";
import { fileAtom, loadFile, midiAtom, saveFile } from "@/state";

export default function File({ className = "" }) {
  /** global state */
  const midi = useAtomValue(midiAtom);
  const file = useAtomValue(fileAtom);

  /** local state */
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  /** upload file */
  const onLoad = async (file: File) => {
    await loadFile(file);

    /** reset file input so the same file could be re-selected */
    if (input.current) input.current.value = "";
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
    <div className={clsx("flex flex-wrap items-center gap-4", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div>{midi?.name}</div>
        <div>{file?.name}</div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
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
        <Tooltip content="Load MIDI file. Or drag and drop file onto window.">
          <button className="w-40" onClick={() => input?.current?.click()}>
            Load
          </button>
        </Tooltip>
        <button className="w-40" onClick={saveFile}>
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
