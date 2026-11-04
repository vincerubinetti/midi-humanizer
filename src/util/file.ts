/** download array buffer */
export const downloadData = (
  data: Uint8Array,
  filename: string,
  mimeType: string,
) => {
  const blob = new Blob([data as BlobPart], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
