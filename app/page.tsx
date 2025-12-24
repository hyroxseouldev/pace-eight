import Header from "@/components/marketing/header";
import HeroSection from "@/components/marketing/hero-section";
import ServiceIntroSection from "@/components/marketing/service-intro-section";
import SocialProofSection from "@/components/marketing/social-proof-section";
import Footer from "@/components/marketing/footer";

export default function MarketingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgb(var(--pure-black))]">
        <HeroSection />
        <ServiceIntroSection />
        <SocialProofSection />
        <Footer />
      </main>
    </>
  );
}
