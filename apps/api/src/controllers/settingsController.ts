// apps/api/src/controllers/settingsController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

// Helper to always get the single settings record
const getSingletonSettings = async () => {
  let settings = await prisma.globalSettings.findFirst();
  if (!settings) {
    // If it doesn't exist yet, create the default blank slate
    settings = await prisma.globalSettings.create({
      data: {
        headerMenu: [],
        socialLinks: [],
        footerColumns: [],
      }
    });
  }
  return settings;
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getSingletonSettings();
    res.status(200).json({ status: "success", data: settings });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await getSingletonSettings();
    
    // Extract everything from the request body
    const { 
      headerMenu, websiteInfo, phoneNumber, email, address, 
      socialLinks, footerColumns
    } = req.body;

    const updatedSettings = await prisma.globalSettings.update({
      where: { id: existing.id },
      data: {
        headerMenu: headerMenu ? headerMenu : existing.headerMenu,
        websiteInfo, phoneNumber, email, address,
        socialLinks: socialLinks ? socialLinks : existing.socialLinks,
        footerColumns: footerColumns ? footerColumns : existing.footerColumns,
      }
    });

    res.status(200).json({ status: "success", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to update settings" });
  }
};