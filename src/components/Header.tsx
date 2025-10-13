import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
const logo = "/lovable-uploads/07568c23-c994-4213-83cf-06bea56fbc27.png";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100; // Altura del header + espacio adicional
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "INICIO", id: "hero" },
    { label: "UBICACIONES", id: "locations" },
    { label: "NOSOTROS", id: "about" },
    { label: "SERVICIOS", id: "services" },
    { label: "OTRAS GESTIONES", id: "otras-gestiones" },
    { label: "GRUPO INCOSA", id: "group" },
    { label: "CONTÁCTENOS", id: "contact" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 smooth-transition bg-card/95 backdrop-blur-md elegant-shadow"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 smooth-transition">
            <img
              src={logo}
              alt="Jardines del Recuerdo"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain"
            />
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-bold text-primary-green">
                Jardines del Recuerdo
              </h1>
              <p className="text-sm text-muted-foreground">
                Más de 50 años de experiencia
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {location.pathname === '/' ? (
              <>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-sm font-medium text-foreground hover:text-primary-green smooth-transition relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  to="/blog"
                  className="text-sm font-medium text-foreground hover:text-primary-green smooth-transition relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  BLOG
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium text-foreground hover:text-primary-green smooth-transition relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  INICIO
                </Link>
                <Link
                  to="/blog"
                  className={`text-sm font-medium smooth-transition relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 ${
                    location.pathname.startsWith('/blog') 
                      ? 'text-primary-green after:scale-x-100' 
                      : 'text-foreground hover:text-primary-green after:scale-x-0 hover:after:scale-x-100 hover:after:origin-bottom-left'
                  }`}
                >
                  BLOG
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {location.pathname === '/' ? (
                <>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left text-sm font-medium text-foreground hover:text-primary-green smooth-transition"
                    >
                      {item.label}
                    </button>
                  ))}
                  <Link
                    to="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-left text-sm font-medium text-foreground hover:text-primary-green smooth-transition"
                  >
                    BLOG
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-left text-sm font-medium text-foreground hover:text-primary-green smooth-transition"
                  >
                    INICIO
                  </Link>
                  <Link
                    to="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-left text-sm font-medium smooth-transition ${
                      location.pathname.startsWith('/blog') 
                        ? 'text-primary-green' 
                        : 'text-foreground hover:text-primary-green'
                    }`}
                  >
                    BLOG
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};