import { useState } from "react";
import { Phone, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmergencyDialog } from "./EmergencyDialog";

export const FloatingButtons = () => {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);

  const handleEmergency = () => {
    setIsEmergencyDialogOpen(true);
  };

  const handlePrever = () => {
    // Contacto directo a Katy para prevención
    const mensaje = "Hola, me interesa información sobre planes de previsión para proteger a mi familia";
    window.open("https://wa.me/50499746421?text=" + encodeURIComponent(mensaje), "_blank");
  };

  const handleWhatsApp = () => {
    // Número de WhatsApp general
    window.open("https://wa.me/50422345678?text=Hola, necesito información sobre sus servicios", "_blank");
  };

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-8">
        {/* Botón de Prever */}
        <div className="relative">
          <Button
            onClick={handlePrever}
            className="bg-primary-green hover:bg-primary-green/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group opacity-70 hover:opacity-100 absolute right-0 hover:w-auto hover:px-4 p-0"
            size="sm"
            title="Protege a los que más amas hoy"
          >
            <Shield size={18} className="flex-shrink-0 ml-1" />
            <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">PREVER</span>
          </Button>
        </div>

        {/* Botón de WhatsApp */}
        <div className="relative">
          <Button
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group opacity-70 hover:opacity-100 absolute right-0 hover:w-auto hover:px-4 p-0"
            size="sm"
          >
            <MessageCircle size={18} fill="currentColor" className="flex-shrink-0 ml-1" />
            <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">CONTACTANOS</span>
          </Button>
        </div>

        {/* Botón de Emergencia */}
        <div className="relative">
          <Button
            onClick={handleEmergency}
            className="bg-destructive hover:bg-destructive/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group opacity-70 hover:opacity-100 absolute right-0 hover:w-auto hover:px-4 p-0 animate-pulse"
            size="sm"
          >
            <Phone size={18} className="flex-shrink-0 ml-1" />
            <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">EMERGENCIA</span>
          </Button>
        </div>
      </div>

      <EmergencyDialog
        isOpen={isEmergencyDialogOpen}
        onClose={() => setIsEmergencyDialogOpen(false)}
      />
    </>
  );
};