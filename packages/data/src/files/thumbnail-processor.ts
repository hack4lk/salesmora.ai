import sharp from 'sharp';

export interface ThumbnailOptions {
  width: number;
  height: number;
  fit?: keyof typeof sharp.fit;
}

const DEFAULT_THUMBNAIL_OPTIONS: ThumbnailOptions = {
  width: 256,
  height: 256,
  fit: 'cover',
};

/**
 * Generate a thumbnail from image bytes.
 * Returns null if the input is not a valid image.
 */
export async function generateThumbnail(
  imageBytes: Buffer,
  options: Partial<ThumbnailOptions> = {}
): Promise<Buffer | null> {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };

  try {
    const metadata = await sharp(imageBytes).metadata();

    // Only generate thumbnails for images
    if (!metadata.format || !['jpeg', 'png', 'webp', 'gif', 'heif'].includes(metadata.format)) {
      return null;
    }

    const thumbnail = await sharp(imageBytes)
      .rotate() // auto-rotate based on EXIF
      .resize(opts.width, opts.height, { fit: opts.fit as any, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return thumbnail;
  } catch {
    return null;
  }
}

/**
 * Convert HEIC image to JPEG.
 * Returns null if conversion fails or input is not HEIC.
 */
export async function convertHeicToJpeg(heicBytes: Buffer): Promise<Buffer | null> {
  try {
    const metadata = await sharp(heicBytes).metadata();

    // Only convert HEIC/HEIF files
    if (metadata.format !== 'heif') {
      return null;
    }

    const jpeg = await sharp(heicBytes)
      .rotate() // auto-rotate based on EXIF
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    return jpeg;
  } catch {
    return null;
  }
}

/**
 * Detect if an image is HEIC format.
 */
export async function isHeic(imageBytes: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBytes).metadata();
    return metadata.format === 'heif';
  } catch {
    return false;
  }
}

/**
 * Detect if the file is a valid image that can be processed.
 */
export async function isProcessableImage(fileBytes: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(fileBytes).metadata();
    return !!metadata.format && ['jpeg', 'png', 'webp', 'gif', 'heif'].includes(metadata.format);
  } catch {
    return false;
  }
}
