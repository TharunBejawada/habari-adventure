import { Request, Response } from "express";
import { prisma } from "../prisma";

// POST: Create a new booking/quote request
export const createBooking = async (req: Request, res: Response) => {
  try {
    // 1. Destructure the flexible payload
    const { 
      bookingType, 
      firstName, 
      lastName, 
      email, 
      phone, 
      location, 
      packageName, 
      departureDate, 
      monthYear, 
      length, 
      groupSize, 
      message 
    } = req.body;

    // 2. Basic validation for strictly required fields
    if (!firstName || !email) {
      return res.status(400).json({ 
        status: "error", 
        message: "First name and email are required." 
      });
    }

    // 3. Create the booking, mapping empty fields to null safely
    const newBooking = await prisma.booking.create({
      data: {
        bookingType: bookingType || "General",
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        location: location || null,
        packageName: packageName || null,
        departureDate: departureDate || null,
        monthYear: monthYear || null,
        length: length ? length.toString() : null, // Safely cast to string if provided
        groupSize: groupSize ? groupSize.toString() : null,
        message: message || null,
      }
    });

    res.status(201).json({ 
      status: "success", 
      data: newBooking, 
      message: "Booking inquiry submitted successfully!" 
    });
  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to submit booking. Please try again." 
    });
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
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};