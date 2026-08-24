// apps/api/src/controllers/uploadController.ts
import { Request, Response } from "express";
import { isCloudStorageEnabled, uploadToCloud } from "../utils/storage";
import { buildUniqueFilename } from "../utils/upload";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ status: "error", message: "No file uploaded" });
      return;
    }

    // 1. Check if the frontend specified a folder (like "blogs")
    const subFolder = req.body.folder ? `${req.body.folder}/` : "";

    let fileUrl: string;
    let filename: string;

    if (isCloudStorageEnabled) {
      filename = buildUniqueFilename(req.file.originalname);
      fileUrl = await uploadToCloud(req.file.buffer, `${subFolder}${filename}`, req.file.mimetype);
    } else {
      filename = req.file.filename;
      // 2. Construct the exact URL that Express static serving expects
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${subFolder}${filename}`;
    }

    res.status(200).json({
      status: "success",
      data: {
        url: fileUrl, // This correctly formatted URL fixes the broken images
        filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "File upload failed" });
  }
};
