import { Request, Response } from "express";
import { prisma } from "../prisma";

// POST: Create a new booking/quote request
export const createBooking = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    const newBooking = await prisma.booking.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone || null,
        monthYear: data.monthYear,
        length: data.length.toString(),
        groupSize: data.groupSize,
        include: data.include,
        message: data.message,
      }
    });

    res.status(201).json({ status: "success", data: newBooking });
  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    res.status(400).json({ status: "error", message: error.message });
  }
};

// GET: Fetch all bookings for the Admin Dashboard
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // Fetches all bookings, newest first
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({ status: "success", data: bookings });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};