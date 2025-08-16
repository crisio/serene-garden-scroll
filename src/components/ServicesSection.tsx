import { Flower, Building2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import cemeteryGarden from "@/assets/cemetery-garden.jpg";

export const ServicesSection = () => {
  const services = [
    {
      icon: Building2,
      title: "Cementerios",
      description: "Espacios de paz y tranquilidad para el descanso eterno",
      features: [
        "Lotes familiares",
        "Mausoleos privados", 
        "Jardines memoriales",
        "Mantenimiento perpetuo"
      ]
    },
    {
      icon: Flame,
      title: "Cremaciones",
      description: "Servicios de cremación con dignidad y respeto",
      features: [
        "Cremación tradicional",
        "Servicios memoriales",
        "Urnas especiales",
        "Ceremonias personalizadas"
      ]
    },
    {
      icon: Flower,
      title: "Servicios Funerarios",
      description: "Acompañamiento completo en momentos difíciles",
      features: [
        "Velatorios privados",
        "Transporte especializado",
        "Gestión de documentos",
        "Atención 24 horas"
      ]
    }
  ];

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
          </div>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:scale-105 smooth-transition card-shadow fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-green/20 smooth-transition">
                      <IconComponent className="w-10 h-10 text-primary-green" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-elegant-gray mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant="outline" 
                      className="border-primary-green text-primary-green hover:bg-primary-green hover:text-white w-full smooth-transition"
                    >
                      Más Información
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
                variant="outline" 
                size="lg"
                className="border-primary-green text-primary-green hover:bg-primary-green hover:text-white px-8 py-4 text-lg"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
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