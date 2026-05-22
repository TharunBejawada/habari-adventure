// apps/api/src/controllers/galleryController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

// GET: Fetch all gallery items
export const getAllGalleryItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" }, // Show newest items first
    });
    
    res.status(200).json({ status: "success", data: items });
  } catch (error: any) {
    console.error("Fetch Gallery Error:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch gallery items." });
  }
};

// POST: Create a new gallery item (Image or Video)
export const createGalleryItem = async (req: Request, res: Response) => {
  try {
    const { type, url, category, title } = req.body;

    if (!type || !url) {
      return res.status(400).json({ status: "error", message: "Type and URL are required." });
    }

    const newItem = await prisma.galleryItem.create({
      data: {
        type, // "IMAGE" or "VIDEO"
        url,
        category: category || null, // null for videos
        title: title || null,
      },
    });

    res.status(201).json({ status: "success", data: newItem });
  } catch (error: any) {
    console.error("Create Gallery Item Error:", error);
    res.status(500).json({ status: "error", message: "Failed to save gallery item." });
  }
};

// DELETE: Remove a gallery item and its physical file
export const deleteGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Find the item first to get its URL
    const item = await prisma.galleryItem.findUnique({
      where: { id: id as string },
    });

    if (!item) {
      return res.status(404).json({ status: "error", message: "Item not found." });
    }

    // 2. Delete from database
    await prisma.galleryItem.delete({
      where: { id: id as string },
    });

    // 3. Clean up the physical file if it's an uploaded image
    if (item.type === "IMAGE" && item.url.includes("/uploads/gallery/")) {
      // Extract just the filename from the URL
      const filename = item.url.split("/uploads/gallery/")[1];
      
      if (filename) {
        // Construct the path to your uploads folder. 
        // Adjust this path if your 'uploads' folder is located elsewhere!
        const filePath = path.join(__dirname, "../../uploads/gallery", filename); 
        
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error("Failed to delete physical file:", err);
          }
        });
      }
    }

    res.status(200).json({ status: "success", message: "Item deleted successfully." });
  } catch (error: any) {
    console.error("Delete Gallery Item Error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete gallery item." });
  }
};