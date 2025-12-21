import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "700"],
});

import "./globals.css";

export const metadata: Metadata = {
  title: "CalmHive - Find Calm, Plan Mindfully",
  description:
    "A gentle, AI-powered space for planning, journaling, and reflection. No pressure, no judgment—just calm progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <HeaderLoggedOut />
        {children}
        <Footer />
      </body>
    </html>
  );
}
