import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialMediaDialog = ({ isOpen, onClose }: SocialMediaDialogProps) => {
  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/50422345678?text=Hola, necesito información sobre sus servicios",
      color: "bg-[#25D366] hover:bg-[#25D366]/90",
      description: "Chatea con nosotros"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/funeralesdelnorte",
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
      description: "Síguenos en Facebook"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/funeralesdelnorte",
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
      description: "Visítanos en Instagram"
    },
    {
      name: "Correo",
      icon: Mail,
      url: "mailto:info@funeralesdelnorte.com",
      color: "bg-gray-600 hover:bg-gray-600/90",
      description: "Envíanos un email"
    },
    {
      name: "Teléfono",
      icon: Phone,
      url: "tel:+50422345678",
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
