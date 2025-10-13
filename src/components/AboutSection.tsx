import { Users, Heart, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AboutSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Compasión",
      description: "Entendemos el dolor y acompañamos con respeto y cariño"
    },
    {
      icon: Users,
      title: "Familia",
      description: "Cada familia es única y merece atención personalizada"
    },
    {
      icon: Shield,
      title: "Confianza",
      description: "Más de 50 años construyendo relaciones duraderas"
    },
    {
      icon: Clock,
      title: "Experiencia",
      description: "Décadas de experiencia al servicio de Honduras"
    }
  ];

  return (
    <section id="about" className="py-20 section-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-gray mb-6">
              Nuestra Historia
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Con más de 50 años de trayectoria, hemos acompañado a las familias hondureñas
              con respeto, calidad y ética en los momentos más significativos. Hoy reafirmamos
              nuestro compromiso de ser la mejor opción en servicios funerarios, distinguiéndonos
              por la excelencia, innovación y confianza.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center p-6 card-shadow smooth-transition hover:scale-105 fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-elegant-gray mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Story Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="slide-up">
              <h3 className="text-3xl font-bold text-elegant-gray mb-6">
                Un Legado de Servicio
              </h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Lo que comenzó como un pequeño negocio familiar se ha convertido en
                el grupo funerario más confiable de Honduras. Nuestra misión siempre
                ha sido la misma: acompañar a las familias con dignidad y respeto.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hoy, como parte del Grupo INCOSA, continuamos expandiendo nuestros
                servicios para servir mejor a nuestras comunidades, manteniendo
                siempre los valores que nos han definido durante más de cinco décadas.
              </p>
            </div>
            
            <div className="slide-up lg:pl-8">
              <div className="bg-card p-8 rounded-2xl card-shadow">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-primary-green mb-2">50+</div>
                  <p className="text-xl text-elegant-gray font-semibold">Años de Experiencia</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-green rounded-full"></div>
                    <span className="text-muted-foreground">Servicios funerarios completos</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-green rounded-full"></div>
                    <span className="text-muted-foreground">Cementerios y jardines memoriales</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-green rounded-full"></div>
                    <span className="text-muted-foreground">Servicios de cremación</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-green rounded-full"></div>
                    <span className="text-muted-foreground">Atención personalizada 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Misión y Visión */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="slide-up card-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-elegant-gray">Nuestra Misión</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Brindar servicios funerarios de la más alta calidad, acompañando a las familias
                  hondureñas con respeto, dignidad y profesionalismo en sus momentos más significativos,
                  siendo un apoyo integral y confiable.
                </p>
              </CardContent>
            </Card>

            <Card className="slide-up card-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-elegant-gray">Nuestra Visión</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Ser el grupo funerario líder en Honduras, reconocidos por nuestra excelencia en el
                  servicio, innovación constante y compromiso con las familias, expandiendo nuestra
                  cobertura nacional mientras mantenemos los más altos estándares de calidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};