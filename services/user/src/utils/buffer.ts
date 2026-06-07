export const getBuffer = (file : any) => {
  const base64 = file.buffer.toString("base64");

  const dataURI = `data:${file.mimetype};base64,${base64}`;

  return dataURI;
}