import { Phone, PhoneCall, MessageCircle, FileText, Award, CreditCard, FileCheck, Users, Clipboard, UserCheck, FilePlus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { fetchOtherServicesPage, type OtherServicesPageData } from "@/lib/strapi";
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
  FileText,
  Award,
  CreditCard,
  FileCheck,
  Users,
  Clipboard,
  UserCheck,
  FilePlus,
};

export const OtherServicesSection = () => {
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  
  const [pageData, setPageData] = useState<OtherServicesPageData>({
    title: "Otras Gestiones",
    subtitle: "Además de nuestros servicios principales, ofrecemos una variedad de gestiones administrativas para facilitar todos sus trámites.",
    other_services: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchOtherServicesPage();
      console.log("Other Services Page Data:", data);
      setPageData(data);
    };
    loadData();
  }, []);

  // Filtrar servicios basados en la búsqueda
  const filteredServices = pageData.other_services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/504${cleanNumber}`, '_blank', 'noopener,noreferrer');
  };

  const renderServiceCard = (service: any, index: number) => {
    const IconComponent = iconMap[service.icon] || FileText;
    
    return (
      <Card 
        key={service.id}
        className="hover:shadow-lg transition-all duration-300 h-full fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardContent className="p-6 h-full flex flex-col items-center text-center">
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="w-8 h-8 text-primary-gold" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {service.title}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
          
          {service.phonenumber && service.phonenumber.length > 0 && (
            <div className="mt-auto w-full flex flex-col gap-3">
              {service.phonenumber.map((phone: { id: number; number: string }) => (
                <div key={phone.id} className="w-full flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary-green">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">{phone.number}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-primary-green border-primary-green hover:bg-primary-green hover:text-white"
                      onClick={() => handleCall(phone.number)}
                      aria-label={`Llamar ${phone.number}`}
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-primary-green border-primary-green hover:bg-primary-green hover:text-white"
                      onClick={() => handleWhatsApp(phone.number)}
                      aria-label={`WhatsApp ${phone.number}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (pageData.other_services.length === 0) {
    return null;
  }

  return (
    <section id="other-services" className="py-20 bg-gradient-to-b from-gray-50 to-white">
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

          {/* Buscador */}
          <div className="max-w-xl mx-auto mb-12" style={{ display: "none" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar servicios o trámites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-primary-gold"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {filteredServices.length} {filteredServices.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {filteredServices.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No se encontraron servicios que coincidan con "{searchQuery}"
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Limpiar búsqueda
              </Button>
            </div>
          )}

          {/* Services */}
          {filteredServices.length > 0 && (
            <>
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
                    {filteredServices.map((service, index) => (
                      <CarouselItem key={service.id}>
                        {renderServiceCard(service, index)}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>

              {/* Desktop - Grid */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service, index) => renderServiceCard(service, index))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
