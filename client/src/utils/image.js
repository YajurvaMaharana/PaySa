export const compressImage = (file, maxSize = 1280, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Quick check for unsupported types like HEIC if the browser can't handle it
    // Usually browsers don't natively render HEIC to canvas without a library
    if (file.type === "image/heic" || file.type === "image/heif") {
      return reject(new Error("unsupportedImage"));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        
        // Strip the data prefix
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType: "image/jpeg" });
      };
      img.onerror = () => {
        reject(new Error("IMAGE_READ_FAILED"));
      };
    };
    reader.onerror = () => {
      reject(new Error("IMAGE_READ_FAILED"));
    };
  });
};
