import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { fetchServiceBySlug, type Service } from "@/lib/strapi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureGalleryModal } from "@/components/FeatureGalleryModal";
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
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get("ciudad");
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<{
    name: string;
    images: Service["gallery"];
  } | null>(null);

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
  const normalizePhone = (value: string) => value.replace(/\D/g, "");
  
  // City-specific contact mapping
  const cityContactsMap: Record<string, Array<{ title: string; phone: string; type: "call" | "whatsapp"; cityName?: string }>> = {
    "san-pedro-sula": [
      { title: "Línea Directa de Emergencia", phone: "25024331", type: "call", cityName: "San Pedro Sula" },
      { title: "Línea Previa Necesidad", phone: "25024330", type: "call", cityName: "San Pedro Sula" },
      { title: "WhatsApp", phone: "99746421", type: "whatsapp", cityName: "San Pedro Sula" },
    ],
    "la-ceiba": [
      { title: "Línea Directa Emergencia", phone: "25024333", type: "call", cityName: "La Ceiba" },
      { title: "Línea Contestadora", phone: "25024332", type: "call", cityName: "La Ceiba" },
      { title: "Celular / WhatsApp", phone: "94592620", type: "whatsapp", cityName: "La Ceiba" },
    ],
  };
  
  // Extract available cities from service
  const availableCitySlugs = service.cityservice
    .filter(cs => cs.available)
    .flatMap(cs => cs.cities.map(city => city.slug));
  
  // Determine which contact sets to display based on city param or all available cities
  const contactOptions = cityParam
    ? // If city param exists, show only that city's contacts
      cityContactsMap[cityParam] || []
    : // Otherwise show all available cities' contacts
      availableCitySlugs.reduce((acc, citySlug) => {
        const cityContacts = cityContactsMap[citySlug];
        if (cityContacts) {
          return [...acc, ...cityContacts];
        }
        return acc;
      }, [] as Array<{ title: string; phone: string; type: "call" | "whatsapp"; cityName?: string }>);
  
  // Fallback to San Pedro Sula if no matching cities found
  const finalContactOptions = contactOptions.length > 0 ? contactOptions : cityContactsMap["san-pedro-sula"];
  const isVideo = (media: { url: string; mimeType?: string }) => {
    if (media.mimeType?.toLowerCase().startsWith("video")) return true;
    return /\.(mp4|webm|ogg|mov|m4v|avi)$/i.test(media.url) || media.mimeType?.toLowerCase().includes("quicktime") === true;
  };
  const openGallery = () => {
    if (!service.gallery.length) return;
    setSelectedGallery({ name: service.name, images: service.gallery });
    setGalleryOpen(true);
  };

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
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {service.gallery.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  className="mb-4 break-inside-avoid w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 rounded-xl"
                  onClick={openGallery}
                  aria-label="Ver imagen en detalle"
                >
                  <Card className="overflow-hidden group cursor-zoom-in hover:shadow-xl transition-shadow">
                    <div className="relative w-full">
                      {isVideo(media) ? (
                        <video
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        >
                          <source src={media.url} type={media.mimeType || "video/mp4"} />
                        </video>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.alternativeText || service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Card>
                </button>
              ))}
            </div>
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
            ¿Necesita Nuestros Servicios?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Estamos disponibles las 24 horas del día, los 7 días de la semana para atender sus necesidades con la atención que usted merece.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finalContactOptions.map((contact, idx) => (
              <Card
                key={`${contact.cityName}-${idx}`}
                className="p-6 text-left h-full flex flex-col"
              >
                {contact.cityName && availableCitySlugs.length > 1 && (
                  <p className="text-xs font-semibold text-primary-green mb-2 uppercase">
                    {contact.cityName}
                  </p>
                )}
                <h4 className="text-lg font-bold text-elegant-gray mb-2">
                  {contact.title}
                </h4>
                <p className="text-muted-foreground mb-4">{contact.phone}</p>
                <div className="flex mt-auto pt-4">
                  {contact.type === "whatsapp" ? (
                    <Button asChild className="bg-primary-green hover:bg-primary-green/90 text-white w-full">
                      <a 
                        href={`https://wa.me/504${normalizePhone(contact.phone)}?text=Hola,%20necesito%20información`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Enviar WhatsApp
                      </a>
                    </Button>
                  ) : (
                    <Button asChild className="bg-primary-green hover:bg-primary-green/90 text-white w-full">
                      <a href={`tel:${normalizePhone(contact.phone)}`}>Llamar ahora</a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selectedGallery && (
        <FeatureGalleryModal
          isOpen={galleryOpen}
          onClose={() => {
            setGalleryOpen(false);
            setSelectedGallery(null);
          }}
          featureName={selectedGallery.name}
          images={selectedGallery.images}
        />
      )}
    </div>
  );
};
