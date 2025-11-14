import { useState, useEffect } from "react";
import { Heart, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { scrollToSection as scrollToSectionUtil } from "@/lib/scrollUtils";
import { fetchFooter, type FooterData } from "@/lib/strapi";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetchFooter().then(setFooterData);
  }, []);

  if (!footerData) {
    return null;
  }

  return (
    <footer className="bg-elegant-gray text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={footerData.logoUrl || logo} 
                alt={footerData.title} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">{footerData.title}</h3>
                <p className="text-primary-gold text-sm">{footerData.subtitle}</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              {footerData.description}
            </p>

            <div className="bg-primary-gold/20 rounded-lg p-3 mb-6 inline-block">
              <p className="text-white font-semibold text-sm">
                🕐 {footerData.availabilityText}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary-gold" />
                <span className="text-white/90">{footerData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary-gold" />
                <span className="text-white/90">{footerData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-primary-gold" />
                <span className="text-white/90">{footerData.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {footerData.quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleScrollToSection(link.url)}
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
              {footerData.servicesLinks.map((link) => (
                <li key={link.id} className="text-white/80">
                  {link.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm">
              {footerData.copyrightText}
            </div>
            
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <span>{footerData.madeWithText.split('❤️')[0]}</span>
              <Heart size={16} className="text-red-400" />
              <span>{footerData.madeWithText.split('❤️')[1]}</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs">
              {footerData.servicesFooterText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};