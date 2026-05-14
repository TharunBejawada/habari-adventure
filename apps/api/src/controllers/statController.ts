import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json({ status: "success", data: stats });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createStat = async (req: Request, res: Response) => {
  try {
    const { label, value, suffix, order } = req.body;
    const newStat = await prisma.stat.create({
      data: { label, value: Number(value), suffix, order: Number(order) }
    });
    res.status(201).json({ status: "success", data: newStat });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateStat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, value, suffix, order } = req.body;
    const updatedStat = await prisma.stat.update({
      where: { id: id as string },
      data: { label, value: Number(value), suffix, order: Number(order) }
    });
    res.status(200).json({ status: "success", data: updatedStat });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteStat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.stat.delete({ where: { id: id as string } });
    res.status(200).json({ status: "success", message: "Stat deleted" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};