import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Phone } from "lucide-react";
import { fetchFloatingButtons } from "@/lib/strapi";

interface PreventionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreventionDialog = ({ isOpen, onClose }: PreventionDialogProps) => {
  const [preverPhones, setPreverPhones] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    fetchFloatingButtons()
      .then((data) => {
        if (!isMounted || !data?.buttons) {
          return;
        }

        const preverButton = data.buttons.find((btn: any) => btn.label === "PREVER");
        if (preverButton?.phoneNumbers && Array.isArray(preverButton.phoneNumbers)) {
          const phones = preverButton.phoneNumbers.map((item: any) => ({
            label: item.label,
            phoneNumber: item.phoneNumber.trim(),
            city: item.city
          }));
          setPreverPhones(phones);
        }
      })
      .catch((error) => {
        console.error("Error loading prevention phones:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleWhatsApp = () => {
    const mensaje = "Hola, me interesa información sobre planes de previsión para proteger a mi familia";
    window.open("https://wa.me/50499746421?text=" + encodeURIComponent(mensaje), "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-green" />
            </div>
            <DialogTitle className="text-2xl font-bold text-primary-green">
              Planes de Previsión
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Protege a los que más amas hoy. Nuestros planes de previsión te ofrecen tranquilidad 
            y seguridad para tu familia en el futuro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary-green/5 p-4 rounded-lg">
            <h4 className="font-semibold text-primary-green mb-2">¿Por qué planificar?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-1">•</span>
                <span>Protección económica para tu familia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-1">•</span>
                <span>Planes flexibles y accesibles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-1">•</span>
                <span>Asesoría personalizada sin compromiso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-1">•</span>
                <span>Cobertura inmediata desde el primer pago</span>
              </li>
            </ul>
          </div>

          <div className="hidden">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white justify-start h-14 w-full"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" />
              <div className="text-left">
                <div className="font-semibold">WhatsApp con Katy</div>
                <div className="text-xs opacity-90">Asesora de Previsión</div>
              </div>
            </Button>
          </div>

          <div className="border-t mt-4 pt-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-700">Llamanos directamente:</p>
            {preverPhones.length > 0 ? (
              preverPhones.map((phone: any, index: number) => (
                <a key={index} href={`tel:${phone.phoneNumber}`}>
                  <Button className="bg-primary-green hover:bg-primary-green/90 text-white justify-start gap-3 h-14 w-full">
                    <Phone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{phone.label}</div>
                      <div className="text-xs opacity-90">{phone.phoneNumber}</div>
                    </div>
                  </Button>
                </a>
              ))
            ) : (
              <Button className="bg-slate-200 text-slate-500 justify-start gap-3 h-14 w-full" disabled>
                <Phone className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Números no disponibles</div>
                </div>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
