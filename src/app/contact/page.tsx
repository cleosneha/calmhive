import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import ContactForm from "./client";
import Footer from "@/components/shared/footer/footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen ">
      <HeaderLoggedOut />
      <ContactForm />
      <Footer />
    </div>
  );
}
