import { Request, Response } from "express";
import {prisma} from "../prisma";

export const getUpcomingDates = async (req: Request, res: Response) => {
  try {
    const dates = await prisma.upcomingDate.findMany({
      // FIX: Removed 'length' from the select statement
      include: { package: { select: { title: true, slug: true } } },
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
    const { packageId, title, startDate, endDate, price, isFullMoon, totalSeats, availableSeats, status } = req.body;
    
    const newDate = await prisma.upcomingDate.create({
      data: {
        packageId, title, price: Number(price), isFullMoon, 
        totalSeats: Number(totalSeats), availableSeats: Number(availableSeats || totalSeats),
        status, startDate: new Date(startDate), endDate: new Date(endDate)
      }
    });
    res.status(201).json({ status: "success", data: newDate });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// NEW: Update function for Editing
export const updateUpcomingDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { packageId, title, startDate, endDate, price, isFullMoon, totalSeats, availableSeats, status } = req.body;
    
    const updatedDate = await prisma.upcomingDate.update({
      where: { id: id as string },
      data: {
        packageId, title, price: Number(price), isFullMoon, 
        totalSeats: Number(totalSeats), availableSeats: Number(availableSeats),
        status, startDate: new Date(startDate), endDate: new Date(endDate)
      },
      // Return the package data so the UI updates instantly
      include: { package: { select: { title: true, slug: true } } }
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