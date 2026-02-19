import React from "react";
import { Metadata } from "next";
import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";
import GuideContent from "./guide-content";
import { pageMetadata } from "@/seo";

export const metadata: Metadata = pageMetadata.guide;

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--ch-offwhite)]">
      <HeaderLoggedOut />
      <main className="flex-1">
        <GuideContent />
      </main>
      <Footer />
    </div>
  );
}
