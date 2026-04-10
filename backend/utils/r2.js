import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - The name of the file
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToR2 = async (fileBuffer, fileName, contentType) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    // Return the public URL if configured, otherwise return the R2 path
    const publicUrl = process.env.R2_PUBLIC_URL;
    return publicUrl ? `${publicUrl}/${fileName}` : `${process.env.R2_ENDPOINT}/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("R2 Upload Error:", error);
    throw error;
  }
};

export default s3Client;
