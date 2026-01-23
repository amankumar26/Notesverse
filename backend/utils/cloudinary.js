// backend/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path"; // Import Node.js's path module

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // --- THIS IS THE NEW DYNAMIC CONFIGURATION ---

    // 1. Get the file extension from the original filename (e.g., ".pdf")
    const fileExt = path.extname(file.originalname);

    // 2. Get the filename without the extension
    const baseName = path.basename(file.originalname, fileExt);

    // 3. Sanitize the base name: replace all non-alphanumeric characters with a hyphen
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "-");

    // 4. Create a unique filename using the sanitized name, a timestamp, and a random number
    const uniqueFileName = `${sanitizedBaseName}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    return {
      folder: "noteverse_files",
      allowed_formats: ["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg"],
      public_id: uniqueFileName, // Use our new safe and unique filename
      transformation: [
        {
          fetch_format: "jpg",
          page: 1,
          width: 400,
          crop: "limit",
        },
      ],
    };
  },
});

export { cloudinary, storage };
