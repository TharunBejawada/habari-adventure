import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ status: "success", data: locations });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getLocationBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const location = await prisma.location.findUnique({ where: { slug: slug as string } });
    if (!location) return res.status(404).json({ status: "error", message: "Location not found" });
    res.status(200).json({ status: "success", data: location });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const newLocation = await prisma.location.create({ data: req.body });
    res.status(201).json({ status: "success", data: newLocation });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedLocation = await prisma.location.update({
      where: { id: id as string },
      data: req.body
    });
    res.status(200).json({ status: "success", data: updatedLocation });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id: id as string } });
    res.status(200).json({ status: "success", message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};