import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scrollUtils";
import { useState, useEffect, useRef } from "react";
import { fetchLocations, fetchLocationsPage, type Location, type LocationsPageData } from "@/lib/strapi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const LocationsSection = () => {
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [pageData, setPageData] = useState<LocationsPageData>({
    title: "Nuestras Sucursales",
    subtitle: "Presencia en las principales ciudades de Honduras para servirle mejor",
    grassMaintenanceTitle: "Contactos Responsables de Mantenimiento de Grama",
    grassPhones: [],
    grassImageUrl: undefined,
    ctaTitle: "¿Necesita asistencia inmediata?",
    ctaSubtitle: "Nuestro equipo está disponible 24/7 para atenderle",
    ctaButtonText: "Contactar Ahora",
  });

  useEffect(() => {
    const loadData = async () => {
      const [locs, page] = await Promise.all([
        fetchLocations(),
        fetchLocationsPage(),
      ]);
      console.log("Locations Page Data:", page);
      console.log("Grass Image URL:", page.grassImageUrl);
      setLocations(locs);
      setPageData(page);
    };
    loadData();
  }, []);

  // Group locations by city
  const sanPedroSulaLocations = locations.filter(loc => loc.city === "San Pedro Sula");
  const ceibaLocations = locations.filter(loc => loc.city === "La Ceiba");

  const getMapUrl = (location: Location) => {
    if (location.mapsUrl) return location.mapsUrl;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
  };

  const renderLocationCard = (location: Location, index: number) => (
    <Card
      key={location.id}
      className="hover:shadow-lg transition-all duration-300 h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-green/20 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-primary-green" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {location.name}
            </h4>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              {location.address}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {location.phone.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-1 text-sm text-primary-green">
                  <Phone className="w-3 h-3" />
                  <span>{phone.number}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-primary-green border-primary-green hover:bg-primary-green hover:text-white"
              onClick={() => window.open(getMapUrl(location), '_blank', 'noopener,noreferrer')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ver en Google Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="locations" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 max-w-[100vw] lg:max-w-7xl overflow-hidden">
        <div className="lg:max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up max-w-[100vw] overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {pageData.title}
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {pageData.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* San Pedro Sula */}
            {sanPedroSulaLocations.length > 0 && (
              <div className="slide-up max-w-[100vw] overflow-hidden">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                  San Pedro Sula
                </h3>
                
                {/* Mobile - Carousel */}
                <div className="lg:hidden">
                  <Carousel
                    plugins={[autoplayPlugin.current]}
                    opts={{ loop: true, align: "start" }}
                    onMouseEnter={() => autoplayPlugin.current.stop()}
                    onMouseLeave={() => autoplayPlugin.current.play()}
                    onTouchStart={() => autoplayPlugin.current.stop()}
                    onTouchEnd={() => autoplayPlugin.current.play()}
                  >
                    <CarouselContent>
                      {sanPedroSulaLocations.map((location, index) => (
                        <CarouselItem key={location.id}>
                          {renderLocationCard(location, index)}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                </div>

                {/* Desktop - List */}
                <div className="hidden lg:block space-y-6">
                  {sanPedroSulaLocations.map((location, index) => renderLocationCard(location, index))}
                </div>
              </div>
            )}

            {/* La Ceiba */}
            {ceibaLocations.length > 0 && (
              <div className="slide-up max-w-[100vw] overflow-hidden">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                  La Ceiba
                </h3>
                
                {/* Mobile - Carousel */}
                <div className="lg:hidden">
                  <Carousel
                    plugins={[autoplayPlugin.current]}
                    opts={{ loop: true, align: "start" }}
                    onMouseEnter={() => autoplayPlugin.current.stop()}
                    onMouseLeave={() => autoplayPlugin.current.play()}
                    onTouchStart={() => autoplayPlugin.current.stop()}
                    onTouchEnd={() => autoplayPlugin.current.play()}
                  >
                    <CarouselContent>
                      {ceibaLocations.map((location, index) => (
                        <CarouselItem key={location.id}>
                          {renderLocationCard(location, index)}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                </div>

                {/* Desktop - List */}
                <div className="hidden lg:block space-y-6">
                  {ceibaLocations.map((location, index) => renderLocationCard(location, index))}
                </div>
              </div>
            )}
          </div>

          {/* Contactos de Grama */}
          {(pageData.grassPhones.length > 0 || pageData.grassImageUrl || pageData.grassMaintenanceTitle) && (
            <div className="text-center mt-12 slide-up max-w-[100vw] overflow-hidden">
              <Card className="bg-gradient-to-r from-primary-green/10 to-primary-green/5 overflow-hidden">
                <CardContent className="p-0">
                  {/* Imagen de grama como fondo */}
                  <div className="relative min-h-[300px] flex items-center justify-center">
                    {/* Overlay oscuro para contraste */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 z-10"></div>
                    
                    {/* Contenido */}
                    <div className="relative z-20 text-center px-6 py-12">
                      <h4 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
                        {pageData.grassMaintenanceTitle}
                      </h4>
                      {pageData.grassPhones.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                          {pageData.grassPhones.map((phone, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-primary-green bg-white px-5 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                              <Phone className="w-5 h-5" />
                              <span className="font-semibold text-lg">{phone.number}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Imagen de fondo desde Strapi */}
                    {pageData.grassImageUrl ? (
                      <img 
                        src={pageData.grassImageUrl} 
                        alt="Mantenimiento de Grama" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback gradient si no hay imagen
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 to-green-800/30"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-8 slide-up max-w-[100vw] overflow-hidden">
            <Card className="bg-primary-green">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {pageData.ctaTitle}
                </h3>
                <p className="text-white/90 mb-6 text-lg">
                  {pageData.ctaSubtitle}
                </p>
                <Button
                  size="lg"
                  className="bg-white text-primary-green hover:bg-white/90 font-semibold px-8 py-4"
                  onClick={() => scrollToSection("contact")}
                >
                  {pageData.ctaButtonText}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};