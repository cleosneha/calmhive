import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";
import HeroSection from "@/components/landing-page/hero-section";
import Purpose from "@/components/landing-page/purpose";
import CTA from "@/components/landing-page/CTA";
import FAQ from "@/components/landing-page/FAQ";

export default function HomePage() {
  return (
    <>
      <HeaderLoggedOut />
      <HeroSection />
      <Purpose />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
