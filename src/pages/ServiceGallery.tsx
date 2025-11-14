import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchServiceBySlug, type Service } from "@/lib/strapi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowLeft, Flower, Building2, Flame } from "lucide-react";

// Mapa de iconos disponibles
const iconMap: Record<string, any> = {
  Building2,
  Flame,
  Flower,
};

export const ServiceGallery = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchServiceBySlug(slug);
      setService(data);
      setLoading(false);
    };
    loadService();
  }, [slug]);

  const handleGoBack = () => {
    navigate("/");
    // Esperar a que la navegación se complete y luego hacer scroll
    setTimeout(() => {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        const y = servicesSection.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-2xl text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-4xl font-bold text-elegant-gray mb-4">Servicio no encontrado</h1>
        <Button onClick={handleGoBack} className="bg-primary-green hover:bg-primary-green/90">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Button>
      </div>
    );
  }

  const IconComponent = iconMap[service.icon] || Flower;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary-green/5 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-6 hover:bg-primary-green/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-primary-green" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-elegant-gray">
                {service.name}
              </h1>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl">
            {service.description}
          </p>
        </div>
      </div>

      {/* Ciudades Disponibles */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <h2 className="text-3xl font-bold text-elegant-gray mb-6">Disponible en</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {service.cityservice
            .filter(cs => cs.available)
            .map((cityService) => (
              cityService.cities.map((city) => (
                <Card key={`${cityService.id}-${city.id}`} className="p-6">
                  <h3 className="text-xl font-bold text-elegant-gray mb-4">
                    {city.name}
                  </h3>
                  {cityService.customDescription && (
                    <p className="text-muted-foreground mb-4">
                      {cityService.customDescription}
                    </p>
                  )}
                  {cityService.features.length > 0 && (
                    <ul className="space-y-2">
                      {cityService.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary-green rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{feature.Text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))
            ))}
        </div>

        {/* Galería de Fotos */}
        {service.gallery.length > 0 && (
          <>
            <h2 className="text-3xl font-bold text-elegant-gray mb-6">Galería</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {service.gallery.map((image) => (
                  <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.alternativeText || service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </>
        )}

        {service.gallery.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No hay imágenes disponibles para este servicio.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-primary-green/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-elegant-gray mb-4">
            ¿Necesita más información sobre {service.name}?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Estamos disponibles 24/7 para atender sus consultas
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
              variant="outline"
              className="border-primary-green text-primary-green hover:bg-primary-green hover:text-white px-8 py-4 text-lg"
              onClick={() => navigate("/#contact")}
            >
              Contactar Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
