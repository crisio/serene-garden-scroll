import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { DynamicHero } from "@/components/DynamicHero";
import { LocationsSection } from "@/components/LocationsSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { OtherServicesSection } from "@/components/OtherServicesSection";
import { GroupSection } from "@/components/GroupSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { StrapiCarousel } from "@/components/StrapiCarousel";
import { scrollToSectionWhenReady } from "@/lib/scrollUtils";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    if (target !== "top") {
      scrollToSectionWhenReady(target);
    }
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
  {/* Dynamic hero from Strapi; fallback to static HeroSection if null */}
  <DynamicHero />
  {/* Optional fallback UI below if DynamicHero returns null */}
  {/* <HeroSection /> */}
        <LocationsSection />
        <AboutSection />
        <ServicesSection />
        <OtherServicesSection />
        <GroupSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Index;
