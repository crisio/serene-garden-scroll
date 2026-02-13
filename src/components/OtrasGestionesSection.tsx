import { FileText, Award, CreditCard, FileCheck, Users, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scrollUtils";

export const OtrasGestionesSection = () => {
  const gestiones = [
    {
      icon: FileText,
      title: "Gestión de Traspasos",
      description: "Realizamos todos los trámites necesarios para el traspaso de lotes y mausoleos entre propietarios.",
      contacto: "2556-7400"
    },
    {
      icon: Award,
      title: "Reposición de Títulos",
      description: "Servicio de reposición de títulos de propiedad extraviados o dañados.",
      contacto: "2556-7220"
    },
    {
      icon: CreditCard,
      title: "Cargos Automáticos",
      description: "Facilite sus pagos con el sistema de cargos automáticos para mantenimiento y servicios.",
      contacto: "2556-9039"
    },
    {
      icon: FileCheck,
      title: "Constancias",
      description: "Emisión de constancias de pago, propiedad y otros documentos oficiales.",
      contacto: "2553-6405"
    },
    {
      icon: Users,
      title: "Nombramiento de Beneficiarios",
      description: "Gestión legal para el nombramiento y actualización de beneficiarios de espacios.",
      contacto: "2553-6406"
    }
  ];

  const handleContact = (phone: string) => {
    window.open(`tel:+504${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, service: string) => {
    const mensaje = `Hola, necesito información sobre ${service}`;
    window.open(`https://wa.me/504${phone}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <section id="otras-gestiones" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-gray mb-6">
              Otras Gestiones
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Además de nuestros servicios principales, ofrecemos una variedad de gestiones
              administrativas para facilitar todos sus trámites.
            </p>
          </div>

          {/* Gestiones Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {gestiones.map((gestion, index) => {
              const IconComponent = gestion.icon;
              return (
                <Card
                  key={index}
                  className="group hover:scale-105 smooth-transition card-shadow fade-in hover:border-primary-green"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-gold/20 smooth-transition">
                      <IconComponent className="w-8 h-8 text-primary-gold" />
                    </div>

                    <h3 className="text-xl font-bold text-elegant-gray mb-3 text-center">
                      {gestion.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 text-center leading-relaxed text-sm">
                      {gestion.description}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Phone className="w-4 h-4 text-primary-green" />
                      <span className="font-semibold text-primary-green">{gestion.contacto}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary-green text-primary-green hover:bg-primary-green hover:text-white smooth-transition"
                        onClick={() => handleContact(gestion.contacto)}
                      >
                        Llamar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary-green text-primary-green hover:bg-primary-green hover:text-white smooth-transition"
                        onClick={() => handleWhatsApp(gestion.contacto, gestion.title)}
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary-green/5 rounded-2xl p-8 slide-up">
            <h3 className="text-2xl font-bold text-elegant-gray mb-4">
              ¿Necesita Ayuda con Otra Gestión?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestro equipo está listo para asistirle con cualquier trámite o gestión que necesite realizar.
            </p>
            <Button
              size="lg"
              className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-4 text-lg"
              onClick={() => scrollToSection("contact")}
            >
              Contactar a un Asesor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
