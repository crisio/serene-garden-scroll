import { Heart, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { scrollToSection as scrollToSectionUtil } from "@/lib/scrollUtils";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Inicio", href: "#hero" },
    { label: "Ubicaciones", href: "#locations" },
    { label: "Nosotros", href: "#about" },
    { label: "Servicios", href: "#services" },
    { label: "Otras Gestiones", href: "#otras-gestiones" },
    { label: "Grupo INCOSA", href: "#group" },
    { label: "Contacto", href: "#contact" }
  ];

  const services = [
    "Servicios Funerarios",
    "Cementerios",
    "Cremaciones",
    "Velatorios",
    "Gestión de Documentos"
  ];

  const handleScrollToSection = (href: string) => {
    scrollToSectionUtil(href.replace('#', ''));
  };

  return (
    <footer className="bg-elegant-gray text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logo} 
                alt="Jardines del Recuerdo" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">Jardines del Recuerdo</h3>
                <p className="text-primary-gold text-sm">Grupo INCOSA</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              Con más de 50 años de trayectoria, hemos acompañado a las familias hondureñas
              con respeto, calidad y ética en los momentos más significativos. Nos distinguimos
              por la excelencia, innovación y confianza en cada servicio que brindamos.
            </p>

            <div className="bg-primary-gold/20 rounded-lg p-3 mb-6 inline-block">
              <p className="text-white font-semibold text-sm">
                🕐 Atención 24 horas / 7 días a la semana
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary-gold" />
                <span className="text-white/90">(504) 2234-5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary-gold" />
                <span className="text-white/90">info@jardinesdelrecuerdo.hn</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-primary-gold" />
                <span className="text-white/90">Colonia Palmira, Tegucigalpa, Honduras</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleScrollToSection(link.href)}
                    className="text-white/80 hover:text-primary-gold smooth-transition text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Nuestros Servicios</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-white/80">
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm">
              © {currentYear} Jardines del Recuerdo - Grupo INCOSA. Todos los derechos reservados.
            </div>
            
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <span>Hecho con</span>
              <Heart size={16} className="text-red-400" />
              <span>para las familias hondureñas</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs">
              Atención 24/7 • Servicios de emergencia disponibles • Cobertura nacional en Honduras
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};