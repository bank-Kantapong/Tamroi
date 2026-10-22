/**
 * Client-side image compressor utility for TAMROI.
 * Resizes large images (e.g. 5-10MB camera shots) to max 1920px while preserving
 * sharp edge detail and vibrant colors with bicubic high-quality canvas smoothing.
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number; // 0.1 to 1.0
  targetFormat?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const maxDimension = options.maxDimension || 1920;
  const quality = options.quality !== undefined ? options.quality : 0.88;
  const targetFormat = options.targetFormat || "image/webp";

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (file.type && !file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if larger than max dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        reject(new Error("Unable to create canvas context for image compression."));
        return;
      }

      // High quality interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas blob conversion failed."));
            return;
          }

          const fileExt = targetFormat === "image/webp" ? "webp" : "jpg";
          const fileName = "name" in file ? (file as File).name : "photo.jpg";
          const baseName = fileName.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${baseName}.${fileExt}`, {
            type: targetFormat,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression."));
    };

    img.src = objectUrl;
  });
}

