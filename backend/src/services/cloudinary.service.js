import cloudinary, { configureCloudinary } from "../config/cloudinary.js";
import { Readable } from "stream";

const getPdfPublicId = (folder, originalName = "resume.pdf") => {
  const safeBaseName = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "resume";

  return `${folder}/${Date.now()}-${safeBaseName}.pdf`;
};

export const uploadBufferToCloudinary = (buffer, folder, originalName) => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: getPdfPublicId(folder, originalName),
        resource_type: "raw",
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
};
