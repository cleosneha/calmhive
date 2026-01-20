import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";
import HeroSection from "@/components/landing-page/hero-section";
import Purpose from "@/components/landing-page/purpose";
import CTA from "@/components/landing-page/cta-temp";
import FAQ from "@/components/landing-page/faq-temp";
import HowItWorks from "@/components/landing-page/how-it-works";

export default function HomePage() {
  return (
    <>
      <HeaderLoggedOut />
      <HeroSection />
      <Purpose />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
