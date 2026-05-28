// apps/api/src/utils/mailer.ts
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export const sendEmail = async (payload: EmailPayload) => {
  try {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        pool: true,             // 1. Enable connection pooling
        maxConnections: 1,      // 2. Force a single connection to bypass the 421 error
        maxMessages: 100,       // 3. Allow multiple messages on this single connection
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false 
        },
        // logger: true,
        // debug: true,
      });
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_SENDER_EMAIL}>`,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
    });
    
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};