import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageFromBuffer(
  buffer: Buffer,
  folder = "lq-shop"
) {
  const res = await new Promise<{ url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(buffer);
    }
  );
  return res;
}

export default cloudinary;
