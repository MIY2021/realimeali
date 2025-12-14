export interface CompressedImage {
  file: File;
  url: string;
  size: number;
}

export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            url: URL.createObjectURL(compressedFile),
            size: compressedFile.size,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function generateThumbnail(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<CompressedImage> {
  return compressImage(file, maxWidth, maxHeight, 0.8);
}

/**
 * Generate a thumbnail from an image URL
 * Fetches the image, converts it to a File, then generates thumbnail
 */
export async function generateThumbnailFromUrl(imageUrl: string): Promise<CompressedImage> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { 
      type: blob.type || 'image/jpeg',
      lastModified: Date.now()
    });
    
    // Use existing generateThumbnail function
    return await generateThumbnail(file);
  } catch (error) {
    console.error('Error generating thumbnail from URL:', error);
    throw error;
  }
}
