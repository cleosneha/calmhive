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

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSize?: number;
}

interface StyledText {
  text: string;
  style: TextStyle;
}

interface ContentLine {
  elements: StyledText[];
  isBullet?: boolean;
}

// Parse HTML content and extract styled text (server-side)
function parseHTMLContent(html: string): ContentLine[] {
  const lines: ContentLine[] = [];

  // Process content in order by parsing tags sequentially
  let pos = 0;

  while (pos < html.length) {
    // Look for next paragraph
    const pStartMatch = html.slice(pos).match(/<p[^>]*>(.*?)<\/p>/i);
    const pStartIndex = pStartMatch
      ? pos + html.slice(pos).indexOf(pStartMatch[0])
      : -1;

    // Look for next list
    const ulStartMatch = html.slice(pos).match(/<ul[^>]*>(.*?)<\/ul>/i);
    const ulStartIndex = ulStartMatch
      ? pos + html.slice(pos).indexOf(ulStartMatch[0])
      : -1;

    // Determine which comes first
    let nextIsP = false;
    let nextIndex = -1;

    if (pStartIndex !== -1 && ulStartIndex !== -1) {
      nextIsP = pStartIndex < ulStartIndex;
      nextIndex = Math.min(pStartIndex, ulStartIndex);
    } else if (pStartIndex !== -1) {
      nextIsP = true;
      nextIndex = pStartIndex;
    } else if (ulStartIndex !== -1) {
      nextIsP = false;
      nextIndex = ulStartIndex;
    } else {
      break; // No more tags
    }

    if (nextIsP && pStartMatch) {
      const pContent = pStartMatch[1];
      const elements = parseStyledText(pContent);
      if (elements.length > 0) {
        lines.push({ elements, isBullet: false });
      }
      pos = pStartIndex + pStartMatch[0].length;
    } else if (!nextIsP && ulStartMatch) {
      const listContent = ulStartMatch[1];
      const liPattern = /<li[^>]*>(.*?)<\/li>/gi;
      let liMatch;

      while ((liMatch = liPattern.exec(listContent)) !== null) {
        const liText = liMatch[1];
        const elements = parseStyledText(liText);
        if (elements.length > 0) {
          lines.push({ elements, isBullet: true });
        }
      }
      pos = ulStartIndex + ulStartMatch[0].length;
    } else {
      break;
    }
  }

  return lines.filter((line) => line.elements.length > 0);
}

