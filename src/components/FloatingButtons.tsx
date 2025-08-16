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
    <div className="fixed right-4 bottom-4 z-50 flex flex-col space-y-3">
      {/* Botón de WhatsApp */}
      <Button
        onClick={handleWhatsApp}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl hover:shadow-2xl smooth-transition rounded-full w-14 h-14 p-0 relative group"
        size="icon"
      >
        <MessageCircle size={28} fill="currentColor" />
        <div className="absolute -left-40 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none whitespace-nowrap">
          Chat por WhatsApp
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
        </div>
      </Button>

      {/* Botón de Necesidad Inmediata */}
      <Button
        onClick={handleEmergencyCall}
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xl hover:shadow-2xl smooth-transition rounded-full px-6 py-3 flex items-center space-x-2 min-w-[200px] justify-center animate-pulse"
        size="lg"
      >
        <Phone size={20} />
        <span className="font-semibold">NECESIDAD INMEDIATA</span>
      </Button>
    </div>
  );
};