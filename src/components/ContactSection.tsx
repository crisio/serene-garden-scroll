import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { fetchContactSection, type ContactSectionData } from "@/lib/strapi";
import memorialInterior from "@/assets/memorial-interior.jpg";

// Mapa de iconos disponibles
const iconMap: Record<string, any> = {
  Phone,
  Mail,
  MapPin,
  Clock,
};

export const ContactSection = () => {
  const [contactData, setContactData] = useState<ContactSectionData>({
    title: "Contáctanos",
    subtitle: "Estamos aquí para apoyarlo cuando más nos necesite. Contáctenos en cualquier momento del día o la noche.",
    contactinfo: [],
    emergencyTitle: "Emergencia 24/7",
    emergencyPhone: "(504) 2234-5678",
    emergencyButtonText: "Llamar Ahora:",
    formTitle: "Envíanos un Mensaje",
    formSubmitButtonText: "Enviar Mensaje",
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchContactSection();
      console.log("Contact Section Data:", data);
      setContactData(data);
    };
    loadData();
  }, []);

  const backgroundImage = contactData.backgroundImageUrl || memorialInterior;

  return (
    <section 
      id="contact" 
      className="py-20 parallax-section relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {contactData.title}
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {contactData.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 slide-up">
              <h3 className="text-3xl font-bold text-white mb-8">
                Información de Contacto
              </h3>
              
              <div className="grid gap-6">
                {contactData.contactinfo.map((item, index) => {
                  const IconComponent = iconMap[item.icon] || Phone;
                  return (
                    <Card 
                      key={item.id}
                      className="bg-white/10 backdrop-blur-sm border-white/20 fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary-gold" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {item.title}
                          </h4>
                          <p className="text-primary-gold font-medium mb-1">
                            {item.info}
                          </p>
                          <p className="text-white/70 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Emergency Call Button */}
              <Card className="bg-primary-green border-primary-green slide-up">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-bold text-white mb-4">
                    {contactData.emergencyTitle}
                  </h4>
                  <Button 
                    size="lg"
                    className="bg-white text-primary-green hover:bg-white/90 font-bold px-8 py-4 text-lg w-full"
                    onClick={() => window.location.href = `tel:${contactData.emergencyPhone}`}
                  >
                    {contactData.emergencyButtonText} {contactData.emergencyPhone}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="slide-up">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-8">
                    {contactData.formTitle}
                  </h3>
                  
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Nombre Completo
                        </label>
                        <Input 
                          placeholder="Su nombre"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Teléfono
                        </label>
                        <Input 
                          placeholder="Su teléfono"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Correo Electrónico
                      </label>
                      <Input 
                        type="email"
                        placeholder="su@email.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Servicio de Interés
                      </label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white">
                        <option value="" className="text-gray-800">Seleccione un servicio</option>
                        <option value="funeral" className="text-gray-800">Servicios Funerarios</option>
                        <option value="cemetery" className="text-gray-800">Cementerio</option>
                        <option value="cremation" className="text-gray-800">Cremación</option>
                        <option value="other" className="text-gray-800">Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Mensaje
                      </label>
                      <Textarea 
                        placeholder="Cuéntenos cómo podemos ayudarle"
                        rows={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      size="lg"
                      className="w-full bg-primary-gold hover:bg-primary-gold/90 text-white font-semibold py-4"
                    >
                      {contactData.formSubmitButtonText}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};