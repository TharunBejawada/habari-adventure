// apps/api/src/controllers/uploadController.ts
import { Request, Response } from "express";

export const uploadFile = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ status: "error", message: "No file uploaded" });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "File upload failed" });
  }
};