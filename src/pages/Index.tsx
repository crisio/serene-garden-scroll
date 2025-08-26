import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LocationsSection } from "@/components/LocationsSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { GroupSection } from "@/components/GroupSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <LocationsSection />
        <AboutSection />
        <ServicesSection />
        <GroupSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Index;
