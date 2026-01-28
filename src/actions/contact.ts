"use server";

import { contactSchema, ContactFormData } from "@/schemas/contact";
import transporter from "@/email/service";
import { logEmailSuccess, logEmailError } from "@/email/utils";
import { generateContactEmailHTML } from "@/email/templates/contact-email";

export async function sendContactEmail(
  formData: ContactFormData,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate the form data
    const validatedData = contactSchema.parse(formData);

    // Create HTML email content
    const htmlContent = generateContactEmailHTML(
      validatedData.name,
      validatedData.email,
      validatedData.body,
    );

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "celersneha@gmail.com",
      subject: `CalmHive Contact Form - Message from ${validatedData.name}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    logEmailSuccess(
      "celersneha@gmail.com",
      `Contact Form - ${validatedData.name}`,
      info.messageId,
    );

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Contact form submission error:", error);

    if (error instanceof Error) {
      logEmailError("celersneha@gmail.com", "Contact Form Submission", error);
    }

    return {
      success: false,
      message: "Failed to send message. Please try again later.",
    };
  }
}
