import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getAllPricing = async (req: Request, res: Response) => {
  try {
    const pricing = await prisma.packagePricing.findMany({
      include: { package: { select: { title: true, slug: true, location: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: "success", data: pricing });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const upsertPricing = async (req: Request, res: Response) => {
  try {
    // Destructure all possible fields
    const { 
      packageId, pricingType, 
      tier1, tier2, tier3, tier4,
      campTier1, campTier2, campTier3, campTier4,
      midTier1, midTier2, midTier3, midTier4,
      luxTier1, luxTier2, luxTier3, luxTier4
    } = req.body;

    const dataPayload = {
      pricingType: pricingType || "Standard",
      tier1: Number(tier1 || 0),
      tier2: Number(tier2 || 0),
      tier3: Number(tier3 || 0),
      tier4: Number(tier4 || 0),
      campTier1: campTier1 ? Number(campTier1) : null,
      campTier2: campTier2 ? Number(campTier2) : null,
      campTier3: campTier3 ? Number(campTier3) : null,
      campTier4: campTier4 ? Number(campTier4) : null,
      midTier1: midTier1 ? Number(midTier1) : null,
      midTier2: midTier2 ? Number(midTier2) : null,
      midTier3: midTier3 ? Number(midTier3) : null,
      midTier4: midTier4 ? Number(midTier4) : null,
      luxTier1: luxTier1 ? Number(luxTier1) : null,
      luxTier2: luxTier2 ? Number(luxTier2) : null,
      luxTier3: luxTier3 ? Number(luxTier3) : null,
      luxTier4: luxTier4 ? Number(luxTier4) : null,
    };

    const pricing = await prisma.packagePricing.upsert({
      where: { packageId },
      update: dataPayload,
      create: { packageId, ...dataPayload },
      include: { package: { select: { title: true, location: true } } }
    });

    res.status(200).json({ status: "success", data: pricing });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deletePricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.packagePricing.delete({ where: { id: id as string } });
    res.status(200).json({ status: "success", message: "Pricing deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};