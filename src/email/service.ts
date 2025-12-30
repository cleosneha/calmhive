import nodemailer from "nodemailer";

/**
 * Email service configuration for CalmHive
 * Uses Gmail SMTP with app-specific password for security
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export default transporter;
