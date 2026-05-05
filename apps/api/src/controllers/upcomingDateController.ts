import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getUpcomingDates = async (req: Request, res: Response) => {
  try {
    const dates = await prisma.upcomingDate.findMany({
      // FIX: Added location: true so the frontend filter works
      include: { package: { select: { title: true, slug: true, location: true } } },
      orderBy: { startDate: 'asc' },
    });
    res.status(200).json({ status: "success", data: dates });
  } catch (error: any) {
    console.error("Fetch dates error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createUpcomingDate = async (req: Request, res: Response) => {
  try {
    // NEW: Added isChristmas and isNewYear
    const { packageId, title, startDate, endDate, price, isFullMoon, isChristmas, isNewYear, totalSeats, availableSeats, status } = req.body;
    
    const newDate = await prisma.upcomingDate.create({
      data: {
        packageId, title, price: Number(price), isFullMoon, isChristmas, isNewYear,
        totalSeats: Number(totalSeats), availableSeats: Number(availableSeats || totalSeats),
        status, startDate: new Date(startDate), endDate: new Date(endDate)
      },
      // Ensure we return the package data for the live UI update
      include: { package: { select: { title: true, slug: true, location: true } } }
    });
    res.status(201).json({ status: "success", data: newDate });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateUpcomingDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { packageId, title, startDate, endDate, price, isFullMoon, isChristmas, isNewYear, totalSeats, availableSeats, status } = req.body;
    
    const updatedDate = await prisma.upcomingDate.update({
      where: { id: id as string },
      data: {
        packageId, title, price: Number(price), isFullMoon, isChristmas, isNewYear,
        totalSeats: Number(totalSeats), availableSeats: Number(availableSeats),
        status, startDate: new Date(startDate), endDate: new Date(endDate)
      },
      // Added location: true here as well
      include: { package: { select: { title: true, slug: true, location: true } } }
    });
    
    res.status(200).json({ status: "success", data: updatedDate });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteUpcomingDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.upcomingDate.delete({ where: { id: id as string } });
    res.status(200).json({ status: "success", message: "Date deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};