import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";
import HeroSection from "@/components/landing-page/hero-section";
import HowItWorks from "@/components/landing-page/how-it-works";
import Purpose from "@/components/landing-page/purpose";

export default function HomePage() {
  return (
    <>
      <HeaderLoggedOut />
      <HeroSection />
      <Purpose />
      <HowItWorks />
      <Footer />
    </>
  );
}
