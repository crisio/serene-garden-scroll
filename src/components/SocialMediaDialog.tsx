import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSiteHeader, fetchContactSection } from "@/lib/strapi";

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialMediaDialog = ({ isOpen, onClose }: SocialMediaDialogProps) => {
  const [socialMedia, setSocialMedia] = useState({
    facebook: "https://facebook.com/jardinesdelrecuerdo",
    instagram: "https://instagram.com/jardinesdelrecuerdo",
    whatsapp: "50425567400",
  });
  
  const [contactInfo, setContactInfo] = useState<{
    email: string;
    phone: string;
  }>({
    email: "info@funeralesdelnorte.com",
    phone: "+50422345678",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos de redes sociales del header
        const headerData = await fetchSiteHeader();
        setSocialMedia({
          facebook: headerData.facebookUrl || "https://facebook.com/jardinesdelrecuerdo",
          instagram: headerData.instagramUrl || "https://instagram.com/jardinesdelrecuerdo",
          whatsapp: headerData.whatsappNumber || "50425567400",
        });

        // Cargar datos de contacto
        const contactData = await fetchContactSection();
        const emailInfo = contactData.contactinfo.find(item => item.icon === "Mail");
        const phoneInfo = contactData.contactinfo.find(item => item.icon === "Phone");
        
        setContactInfo({
          email: emailInfo?.info || "info@funeralesdelnorte.com",
          phone: phoneInfo?.info || "+50422345678",
        });
      } catch (error) {
        console.error("Error loading social media data:", error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/${socialMedia.whatsapp}?text=Hola, necesito información sobre sus servicios`,
      color: "bg-[#25D366] hover:bg-[#25D366]/90",
      description: "Chatea con nosotros"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: socialMedia.facebook,
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
      description: "Síguenos en Facebook"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: socialMedia.instagram,
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
      description: "Visítanos en Instagram"
    },
    {
      name: "Correo",
      icon: Mail,
      url: `mailto:${contactInfo.email}`,
      color: "bg-gray-600 hover:bg-gray-600/90",
      description: "Envíanos un email"
    },
    {
      name: "Teléfono",
      icon: Phone,
      url: `tel:${contactInfo.phone.replace(/\D/g, "")}`,
      color: "bg-primary-green hover:bg-primary-green/90",
      description: "Llámanos directamente"
    }
  ];

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary-green">
            Contáctanos
          </DialogTitle>
          <DialogDescription>
            Elige tu medio de contacto preferido
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <Button
                key={social.name}
                onClick={() => handleSocialClick(social.url)}
                className={`${social.color} text-white justify-start gap-4 h-14`}
                variant="default"
              >
                <IconComponent className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">{social.name}</div>
                  <div className="text-xs opacity-90">{social.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          Estamos disponibles 24/7 para atenderte
        </div>
      </DialogContent>
    </Dialog>
  );
};
