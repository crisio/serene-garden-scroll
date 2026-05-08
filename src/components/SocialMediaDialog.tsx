import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchContactSection, fetchSiteHeader } from "@/lib/strapi";

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialMediaDialog = ({ isOpen, onClose }: SocialMediaDialogProps) => {
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/jardinesdelrecuerdo");
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/50425567400");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/jardinesdelrecuerdo");
  const [emailAddress, setEmailAddress] = useState("info@funeralesdelnorte.com");
  const [phoneTarget, setPhoneTarget] = useState("tel:+50425024330");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const extractFirstEmail = (value: string) => {
      const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      return match?.[0]?.toLowerCase();
    };

    const toTelHref = (raw?: string | null) => {
      if (!raw) return null;
      const cleaned = raw.replace(/[^\d+]/g, "");
      if (!cleaned) return null;
      // Si no empieza con + y tiene 8 digitos (Honduras local), agrega prefijo 504.
      if (!cleaned.startsWith("+")) {
        const digits = cleaned;
        return `tel:+${digits.length === 8 ? "504" + digits : digits}`;
      }
      return `tel:${cleaned}`;
    };

    const loadContactData = async () => {
      try {
        const [headerData, contactData] = await Promise.all([
          fetchSiteHeader(),
          fetchContactSection(),
        ]);

        if (!isMounted) {
          return;
        }

        if (headerData.instagramUrl) {
          setInstagramUrl(headerData.instagramUrl);
        }
        if (headerData.facebookUrl) {
          setFacebookUrl(headerData.facebookUrl);
        }
        if (headerData.whatsappNumber) {
          setWhatsappUrl(`https://wa.me/${headerData.whatsappNumber}`);
        }

        const firstEmail = contactData.contactinfo
          .map((item) => extractFirstEmail(item.info))
          .find((email): email is string => Boolean(email));

        if (firstEmail) {
          setEmailAddress(firstEmail);
        }

        const tel = toTelHref(contactData.emergencyPhone);
        if (tel) {
          setPhoneTarget(tel);
        }
      } catch (error) {
        console.error("Error loading SocialMediaDialog data:", error);
      }
    };

    loadContactData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: whatsappUrl,
      color: "bg-[#25D366] hover:bg-[#25D366]/90",
      description: "Chatea con nosotros"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: facebookUrl,
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
      description: "Síguenos en Facebook"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: instagramUrl,
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
      description: "Visítanos en Instagram"
    },
    {
      name: "Correo",
      icon: Mail,
      url: `mailto:${emailAddress}`,
      color: "bg-gray-600 hover:bg-gray-600/90",
      description: "Envíanos un email"
    },
    {
      name: "Teléfono",
      icon: Phone,
      url: phoneTarget,
      color: "bg-primary-green hover:bg-primary-green/90",
      description: "Llámanos directamente"
    }
  ];

  const handleSocialClick = (url: string) => {
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
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
