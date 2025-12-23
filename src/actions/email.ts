"use server";
import nodemailer from "nodemailer";

export async function sendMail(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "celersneha@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: formData.email,
      to: "celersneha@gmail.com",
      subject: `[Calmhive] ${formData.subject}`,
      text: `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
