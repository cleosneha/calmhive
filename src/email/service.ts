import nodemailer from "nodemailer";
import { generateWeeklyInsightsEmailHTML } from "./templates/weekly-insights";
import { logEmailSuccess, logEmailError, EmailResult } from "./utils";

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

/**
 * Send weekly insights notification email to user
 */
export async function sendWeeklyInsightsEmail(
  userEmail: string,
  userName: string,
): Promise<EmailResult> {
  try {
    const htmlContent = generateWeeklyInsightsEmailHTML(userName);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: "📊 Your Weekly Updates Are Ready - CalmHive",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    logEmailSuccess(userEmail, "Weekly Insights Notification", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logEmailError(userEmail, "Weekly Insights Notification", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
