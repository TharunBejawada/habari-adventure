// apps/api/src/controllers/bookingController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendEmail } from "../utils/mailer";

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

    // --- EMAIL LOGIC START ---

    // NEW: Fetch Email Settings from Database
    const emailConfig = await prisma.emailSettings.findFirst();

    // NEW: Define variables (fallback to .env if DB is empty to prevent crashes)
    const senderName = emailConfig?.senderName || process.env.SMTP_SENDER_NAME || "Habari Adventure Info";
    const senderEmail = emailConfig?.senderEmail || process.env.SMTP_SENDER_EMAIL || "info@habariadventure.com";
    const adminTo = emailConfig?.recipientTo || process.env.ADMIN_RECIPIENT_EMAIL;
    const adminCc = emailConfig?.ccEmails || process.env.ADMIN_CC_EMAIL;
    const adminBcc = emailConfig?.bccEmails || process.env.ADMIN_BCC_EMAIL;

    // Properly formatted dynamic "From" string
    const fromString = `"${senderName}" <${senderEmail}>`;
    
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Booking Request Received</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for reaching out! We have successfully received your inquiry.</p>
        <p>One of our travel experts will review your details and get back to you shortly.</p>
        <br/>
        <p>Best regards,<br/><strong>${senderName}</strong></p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>New Booking Inquiry: ${bookingType || 'General'}</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Package:</strong> ${packageName || 'N/A'}</p>
        <p><strong>Location:</strong> ${location || 'N/A'}</p>
        <p><strong>Travel Date:</strong> ${departureDate || monthYear || 'N/A'}</p>
        <p><strong>Group Size:</strong> ${groupSize || 'N/A'}</p>
        <p><strong>Trip Days:</strong> ${length || 'N/A'}</p>
        <br/>
        <p><strong>Message:</strong><br/>${message || 'No additional message.'}</p>
      </div>
    `;

    // Dispatch Client Email (Fire & Forget to avoid blocking the HTTP response)
    sendEmail({
      from: fromString, // NEW
      to: email,
      subject: "Booking inquiry! || Habari Adventure",
      html: clientHtml
    }).catch(console.error);

    // Dispatch Admin Email
    if (adminTo) {
      sendEmail({
        from: fromString, // NEW
        to: adminTo,
        cc: adminCc || undefined, // NEW
        bcc: adminBcc || undefined, // NEW
        subject: `New Booking: ${firstName} - ${packageName || bookingType}`,
        html: adminHtml
      }).catch(console.error);
    }
    
    // --- EMAIL LOGIC END ---

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