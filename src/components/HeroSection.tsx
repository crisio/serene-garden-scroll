import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import funeralBuilding from "@/assets/funeral-building.jpg";

export const HeroSection = () => {
  const scrollToNext = () => {
    const nextSection = document.getElementById("about");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center parallax-section"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${funeralBuilding})`
      }}
    >
      <div className="container mx-auto px-4 text-center text-white z-10">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Jardines del
            <span className="block text-primary-gold">Recuerdo</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 font-light opacity-90">
            Más de 50 años acompañando a las familias hondureñas 
            en sus momentos más importantes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-primary-green hover:bg-primary-green/90 text-white font-semibold px-8 py-4 text-lg smooth-transition"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            >
              Nuestros Servicios
            </Button>
            <Button 
              size="lg" 
              className="bg-primary-green hover:bg-primary-green/90 text-white font-semibold px-8 py-4 text-lg smooth-transition"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Contáctanos
            </Button>
          </div>

          <div className="text-center">
            <p className="text-lg mb-4 font-medium">
              Cementerios • Cremaciones • Servicios Funerarios
            </p>
            <div className="w-24 h-0.5 bg-primary-gold mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-primary-gold smooth-transition animate-bounce"
      >
        <ArrowDown size={32} />
      </button>
    </section>
  );
};