// Parse styled text from HTML content
function parseStyledText(html: string): StyledText[] {
  const elements: StyledText[] = [];

  // Decode HTML entities
  const text = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Process in order: spans with styles, then other tags
  // First, handle everything recursively by parsing tags

  interface Token {
    type: "text" | "tag";
    tag?: string;
    content?: string;
    attrs?: Record<string, string>;
  }

  // Tokenize the HTML
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < text.length) {
    const nextTag = text.indexOf("<", pos);

    if (nextTag === -1) {
      // Rest is text
      const remaining = text.substring(pos).trim();
      if (remaining) {
        tokens.push({ type: "text", content: remaining });
      }
      break;
    }

    // Text before tag
    if (nextTag > pos) {
      const textBefore = text.substring(pos, nextTag).trim();
      if (textBefore) {
        tokens.push({ type: "text", content: textBefore });
      }
    }

    // Find end of tag
    const tagEnd = text.indexOf(">", nextTag);
    if (tagEnd === -1) break;

    const tagContent = text.substring(nextTag + 1, tagEnd);
    const isClosing = tagContent.startsWith("/");

    if (!isClosing) {
      const tagMatch = tagContent.match(/^(\w+)([^>]*)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        const attrs = tagMatch[2];

        // Parse style attribute for span tags
        const attrs_obj: Record<string, string> = {};
        if (attrs) {
          const styleMatch = attrs.match(/style="([^"]*)"/);
          if (styleMatch) {
            attrs_obj["style"] = styleMatch[1];
          }
        }

        tokens.push({
          type: "tag",
          tag: tagName,
          attrs: attrs_obj,
        });
      }
    } else {
      const tagName = tagContent.substring(1).trim().toLowerCase();
      tokens.push({
        type: "tag",
        tag: "/" + tagName,
      });
    }

    pos = tagEnd + 1;
  }

  // Now process tokens and build styled text elements
  let currentStyle: TextStyle = {};
  const styleStack: TextStyle[] = [{}];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "text") {
      if (token.content) {
        elements.push({
          text: token.content,
          style: { ...currentStyle },
        });
      }
    } else if (token.type === "tag" && token.tag) {
      if (token.tag.startsWith("/")) {
        // Closing tag
        const tagName = token.tag.substring(1);
        if (tagName === "strong" || tagName === "b") {
          currentStyle.bold = false;
        } else if (tagName === "em" || tagName === "i") {
          currentStyle.italic = false;
        } else if (tagName === "u") {
          currentStyle.underline = false;
        } else if (tagName === "span") {
          // Reset to previous style
          if (styleStack.length > 1) {
            styleStack.pop();
            currentStyle = { ...styleStack[styleStack.length - 1] };
          }
        }
      } else {
        // Opening tag
        const tagName = token.tag;
        if (tagName === "strong" || tagName === "b") {
          currentStyle.bold = true;
        } else if (tagName === "em" || tagName === "i") {
          currentStyle.italic = true;
        } else if (tagName === "u") {
          currentStyle.underline = true;
        } else if (tagName === "span" && token.attrs?.style) {
          const style = token.attrs.style;

          // Parse font-size
          const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
          if (fontSizeMatch) {
            currentStyle.fontSize = parseInt(fontSizeMatch[1]);
          }

          // Parse color
          const colorMatch = style.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            currentStyle.color = colorMatch[1].trim();
          }

          // Parse font-weight
          if (style.includes("font-weight")) {
            currentStyle.bold = true;
          }

          // Parse font-style italic
          if (style.includes("font-style: italic")) {
            currentStyle.italic = true;
          }

          // Parse text-decoration underline
          if (style.includes("text-decoration: underline")) {
            currentStyle.underline = true;
          }

          styleStack.push({ ...currentStyle });
        }
      }
    }
  }

  return elements.filter((el) => el.text.trim().length > 0);
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
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
    const helveticaItalicFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaOblique,
    );
    const helveticaBoldItalicFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBoldOblique,
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

    /* ---------------- Content (Styled HTML Text) ---------------- */

    const contentLines = parseHTMLContent(entry.content);
    const contentMargin = 100; // Reserve space at bottom for CTA

    for (const line of contentLines) {
      if (yPosition < contentMargin) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }

      let xPosition = 50;

      // Add bullet point if needed
      if (line.isBullet) {
        page.drawText("• ", {
          x: xPosition,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        xPosition += 15;
      }

      // Draw each styled element in the line
      for (const element of line.elements) {
        const fontSize = element.style.fontSize || 12;

        // Select font based on styling
        let font = helveticaFont;
        if (element.style.bold && element.style.italic) {
          font = helveticaBoldItalicFont;
        } else if (element.style.bold) {
          font = helveticaBoldFont;
        } else if (element.style.italic) {
          font = helveticaItalicFont;
        }

        // Parse color
        let textColor = rgb(0, 0, 0);
        if (element.style.color) {
          if (element.style.color.startsWith("#")) {
            const rgbColor = hexToRgb(element.style.color);
            textColor = rgb(rgbColor.r, rgbColor.g, rgbColor.b);
          } else if (element.style.color.startsWith("rgb")) {
            // Handle rgb(r, g, b) format
            const rgbMatch = element.style.color.match(
              /rgb\((\d+),\s*(\d+),\s*(\d+)\)/,
            );
            if (rgbMatch) {
              textColor = rgb(
                parseInt(rgbMatch[1]) / 255,
                parseInt(rgbMatch[2]) / 255,
                parseInt(rgbMatch[3]) / 255,
              );
            }
          }
        }

        const displayText = element.text;

        // Calculate approximate text width for positioning
        const charWidth = fontSize * 0.5;
        const textWidth = displayText.length * charWidth;

        // Draw the text
        page.drawText(displayText, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          font: font,
          color: textColor,
        });

        // Draw underline if needed
        if (element.style.underline) {
          page.drawLine({
            start: { x: xPosition, y: yPosition - 3 },
            end: { x: xPosition + textWidth, y: yPosition - 3 },
            thickness: 1,
            color: textColor,
          });
        }

        xPosition += textWidth;
      }

      yPosition -= 18;
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
