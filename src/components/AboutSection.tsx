import { Users, Heart, Shield, Clock, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { fetchAboutSection, type AboutSectionData } from "@/lib/strapi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Mapa de iconos disponibles
const iconMap: Record<string, any> = {
  Heart,
  Users,
  Shield,
  Clock,
  Lightbulb,
};

export const AboutSection = () => {
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  
  const [aboutData, setAboutData] = useState<AboutSectionData>({
    title: "Nuestra Historia",
    subtitle: "Con más de 50 años de trayectoria...",
    value: [],
    legacysection: {
      title: "Un Legado de Servicio",
      paragraph1: "",
      paragraph2: "",
      experienceYears: "50+",
      experienceLabel: "Años de Experiencia",
      serviceitems: [],
    },
    missionvision: {
      missionTitle: "Nuestra Misión",
      missionIcon: "Heart",
      missionContent: "",
      visionTitle: "Nuestra Visión",
      visionIcon: "Lightbulb",
      visionContent: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAboutSection();
      console.log("About Section Data:", data);
      setAboutData(data);
    };
    loadData();
  }, []);

  const renderValueCard = (value: any, index: number) => {
    const IconComponent = iconMap[value.icon] || Heart;
    return (
      <Card 
        key={index} 
        className="text-center p-6 card-shadow smooth-transition hover:scale-105 fade-in h-full"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-8 h-8 text-primary-green" />
          </div>
          <h3 className="text-xl font-semibold text-elegant-gray mb-3">
            {value.title}
          </h3>
          <p className="text-muted-foreground">
            {value.description}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="about" className="py-20 section-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-gray mb-6">
              {aboutData.title}
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {aboutData.subtitle}
            </p>
          </div>

          {/* Values Grid */}
          {aboutData.value.length > 0 && (
            <>
              {/* Mobile - Carousel */}
              <div className="lg:hidden mb-16">
                <Carousel
                  plugins={[autoplayPlugin.current]}
                  opts={{ loop: true, align: "start" }}
                  onMouseEnter={() => autoplayPlugin.current.stop()}
                  onMouseLeave={() => autoplayPlugin.current.play()}
                  onTouchStart={() => autoplayPlugin.current.stop()}
                  onTouchEnd={() => autoplayPlugin.current.play()}
                >
                  <CarouselContent>
                    {aboutData.value.map((value, index) => (
                      <CarouselItem key={index}>
                        {renderValueCard(value, index)}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>

              {/* Desktop - Grid */}
              <div className="hidden lg:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {aboutData.value.map((value, index) => renderValueCard(value, index))}
              </div>
            </>
          )}

          {/* Story Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="slide-up">
              <h3 className="text-3xl font-bold text-elegant-gray mb-6">
                {aboutData.legacysection.title}
              </h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {aboutData.legacysection.paragraph1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {aboutData.legacysection.paragraph2}
              </p>
            </div>
            
            <div className="slide-up lg:pl-8">
              <div className="bg-card p-8 rounded-2xl card-shadow">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-primary-green mb-2">
                    {aboutData.legacysection.experienceYears}
                  </div>
                  <p className="text-xl text-elegant-gray font-semibold">
                    {aboutData.legacysection.experienceLabel}
                  </p>
                </div>
                
                {aboutData.legacysection?.serviceitems && aboutData.legacysection.serviceitems.length > 0 && (
                  <div className="space-y-3">
                    {aboutData.legacysection.serviceitems.map((service, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary-green rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-muted-foreground leading-relaxed">{service.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Misión y Visión */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="slide-up card-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center">
                    {(() => {
                      const MissionIcon = iconMap[aboutData.missionvision.missionIcon] || Heart;
                      return <MissionIcon className="w-6 h-6 text-primary-green" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-elegant-gray">
                    {aboutData.missionvision.missionTitle}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutData.missionvision.missionContent}
                </p>
              </CardContent>
            </Card>

            <Card className="slide-up card-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center">
                    {(() => {
                      const VisionIcon = iconMap[aboutData.missionvision.visionIcon] || Shield;
                      return <VisionIcon className="w-6 h-6 text-primary-gold" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-elegant-gray">
                    {aboutData.missionvision.visionTitle}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutData.missionvision.visionContent}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};