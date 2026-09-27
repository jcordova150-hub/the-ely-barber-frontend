// Reduce una foto elegida por el usuario (las del celular pesan varios MB) a un JPEG ligero en base64,
// para guardarla directamente en la base de datos del barbero.
export function resizeImageToDataUrl(file, maxSide = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Elige un archivo de imagen (JPG, PNG o WEBP)"));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // fondo para PNG con transparencia
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer esa imagen, prueba con otra (JPG o PNG)"));
    };

    img.src = url;
  });
}
