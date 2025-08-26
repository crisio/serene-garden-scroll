import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Location {
  id: string;
  name: string;
  address: string;
  phones: string[];
  city: string;
}

export const LocationsSection = () => {
  const locations: Location[] = [
    {
      id: "jardines-sps",
      name: "Jardines del Recuerdo / Cremaciones del Recuerdo",
      address: "Colonia Altiplano, 25 Calle SO, San Pedro Sula, Honduras",
      phones: ["2556-7400", "2556-7220", "2556-9039"],
      city: "San Pedro Sula"
    },
    {
      id: "funerales-sps",
      name: "Funerales del Recuerdo",
      address: "Barrio El Benque, 11 Avenida, 4ta Calle SO, San Pedro Sula, Honduras",
      phones: ["2553-6405", "2553-6406", "2553-6407"],
      city: "San Pedro Sula"
    },
    {
      id: "funerales-paz-sps",
      name: "Funerales La Paz",
      address: "Barrio El Benque, 11 Avenida, 4ta Calle SO, San Pedro Sula, Honduras",
      phones: ["2553-6405"],
      city: "San Pedro Sula"
    },
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

          <div className="grid gap-6 slide-up">
            {locations.map((location, index) => (
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {location.name}
                        </h3>
                        <span className="text-sm bg-primary-gold/20 text-primary-gold px-2 py-1 rounded-full">
                          {location.city}
                        </span>
                      </div>
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

          {/* Call to Action */}
          <div className="text-center mt-16 slide-up">
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
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
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