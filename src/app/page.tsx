import { getAuthState } from "@/actions/auth";
import HeaderLoggedOut from "@/components/shared/header/header-logged-out";
import Footer from "@/components/shared/footer/footer";
import HeroSection from "@/components/landing-page/hero-section";
import Purpose from "@/components/landing-page/purpose";
import CTA from "@/components/landing-page/cta";
import FAQ from "@/components/landing-page/faq";
import HowItWorks from "@/components/landing-page/how-it-works";

export default async function HomePage() {
  const { isLoggedIn, user } = await getAuthState();

  return (
    <>
      <HeaderLoggedOut isLoggedIn={isLoggedIn} user={user} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <Purpose />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
