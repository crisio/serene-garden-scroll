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
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-3">
      {/* Botón de WhatsApp */}
      <Button
        onClick={handleWhatsApp}
        className="bg-[#25D366] hover:bg-[#25D366] text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 hover:w-auto hover:px-6 flex items-center justify-center group"
        size="lg"
      >
        <MessageCircle size={24} fill="currentColor" className="flex-shrink-0" />
        <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2">CONTACTANOS</span>
      </Button>

      {/* Botón de Necesidad Inmediata */}
      <Button
        onClick={handleEmergencyCall}
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 hover:w-auto hover:px-6 flex items-center justify-center group"
        size="lg"
      >
        <Phone size={20} className="flex-shrink-0" />
        <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2">NECESIDAD INMEDIATA</span>
      </Button>
    </div>
);
};