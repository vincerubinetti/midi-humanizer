import { useRef, useState } from "react";
import { useEventListener } from "@reactuses/core";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import Tooltip from "@/components/Tooltip";
import { fileAtom, load, midiAtom, mimeType, pickerTypes, save } from "@/state";
import { loadFileDrop, loadFilePicker } from "@/util/file";

export default function File({ className = "" }) {
  /** global state */
  const midi = useAtomValue(midiAtom);
  const file = useAtomValue(fileAtom);

  /** local state */
  const [dragging, setDragging] = useState(false);
  const [loadMessage, setLoadMessage] = useMessage();
  const [saveMessage, setSaveMessage] = useMessage();

  /** add drag enter listener to window, because overlay not interactable until dragging started */
  useEventListener("dragenter", () => setDragging(true), window);

  return (
    <div className={clsx("flex flex-wrap items-center gap-4", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div>{midi?.name}</div>
        <div>{file?.name}</div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 *:w-32">
        <Tooltip content="Load MIDI file. Or drag and drop file onto window.">
          <button
            onClick={async () => {
              /** load file from picker */
              const picked = await loadFilePicker(pickerTypes, mimeType);

              /** user canceled */
              if (!picked) return;

              /** load file into state */
              const { file, handle } = picked;
              load(file, handle);
              setLoadMessage("Success");
            }}
          >
            {loadMessage || "Load"}
          </button>
        </Tooltip>
        <Tooltip content="Save new file or in place of originally opened file.">
          <button
            onClick={async () => {
              if (await save()) setSaveMessage("Success");
            }}
          >
            {saveMessage || "Save"}
          </button>
        </Tooltip>
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
        onDrop={async (event) => {
          /** handle event */
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);

          /** load file from drop */
          const picked = await loadFileDrop(event.dataTransfer);
          /** user canceled */
          if (!picked) return;

          /** load file into state */
          const { file, handle } = picked;
          await load(file, handle);
          setLoadMessage("Success");
        }}
      >
        Drop MIDI File
      </div>
    </div>
  );
}

/** message with timeout */
const useMessage = () => {
  const [message, _setMessage] = useState("");
  const timer = useRef(0);
  const setMessage = (message: string, time = 1000) => {
    window.clearTimeout(timer.current);
    _setMessage(message);
    timer.current = window.setTimeout(() => _setMessage(""), time);
  };
  return [message, setMessage] as const;
};
