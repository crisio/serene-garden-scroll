import { Building, Users, Award, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const GroupSection = () => {
  const companies = [
    {
      name: "Jardines del Recuerdo",
      description: "Cementerio principal con más de 50 años de historia",
      location: "Tegucigalpa"
    },
    {
      name: "Funerales del Recuerdo",
      description: "Servicios funerarios completos y personalizados",
      location: "Tegucigalpa"
    },
    {
      name: "Cremaciones del Recuerdo",
      description: "Servicios de cremación con dignidad y respeto",
      location: "Tegucigalpa"
    },
    {
      name: "Funerales La Paz",
      description: "Servicios funerarios en la zona norte del país",
      location: "San Pedro Sula"
    },
    {
      name: "Jardines de Paz Génesis",
      description: "Nuevo cementerio con instalaciones modernas",
      location: "Comayagua"
    },
    {
      name: "Funerales San José",
      description: "Servicios funerarios en la zona central",
      location: "La Paz"
    }
  ];

  const stats = [
    {
      icon: Building,
      number: "6",
      label: "Ubicaciones",
      description: "A lo largo de Honduras"
    },
    {
      icon: Users,
      number: "50k+",
      label: "Familias",
      description: "Atendidas con excelencia"
    },
    {
      icon: Award,
      number: "50+",
      label: "Años",
      description: "De experiencia"
    },
    {
      icon: MapPin,
      number: "3",
      label: "Departamentos",
      description: "Con presencia activa"
    }
  ];

  return (
    <section id="group" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-gray mb-6">
              Somos Grupo INCOSA
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Un grupo empresarial hondureño líder en servicios funerarios, 
              cementerios y cremaciones, con presencia nacional y compromiso 
              con la excelencia.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={index}
                  className="text-center fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-primary-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary-green" />
                  </div>
                  <div className="text-4xl font-bold text-primary-green mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-elegant-gray mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Companies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <Card 
                key={index}
                className="bg-card border-border hover:bg-accent/10 smooth-transition fade-in card-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-elegant-gray mb-3">
                    {company.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {company.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary-green">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{company.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission Statement */}
          <div className="mt-16 text-center bg-primary-green/5 rounded-2xl p-12 slide-up">
            <h3 className="text-3xl font-bold text-elegant-gray mb-6">Nuestra Misión</h3>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Brindar servicios funerarios, de cementerio y cremación de la más alta calidad, 
              acompañando a las familias hondureñas en sus momentos más difíciles con 
              compasión, dignidad y profesionalismo, honrando la memoria de sus seres queridos 
              y ofreciendo espacios de paz para el descanso eterno.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};