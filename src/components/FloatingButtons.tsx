import { useState, useEffect } from "react";
import { Phone, Shield, MessageCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreventionDialog } from "./PreventionDialog";
import { SocialMediaDialog } from "./SocialMediaDialog";
import { fetchFloatingButtons, type FloatingButton } from "@/lib/strapi";

export const FloatingButtons = () => {
  const [isPreventionDialogOpen, setIsPreventionDialogOpen] = useState(false);
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Strapi data
  const [mobileHelpText, setMobileHelpText] = useState("¿Necesitas ayuda?");
  const [buttons, setButtons] = useState<FloatingButton[]>([]);

  // Load floating buttons from Strapi
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFloatingButtons();
        setMobileHelpText(data.mobileHelpText);
        setButtons(data.buttons);
      } catch (error) {
        console.error("Failed to load floating buttons:", error);
      }
    })();
  }, []);

  const getIcon = (iconName: string, size: number = 18) => {
    switch (iconName) {
      case "shield":
        return <Shield size={size} />;
      case "message":
        return <MessageCircle size={size} fill="currentColor" />;
      case "phone":
        return <Phone size={size} />;
      default:
        return <Phone size={size} />;
    }
  };

  const handleButtonClick = (button: FloatingButton) => {
    switch (button.action) {
      case "prevention-dialog":
        setIsPreventionDialogOpen(true);
        break;
      case "social-dialog":
        setIsSocialDialogOpen(true);
        break;
      case "call":
        if (button.phoneNumber) {
          window.location.href = `tel:${button.phoneNumber}`;
        }
        break;
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const desktopButtons = buttons.filter(btn => btn.showOnDesktop);
  const mobileButtons = buttons.filter(btn => btn.showOnMobile);

  return (
    <>
      {/* Desktop - Botones verticales a la derecha */}
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col items-end gap-3">
        {desktopButtons.map((button) => (
          <Button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={`hover:opacity-100 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group opacity-70 hover:w-auto hover:px-4 p-0 ${
              button.action === 'call' ? 'animate-pulse' : ''
            }`}
            style={{ backgroundColor: button.color }}
            size="sm"
            title={button.label}
          >
            {getIcon(button.icon, 18)}
            <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 text-sm">
              {button.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Mobile - Botón de acción con menú desplegable */}
      <div className="md:hidden fixed right-2 bottom-0 z-50 flex flex-col items-end gap-2 pb-2">
        {/* Botones que se despliegan hacia arriba */}
        <div className={`flex flex-col items-end gap-2 transition-all duration-300 origin-bottom ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}>
          {mobileButtons.map((button, index) => (
            <div key={button.id} className="flex items-center justify-end gap-2">
              <div 
                className={`text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{ 
                  backgroundColor: button.color,
                  transitionDelay: `${index * 75}ms`
                }}
              >
                {button.label.charAt(0).toUpperCase() + button.label.slice(1).toLowerCase()}
              </div>
              <Button
                onClick={() => handleButtonClick(button)}
                className={`text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 ${
                  button.action === 'call' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: button.color }}
                size="sm"
                title={button.label}
              >
                {getIcon(button.icon, 22)}
              </Button>
            </div>
          ))}
        </div>

        {/* Botón principal de acción con efecto brillante */}
        <div className="relative flex items-center gap-3">
          {/* Leyenda "¿Necesitas ayuda?" - Solo móvil */}
          {!isMenuOpen && (
            <div className="md:hidden bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shadow-xl animate-pulse">
              {mobileHelpText}
            </div>
          )}
          
          <div className="relative">
            {/* Efecto de pulso brillante */}
            {!isMenuOpen && (
              <>
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 via-green-300 to-green-400 opacity-75 blur-sm animate-pulse"></div>
              </>
            )}
            <Button
              onClick={toggleMenu}
              className={`relative bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full w-16 h-16 flex items-center justify-center`}
              size="lg"
              title={isMenuOpen ? "Cerrar" : "Llamar"}
            >
              {isMenuOpen ? <X size={28} className="rotate-45" /> : <Phone size={28} />}
            </Button>
          </div>
        </div>
      </div>

      <PreventionDialog
        isOpen={isPreventionDialogOpen}
        onClose={() => setIsPreventionDialogOpen(false)}
      />

      <SocialMediaDialog
        isOpen={isSocialDialogOpen}
        onClose={() => setIsSocialDialogOpen(false)}
      />
    </>
  );
};