import { Request, Response } from "express";
import {prisma} from "../prisma";

export const getAllPricing = async (req: Request, res: Response) => {
  try {
    const pricing = await prisma.packagePricing.findMany({
      include: { package: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: "success", data: pricing });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const upsertPricing = async (req: Request, res: Response) => {
  try {
    const { packageId, tier1, tier2, tier3, tier4 } = req.body;

    const pricing = await prisma.packagePricing.upsert({
      where: { packageId },
      update: {
        tier1: Number(tier1),
        tier2: Number(tier2),
        tier3: Number(tier3),
        tier4: Number(tier4),
      },
      create: {
        packageId,
        tier1: Number(tier1),
        tier2: Number(tier2),
        tier3: Number(tier3),
        tier4: Number(tier4),
      },
      include: { package: { select: { title: true } } }
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