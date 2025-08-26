import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingButtons = () => {
  const handleEmergencyCall = () => {
    // Número de teléfono para necesidad inmediata
    window.open("tel:+50422345678", "_self");
  };

  const handleWhatsApp = () => {
    // Número de WhatsApp
    window.open("https://wa.me/50422345678?text=Hola, necesito información sobre sus servicios", "_blank");
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-6">
      {/* Botón de WhatsApp */}
      <div className="relative">
        <Button
          onClick={handleWhatsApp}
          className="bg-[#25D366] hover:bg-[#25D366] text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-10 h-10 flex items-center justify-center group opacity-60 hover:opacity-100 absolute right-0 hover:w-auto hover:px-4"
          size="sm"
        >
          <MessageCircle size={20} fill="currentColor" className="flex-shrink-0" />
          <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">CONTACTANOS</span>
        </Button>
      </div>

      {/* Botón de Necesidad Inmediata */}
      <div className="relative">
        <Button
          onClick={handleEmergencyCall}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-10 h-10 flex items-center justify-center group opacity-60 hover:opacity-100 absolute right-0 hover:w-auto hover:px-4"
          size="sm"
        >
          <Phone size={18} className="flex-shrink-0" />
          <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">NECESIDAD INMEDIATA</span>
        </Button>
      </div>
    </div>
);
};