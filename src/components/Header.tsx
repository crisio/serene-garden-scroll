import { useState, useEffect, useMemo } from "react";
import { Menu, X, Facebook, Instagram, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchSiteHeader } from "@/lib/strapi";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const defaultLogo = "/lovable-uploads/07568c23-c994-4213-83cf-06bea56fbc27.png";

type BuiltNav = { key: string; label: string; onClick: () => void };

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Strapi-driven header state
  const [title, setTitle] = useState("Jardines del Recuerdo");
  const [subtitle, setSubtitle] = useState("Más de 50 años de experiencia");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [secondaryLogoUrl, setSecondaryLogoUrl] = useState<string | undefined>(undefined);
  const [menu, setMenu] = useState<BuiltNav[]>([]);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "https://facebook.com/jardinesdelrecuerdo",
    instagram: "https://instagram.com/jardinesdelrecuerdo",
    whatsapp: "50425567400",
  });

  const atHome = useMemo(() => location.pathname === "/", [location.pathname]);

  // Load header data from Strapi on mount
  useEffect(() => {
    (async () => {
      try {
        console.log("Loading header data from Strapi...");
        const hdr = await fetchSiteHeader();

        console.log("Strapi response:", { hdr });

        setTitle(hdr.title || "Jardines del Recuerdo");
        setSubtitle(hdr.subtitle || "Más de 50 años de experiencia");
        if (hdr.logoUrl) setLogoUrl(hdr.logoUrl);
        setSecondaryLogoUrl(hdr.secondaryLogoUrl);
        
        setSocialMedia({
          facebook: hdr.facebookUrl || "https://facebook.com/jardinesdelrecuerdo",
          instagram: hdr.instagramUrl || "https://instagram.com/jardinesdelrecuerdo",
          whatsapp: hdr.whatsappNumber || "50425567400",
        });

        // Build navigation handlers
        const built = hdr.navItems.map((it, i) => {
          const key = `${it.label}-${i}`;
          
          if (it.type === "anchor") {
            return {
              key,
              label: it.label,
              onClick: () => {
                const el = document.getElementById(it.value);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
                setIsMobileMenuOpen(false);
              },
            };
          }
          
          if (it.type === "route") {
            return {
              key,
              label: it.label,
              onClick: () => {
                navigate(it.value);
                setIsMobileMenuOpen(false);
              },
            };
          }
          
          // external
          return {
            key,
            label: it.label,
            onClick: () => {
              window.open(it.value, "_blank", "noopener,noreferrer");
              setIsMobileMenuOpen(false);
            },
          };
        });

        console.log("Built menu items:", built);

        // Fallback menu if Strapi returns nothing
        setMenu(
          built.length
            ? built
            : [
                {
                  key: "fb-hero",
                  label: "INICIO",
                  onClick: () => {
                    const el = document.getElementById("hero");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                    setIsMobileMenuOpen(false);
                  },
                },
                {
                  key: "fb-blog",
                  label: "BLOG",
                  onClick: () => {
                    navigate("/blog");
                    setIsMobileMenuOpen(false);
                  },
                },
              ]
        );

        console.log("Header data loaded:", { title: hdr.title, navItems: hdr.navItems.length, menuLength: built.length });
      } catch (error) {
        console.error("Failed to load header data:", error);
        // Set fallback menu on error
        setMenu([
          {
            key: "fb-hero",
            label: "INICIO",
            onClick: () => {
              const el = document.getElementById("hero");
              if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
              setIsMobileMenuOpen(false);
            },
          },
          {
            key: "fb-blog",
            label: "BLOG",
            onClick: () => {
              navigate("/blog");
              setIsMobileMenuOpen(false);
            },
          },
        ]);
      }
    })();
  }, [navigate]); // Solo navigate como dependencia

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayLogo = logoUrl || defaultLogo;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 smooth-transition bg-card/95 backdrop-blur-md elegant-shadow"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 smooth-transition">
            <img
              src={displayLogo}
              alt={title}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain"
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-primary-green">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {atHome ? (
              <>
                {menu.map((item) => (
                  <button
                    key={item.key}
                    onClick={item.onClick}
                    className="text-[0.7rem] font-bold text-foreground hover:text-primary-green smooth-transition relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {item.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-[0.7rem] font-bold text-foreground hover:text-primary-green smooth-transition relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  INICIO
                </Link>
                <Link
                  to="/blog"
                  className={`text-[0.7rem] font-bold smooth-transition relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-green after:origin-bottom-right after:transition-transform after:duration-300 ${
                    location.pathname.startsWith('/blog')
                      ? 'text-primary-green after:scale-x-100'
                      : 'text-foreground hover:text-primary-green after:scale-x-0 hover:after:scale-x-100 hover:after:origin-bottom-left'
                  }`}
                >
                  BLOG
                </Link>
              </>
            )}
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={`https://wa.me/${socialMedia.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
              {secondaryLogoUrl && (
                <img
                  src={secondaryLogoUrl}
                  alt="Logo secundario"
                  className="h-10 w-auto object-contain ml-1 pl-2 border-l border-border/80"
                />
              )}
            </div>
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
          <div className="lg:hidden absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
            <div className="container mx-auto px-4 py-4 max-h-[70vh] overflow-y-auto">
              <nav className="flex flex-col space-y-4">
              {atHome ? (
                <>
                  {menu.map((item) => (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      className="text-left text-[0.7rem] font-bold text-foreground hover:text-primary-green smooth-transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-left text-[0.7rem] font-bold text-foreground hover:text-primary-green smooth-transition"
                  >
                    INICIO
                  </Link>
                  <Link
                    to="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-left text-[0.7rem] font-bold smooth-transition ${
                      location.pathname.startsWith('/blog')
                        ? 'text-primary-green'
                        : 'text-foreground hover:text-primary-green'
                    }`}
                  >
                    BLOG
                  </Link>
                </>
              )}
              
              {/* Social Media Icons - Mobile */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={`https://wa.me/${socialMedia.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-green/10 hover:bg-primary-green flex items-center justify-center text-primary-green hover:text-white smooth-transition"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={20} />
                </a>
                {secondaryLogoUrl && (
                  <img
                    src={secondaryLogoUrl}
                    alt="Logo secundario"
                    className="h-10 w-auto object-contain ml-auto"
                  />
                )}
              </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};