// apps/api/src/utils/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1. Read the folder name sent from the frontend (e.g., "blogs")
    const folderName = req.body.folder || ""; 
    
    // 2. Build the exact dynamic path
    const uploadDir = path.join(process.cwd(), "uploads", folderName);

    // 3. Create the folder dynamically if it doesn't exist yet!
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // Images & Video
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif", 
    "video/mp4",
    // Documents
    "application/pdf", // For .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // For .docx
    "application/msword" // For older .doc
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, GIF, MP4, PDF, DOCX, and DOC are allowed."));
  }
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter 
});