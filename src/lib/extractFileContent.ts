export type BinaryFileContent = {
  kind: "binary";
  mimeType: string;
  base64: string;
  name: string;
  size: number;
};

export type TextFileContent = {
  kind: "text";
  text: string;
  name: string;
  size: number;
};

export type FileContent = BinaryFileContent | TextFileContent;

const BINARY_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const DOCX_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function extractFileContent(file: File): Promise<FileContent> {
  if (BINARY_TYPES.has(file.type)) {
    const base64 = await toBase64(file);
    return {
      kind: "binary",
      mimeType: file.type,
      base64,
      name: file.name,
      size: file.size,
    };
  }

  if (DOCX_TYPES.has(file.type)) {
    const text = await extractDocxText(file);
    return { kind: "text", text, name: file.name, size: file.size };
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = reject;
  });
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}
