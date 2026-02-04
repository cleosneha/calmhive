"use server";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

interface Entry {
  id: number;
  title: string;
  content: string;
  mood?: string;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export async function generateEntryPDF(entry: Entry): Promise<string> {
  try {
    /* ---------------- PDF Setup ---------------- */
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold,
    );

    /* ---------------- Logo ---------------- */
    const logoPath = path.join(process.cwd(), "public", "calmhive.png");
    let logoImage;

    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    }

    if (logoImage) {
      const logoDims = logoImage.scale(0.2);
      const logoX = (width - logoDims.width) / 2;

      page.drawImage(logoImage, {
        x: logoX,
        y: height - 100,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    /* ---------------- Title ---------------- */
    page.drawText(entry.title, {
      x: 50,
      y: height - 140,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    let yPosition = height - 180;

    /* ---------------- Metadata ---------------- */
    // Created date on the left
    page.drawText(`Created: ${entry.createdAt.toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Updated date on the right (if exists)
    if (entry.updatedAt) {
      page.drawText(`Updated: ${entry.updatedAt.toLocaleString()}`, {
        x: width - 200, // Position on the right side
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    yPosition -= 20;

    if (entry.mood) {
      page.drawText(`Mood: ${entry.mood}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      yPosition -= 20;
    }

    if (entry.isPrivate) {
      page.drawText("Private Entry", {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      yPosition -= 20;
    }

    if (entry.pinned) {
      page.drawText("Pinned Entry", {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      yPosition -= 20;
    }

    yPosition -= 20;

    /* ---------------- Content (HTML to Plain Text) ---------------- */

    // Strip HTML tags and convert to plain text
    const plainContent = entry.content
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace nbsp with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim();

    const contentLines = plainContent.split("\n");
    const contentMargin = 100; // Reserve space at bottom for CTA

    for (const line of contentLines) {
      if (yPosition < contentMargin) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        maxWidth: 500,
      });

      yPosition -= 15;
    }

    /* ---------------- CTA Section (on last page only) ---------------- */
    const ctaY = 120;
    const ctaHeight = 80;
    const ctaWidth = width - 100;
    const padding = 15;

    // CTA background
    page.drawRectangle({
      x: 50 - padding,
      y: ctaY - 10 - padding,
      width: ctaWidth + padding * 2,
      height: ctaHeight + padding * 2,
      color: rgb(25 / 255, 196 / 255, 150 / 255),
      opacity: 0.6,
    });

    // CTA border
    page.drawRectangle({
      x: 50 - padding,
      y: ctaY - 10 - padding,
      width: ctaWidth + padding * 2,
      height: ctaHeight + padding * 2,
      borderColor: rgb(25 / 255, 196 / 255, 150 / 255),
      borderWidth: 2,
    });

    // CTA text
    page.drawText("Ready to Transform Your Mental Wellness Journey?", {
      x: 70,
      y: ctaY + 45,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
      maxWidth: ctaWidth - 20,
    });

    page.drawText("Join thousands discovering peace of mind with CalmHive", {
      x: 70,
      y: ctaY + 25,
      size: 11,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });

    /* ---------------- Clickable CTA Link ---------------- */
    const ctaText = "Visit CalmHive Today >";
    const ctaTextX = 70;
    const ctaTextY = ctaY + 5;

    page.drawText(ctaText, {
      x: ctaTextX,
      y: ctaTextY,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });

    const linkAnnotation = pdfDoc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [ctaTextX, ctaTextY, ctaTextX + 170, ctaTextY + 15],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: "https://calmhive.vercel.app",
      },
    });

    page.node.set(
      pdfDoc.context.obj("Annots"),
      pdfDoc.context.obj([linkAnnotation]),
    );

    /* ---------------- Export ---------------- */
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString("base64");
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
