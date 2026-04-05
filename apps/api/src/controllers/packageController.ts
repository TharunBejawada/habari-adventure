// apps/api/src/controllers/packageController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPackage = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newPackage = await prisma.package.create({ data });
    res.status(201).json({ status: "success", data: newPackage });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const { publishedOnly, category } = req.query;
    const whereClause: any = {};
    
    if (publishedOnly === 'true') whereClause.isPublished = true;
    if (category) whereClause.category = category;

    const packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, category: true, location: true, isPublished: true, bannerImage: true, createdAt: true }
    });
    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getPackageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const slugValue = Array.isArray(slug) ? slug[0] : slug;
    const pkg = await prisma.package.findUnique({ where: { slug: slugValue } });
    if (!pkg) return res.status(404).json({ status: "error", message: "Package not found" });
    res.status(200).json({ status: "success", data: pkg });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const updatedPackage = await prisma.package.update({
      where: { id: idValue },
      data
    });
    res.status(200).json({ status: "success", data: updatedPackage });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    await prisma.package.delete({ where: { id: idValue } });
    res.status(200).json({ status: "success", message: "Package deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getPackagesByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const locationStr = Array.isArray(location) ? location[0] : location;

    const packages = await prisma.package.findMany({
      where: {
        isPublished: true, // Only fetch published packages for the user facing UI
        location: {
          contains: locationStr,
          mode: 'insensitive' // Safely handles "Mt. Kilimanjaro" vs "mt kilimanjaro"
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};