import { Building, Users, Award, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { fetchGroupSection, type GroupSectionData } from "@/lib/strapi";

// Mapa de iconos disponibles
const iconMap: Record<string, any> = {
  Building,
  Users,
  Award,
  MapPin,
};

export const GroupSection = () => {
  const [groupData, setGroupData] = useState<GroupSectionData>({
    title: "Somos Grupo INCOSA",
    subtitle: "Un grupo empresarial hondureño líder en servicios funerarios, cementerios y cremaciones, con presencia nacional y compromiso con la excelencia.",
    statitem: [],
    missionTitle: "Nuestra Misión",
    missionContent: "Brindar servicios funerarios, de cementerio y cremación de la más alta calidad, acompañando a las familias hondureñas en sus momentos más difíciles con compasión, dignidad y profesionalismo, honrando la memoria de sus seres queridos y ofreciendo espacios de paz para el descanso eterno.",
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchGroupSection();
      console.log("Group Section Data:", data);
      setGroupData(data);
    };
    loadData();
  }, []);

  return (
    <section id="group" className="py-20 bg-elegant-gray text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {groupData.title}
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {groupData.subtitle}
            </p>
          </div>

          {/* Stats */}
          {groupData.statitem.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {groupData.statitem.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Building;
                return (
                  <div 
                    key={stat.id}
                    className="text-center fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 bg-primary-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary-gold" />
                    </div>
                    <div className="text-4xl font-bold text-primary-gold mb-2">
                      {stat.number}
                    </div>
                    <div className="text-lg font-semibold mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-white/70">
                      {stat.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mission Statement */}
          <div className="mt-16 text-center bg-white/5 backdrop-blur-sm rounded-2xl p-12 slide-up">
            <h3 className="text-3xl font-bold mb-6">{groupData.missionTitle}</h3>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              {groupData.missionContent}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};