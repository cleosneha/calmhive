import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { pageMetadata } from "@/seo";
import { JsonLdScript } from "@/components/seo/JsonLdScript";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "700"],
});

export const metadata: Metadata = pageMetadata.home;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLdScript />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
