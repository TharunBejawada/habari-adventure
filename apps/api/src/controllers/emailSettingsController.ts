// apps/api/src/controllers/emailSettingsController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getEmailSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.emailSettings.findUnique({
      where: { id: "default" }
    });

    // If it doesn't exist yet, return a blank template
    if (!settings) {
      settings = {
        id: "default",
        senderName: process.env.SMTP_SENDER_NAME || "",
        senderEmail: process.env.SMTP_SENDER_EMAIL || "",
        recipientTo: process.env.ADMIN_RECIPIENT_EMAIL || "",
        ccEmails: process.env.ADMIN_CC_EMAIL || "",
        bccEmails: process.env.ADMIN_BCC_EMAIL || "",
        updatedAt: new Date(),
      };
    }

    res.status(200).json({ status: "success", data: settings });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateEmailSettings = async (req: Request, res: Response) => {
  try {
    const { senderName, senderEmail, recipientTo, ccEmails, bccEmails } = req.body;

    const updatedSettings = await prisma.emailSettings.upsert({
      where: { id: "default" },
      update: { senderName, senderEmail, recipientTo, ccEmails, bccEmails },
      create: { 
        id: "default", 
        senderName, 
        senderEmail, 
        recipientTo, 
        ccEmails, 
        bccEmails 
      },
    });

    res.status(200).json({ status: "success", data: updatedSettings });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};