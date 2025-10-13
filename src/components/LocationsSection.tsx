import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scrollUtils";

interface Location {
  id: string;
  name: string;
  address: string;
  phones: string[];
  city: string;
}

export const LocationsSection = () => {
  const sanPedroSulaLocations: Location[] = [
    {
      id: "jardines-sps",
      name: "Parque Memorial Jardines del Recuerdo",
      address: "Colonia Altiplano, 25 Calle SO, San Pedro Sula, Honduras",
      phones: ["2556-7400", "2556-7220", "2556-9039"],
      city: "San Pedro Sula"
    },
    {
      id: "cremaciones-sps",
      name: "Cremaciones del Recuerdo",
      address: "Colonia Altiplano, 25 Calle SO, San Pedro Sula, Honduras",
      phones: ["2556-7400", "2556-7220"],
      city: "San Pedro Sula"
    },
    {
      id: "funerales-sps",
      name: "Funerales del Recuerdo",
      address: "Barrio El Benque, 11 Avenida, 4ta Calle SO, San Pedro Sula, Honduras",
      phones: ["2553-6405", "2553-6406", "2553-6407"],
      city: "San Pedro Sula"
    }
  ];

  const ceibaLocations: Location[] = [
    {
      id: "jardines-ceiba",
      name: "Jardines de Paz Ceibeños (Parque Memorial)",
      address: "Kilómetro 1, carretera hacia Jutiapa, La Ceiba, Honduras",
      phones: ["2440-7053", "2440-7054", "2440-7055"],
      city: "La Ceiba"
    },
    {
      id: "funerales-ceiba",
      name: "Funerales San José",
      address: "Barrio Solares Nuevos, Avenida Morazán entre 12 y 13 Calle, La Ceiba, Honduras",
      phones: ["2443-0353", "2443-1500", "2443-1700"],
      city: "La Ceiba"
    }
  ];

  return (
    <section id="locations" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nuestras Ubicaciones
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Presencia en las principales ciudades de Honduras para servirle mejor
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* San Pedro Sula */}
            <div className="slide-up">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                San Pedro Sula
              </h3>
              <div className="space-y-6">
                {sanPedroSulaLocations.map((location, index) => (
                  <Card
                    key={location.id}
                    className="hover:shadow-lg transition-all duration-300"
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
                          <div className="flex flex-wrap gap-2">
                            {location.phones.map((phone, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-sm text-primary-green">
                                <Phone className="w-3 h-3" />
                                <span>{phone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* La Ceiba */}
            <div className="slide-up">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                La Ceiba
              </h3>
              <div className="space-y-6">
                {ceibaLocations.map((location, index) => (
                  <Card
                    key={location.id}
                    className="hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
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
                          <div className="flex flex-wrap gap-2">
                            {location.phones.map((phone, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-sm text-primary-green">
                                <Phone className="w-3 h-3" />
                                <span>{phone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Contactos de Grama */}
          <div className="text-center mt-12 slide-up">
            <Card className="bg-gradient-to-r from-primary-green/10 to-primary-green/5">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Contactos Responsables de Mantenimiento de Grama
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {["9989-5025", "9520-6769", "9309-9916", "9513-3286"].map((phone) => (
                    <div key={phone} className="flex items-center gap-2 text-primary-green bg-white px-4 py-2 rounded-lg shadow-sm">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">{phone}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 slide-up">
            <Card className="bg-primary-green">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  ¿Necesita asistencia inmediata?
                </h3>
                <p className="text-white/90 mb-6 text-lg">
                  Nuestro equipo está disponible 24/7 para atenderle
                </p>
                <Button
                  size="lg"
                  className="bg-white text-primary-green hover:bg-white/90 font-semibold px-8 py-4"
                  onClick={() => scrollToSection("contact")}
                >
                  Contactar Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};