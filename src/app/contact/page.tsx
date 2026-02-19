import { Metadata } from "next";
import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import ContactForm from "./client";
import Footer from "@/components/shared/footer/footer";
import { pageMetadata } from "@/seo";

export const metadata: Metadata = pageMetadata.contact;

export default function ContactPage() {
  return (
    <div className="min-h-screen ">
      <HeaderLoggedOut />
      <ContactForm />
      <Footer />
    </div>
  );
}
