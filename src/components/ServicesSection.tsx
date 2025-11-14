import { Flower, Building2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import cemeteryGarden from "@/assets/cemetery-garden.jpg";
import { scrollToSection } from "@/lib/scrollUtils";
import { useState, useEffect, useRef } from "react";
import { fetchCities, fetchServices, type City, type Service } from "@/lib/strapi";
import { useNavigate } from "react-router-dom";

// Mapa de iconos disponibles
const iconMap: Record<string, any> = {
  Building2,
  Flame,
  Flower,
};

export const ServicesSection = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<City[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // Cargar ciudades al montar
  useEffect(() => {
    const loadCities = async () => {
      const data = await fetchCities();
      setCities(data);
    };
    loadCities();
  }, []);

  // Cargar servicios cuando cambia la ciudad
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      const citySlug = selectedCity === "all" ? undefined : selectedCity;
      const data = await fetchServices(citySlug);
      setServices(data);
      setLoading(false);
    };
    loadServices();
  }, [selectedCity]);

  const handleServiceClick = (slug: string) => {
    navigate(`/servicio/${slug}`);
  };

  const renderServiceCard = (service: Service, index: number) => {
    const IconComponent = iconMap[service.icon] || Flower;
    
    // Obtener características para la ciudad seleccionada
    const cityService = selectedCity !== "all"
      ? service.cityservice.find(cs => 
          cs.cities.some(city => city.slug === selectedCity)
        )
      : service.cityservice[0]; // Usar primera ciudad si no hay filtro
    
    const features = cityService?.features.map(f => f.Text) || [];
    const description = cityService?.customDescription || service.description;
    
    return (
      <Card 
        key={service.id}
        className="group hover:scale-105 smooth-transition card-shadow fade-in h-full"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-green/20 smooth-transition">
            <IconComponent className="w-10 h-10 text-primary-green" />
          </div>
          
          <h3 className="text-2xl font-bold text-elegant-gray mb-4">
            {service.name}
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          {features.length > 0 && (
            <ul className="space-y-3 mb-8">
              {features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          )}
          
          <Button 
            variant="outline" 
            className="border-primary-green text-primary-green hover:bg-primary-green hover:text-white w-full smooth-transition"
            onClick={() => handleServiceClick(service.slug)}
          >
            Más Información
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <section 
      id="services" 
      className="py-20 parallax-section relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${cemeteryGarden})`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-gray mb-6">
              Nuestros Servicios
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ofrecemos una gama completa de servicios funerarios diseñados 
              para honrar la memoria de sus seres queridos con dignidad y respeto.
            </p>
            
            {/* City Selector */}
            <div className="max-w-md mx-auto mt-8">
              <label className="block text-lg font-semibold text-elegant-gray mb-3">
                Elige tu ciudad
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full h-12 border-2 border-primary-green bg-primary-green/10 hover:bg-primary-green/20 focus:border-primary-green focus:ring-4 focus:ring-primary-green/30 transition-all text-lg font-semibold shadow-lg">
                  <SelectValue placeholder="🏙️ Seleccione su ciudad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ciudades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Cargando servicios...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 mb-16">
              <p className="text-xl text-muted-foreground">
                No hay servicios disponibles para esta ciudad.
              </p>
            </div>
          ) : (
            <>
              {/* Carousel para móviles */}
              <div className="lg:hidden mb-16">
                <Carousel
                  plugins={[autoplayPlugin.current]}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  onMouseEnter={() => autoplayPlugin.current.stop()}
                  onMouseLeave={() => autoplayPlugin.current.play()}
                >
                  <CarouselContent>
                    {services.map((service, index) => (
                      <CarouselItem key={service.id}>
                        {renderServiceCard(service, index)}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>

              {/* Grid para desktop */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-16">
                {services.map((service, index) => renderServiceCard(service, index))}
              </div>
            </>
          )}

          {/* CTA Section */}
          <div className="text-center bg-primary-green/5 rounded-2xl p-12 slide-up">
            <h3 className="text-3xl font-bold text-elegant-gray mb-4">
              ¿Necesita Nuestros Servicios?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Estamos disponibles las 24 horas del día, los 7 días de la semana 
              para atender sus necesidades con la atención que usted merece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-4 text-lg"
              >
                Llamar Ahora: (504) 2234-5678
              </Button>
              <Button
                size="lg"
                className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-4 text-lg"
                onClick={() => scrollToSection("contact")}
              >
                Contactar Online
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};