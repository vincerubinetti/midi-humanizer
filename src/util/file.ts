/** permission to request for file system handle */
const permission: FileSystemHandlePermissionDescriptor = { mode: "readwrite" };

/** whether error is user cancelling a picker */
const canceled = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

/** load file w/ picker */
export const loadFilePicker = async (
  pickerTypes: FilePickerAcceptType[],
  mimeType: string,
) => {
  try {
    /** try file picker */
    const handle = (await window.showOpenFilePicker({ types: pickerTypes }))[0];
    const file = await handle.getFile();
    return { file, handle };
  } catch (error) {
    console.warn(error);
    if (canceled(error)) return;

    /** fallback to file input element */
    const file = await new Promise<File | undefined>((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = mimeType;
      input.onchange = () => resolve(input?.files?.[0]);
      input.oncancel = () => resolve(undefined);
      input.click();
    });
    if (!file) return;
    return { file, handle: undefined };
  }
};

/** load file from drag/drop event */
export const loadFileDrop = async (data: DataTransfer) => {
  try {
    /** try to get file handle */
    const result = await data.items?.[0]?.getAsFileSystemHandle();
    /** ensure result is file handle */
    if (!(result && result.kind === "file")) throw Error("Not a file handle");
    const handle = result as FileSystemFileHandle;
    const file = await handle.getFile();
    return { file, handle };
  } catch (error) {
    console.warn(error);

    /** fall back to just file */
    const file = data.files?.[0];
    if (!file) return;
    return { file, handle: undefined };
  }
};

/** save file */
export const saveFile = async (
  data: BlobPart,
  handle: FileSystemFileHandle | undefined,
  filename: string,
  pickerTypes: FilePickerAcceptType[],
  mimeType: string,
) => {
  try {
    /** if no existing file handle, try file picker */
    handle ||= await window.showSaveFilePicker({
      suggestedName: filename,
      types: pickerTypes,
    });
    /** try to save in place */
    const file = await downloadInPlace(handle, data);
    return { file, handle };
  } catch (error) {
    console.warn(error);
    if (canceled(error)) return;

    /** fall back to regular download */
    const file = downloadNew(data as BlobPart, filename, mimeType);
    return { file, handle: undefined };
  }
};

/** write data to existing file handle */
const downloadInPlace = async (
  handle: FileSystemFileHandle,
  data: FileSystemWriteChunkType,
) => {
  /** get needed permission to write to file handle */
  if (
    (await handle.queryPermission(permission)) !== "granted" &&
    (await handle.requestPermission(permission)) !== "granted"
  )
    throw Error("Permission denied");

  /** write stream */
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
  return await handle.getFile();
};

/** save data to new file */
const downloadNew = (data: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  return new File([blob], filename, { type: blob.type });
};
