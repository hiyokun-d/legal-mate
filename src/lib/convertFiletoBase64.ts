export async function convertToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        // remove the prefix "data:image/png;base64," so the we just have the normal data
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else
        reject(
          new Error("There's something went wrong when converting the file"),
        );
    };

    reader.onerror = (error) => reject(error);
  });
}
