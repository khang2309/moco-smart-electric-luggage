'use server';

import cloudinary from './cloudinary';

export async function uploadImageToCloudinary(file: File): Promise<{ secureUrl: string; publicId: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'moco-products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    const res = result as any;
    return {
      secureUrl: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
}
