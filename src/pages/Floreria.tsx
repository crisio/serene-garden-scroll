import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Phone, Home as HomeIcon, Clock } from "lucide-react";
import { fetchFloreria, fetchSiteHeader, type FloreriaData } from "@/lib/strapi";
import { useRef } from "react";

const defaultLogo = "/lovable-uploads/07568c23-c994-4213-83cf-06bea56fbc27.png";

export default function Floreria() {
  const [data, setData] = useState<FloreriaData | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [isLoading, setIsLoading] = useState(true);
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  useEffect(() => {
    Promise.all([fetchFloreria(), fetchSiteHeader()]).then(([floreriaData, headerData]) => {
      setData(floreriaData);
      if (headerData.logoUrl) setLogoUrl(headerData.logoUrl);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar la información de florería.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Breadcrumb */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
            </Link>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary-green transition-colors flex items-center gap-1">
                <HomeIcon className="w-4 h-4" />
                Inicio
              </Link>
              <span>/</span>
              <span className="text-primary-green font-semibold">Florería</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-elegant-gray mb-4">
                  {data.heroTitle}
                </h1>
                <div className="w-24 h-1 bg-primary-green mb-6"></div>
              </div>
              
              <p className="text-xl md:text-2xl text-primary-green font-semibold">
                {data.heroSubtitle}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.heroDescription}
              </p>

              {data.heroHighlight && (
                <p className="text-base text-muted-foreground leading-relaxed italic">
                  {data.heroHighlight}
                </p>
              )}

              <div className="pt-4">
                {data.ecommerceUrl ? (
                  <Button
                    size="lg"
                    className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full group"
                    asChild
                  >
                    <a href={data.ecommerceUrl} target="_blank" rel="noopener noreferrer">
                      {data.ctaButtonText}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full"
                  >
                    {data.ctaButtonText}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              {data.heroImageUrl && (
                <img
                  src={data.heroImageUrl}
                  alt={data.heroTitle}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-none shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-elegant-gray mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Floral Arrangements Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-elegant-gray mb-4">
              {data.arrangementsTitle}
            </h2>
            <p className="text-xl text-primary-green font-semibold mb-2">
              {data.arrangementsSubtitle}
            </p>
            <div className="w-24 h-1 bg-primary-green mx-auto"></div>
          </div>

          {/* Carousel */}
          <div className="max-w-6xl mx-auto">
            <Carousel
              plugins={[autoplayPlugin.current]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
              onMouseEnter={() => autoplayPlugin.current.stop()}
              onMouseLeave={() => autoplayPlugin.current.play()}
            >
              <CarouselContent className="-ml-4">
                {data.arrangements.map((arrangement, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {arrangement.imageUrl && (
                          <img
                            src={arrangement.imageUrl}
                            alt={arrangement.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold text-elegant-gray">
                          {arrangement.name}
                        </h3>
                        {arrangement.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {arrangement.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            {data.ecommerceUrl ? (
              <Button
                size="lg"
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full group"
                asChild
              >
                <a href={data.ecommerceUrl} target="_blank" rel="noopener noreferrer">
                  {data.ctaButtonText}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full"
              >
                {data.ctaButtonText}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Left Image */}
            <div className="order-2 md:order-1">
              {data.finalImageUrl && (
                <img
                  src={data.finalImageUrl}
                  alt="Acompaña el Homenaje"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              )}
            </div>

            {/* Right Content */}
            <div className="order-1 md:order-2 space-y-6">
              <div>
                <p className="text-primary-green font-semibold mb-2">
                  {data.finalSectionLabel}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-elegant-gray mb-4">
                  {data.finalTitle}
                </h2>
                <div className="w-24 h-1 bg-primary-green mb-6"></div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.finalDescription}
              </p>

              <div className="pt-4">
                {data.ecommerceUrl ? (
                  <Button
                    size="lg"
                    className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full group"
                    asChild
                  >
                    <a href={data.ecommerceUrl} target="_blank" rel="noopener noreferrer">
                      {data.ctaButtonText}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-6 text-lg rounded-full"
                  >
                    {data.ctaButtonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <HomeIcon className="w-4 h-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
