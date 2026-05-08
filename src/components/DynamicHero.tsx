import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { strapiApi, pickAttributes, pickMedia, pickMediaUrl } from "@/lib/strapiClient";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ChevronDown } from "lucide-react";

const VIDEO_EXT_RE = /\.(mp4|webm|mov|avi|m4v)$/i;
const VIDEO_MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
};

const guessVideoMime = (url?: string, fallback?: string) => {
  if (fallback) return fallback;
  if (!url) return "video/mp4";
  const m = url.match(VIDEO_EXT_RE);
  return (m && VIDEO_MIME_BY_EXT[m[1].toLowerCase()]) || "video/mp4";
};

const isVideoUrl = (url?: string, mime?: string) => {
  if (mime?.startsWith("video/")) return true;
  return !!url && VIDEO_EXT_RE.test(url);
};

const getOrigin = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * Inserta <link rel="preconnect"> y <link rel="preload" as="video"> para arrancar
 * la descarga del video del primer slide lo antes posible. Devuelve cleanup.
 */
const injectVideoPreload = (firstVideoUrl?: string) => {
  if (!firstVideoUrl) return () => {};
  const origin = getOrigin(firstVideoUrl);
  const head = document.head;
  const created: HTMLLinkElement[] = [];

  if (origin) {
    if (!head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const pc = document.createElement("link");
      pc.rel = "preconnect";
      pc.href = origin;
      pc.crossOrigin = "anonymous";
      head.appendChild(pc);
      created.push(pc);
    }
  }

  if (!head.querySelector(`link[rel="preload"][as="video"][href="${firstVideoUrl}"]`)) {
    const pl = document.createElement("link");
    pl.rel = "preload";
    pl.as = "video";
    pl.href = firstVideoUrl;
    (pl as any).fetchPriority = "high";
    head.appendChild(pl);
    created.push(pl);
  }

  return () => {
    created.forEach((el) => {
      try {
        head.removeChild(el);
      } catch {
        /* noop */
      }
    });
  };
};

const openCta = (url: string) => {
  if (!url) return;
  if (url.startsWith('http')) window.open(url, '_blank');
  else if (url.startsWith('tel:')) window.open(url, '_self');
  else window.location.href = url; // internal route
};

// Mapeo de tamaños de texto
const getTitleSizeClasses = (size: string = 'large') => {
  const sizeMap = {
    small: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[86px]',
    medium: 'text-5xl sm:text-6xl md:text-7xl lg:text-[86px] xl:text-[115px]',
    large: 'text-6xl sm:text-7xl md:text-[86px] lg:text-[115px] xl:text-[154px]',
    xlarge: 'text-7xl sm:text-[86px] md:text-[115px] lg:text-[154px] xl:text-[172px]',
  };
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.large;
};

const getSubtitleSizeClasses = (size: string = 'medium') => {
  const sizeMap = {
    small: 'text-sm sm:text-base md:text-base lg:text-lg xl:text-xl',
    medium: 'text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl',
    large: 'text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl',
  };
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;
};

export const DynamicHero = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => strapiApi.getHeroSlides(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, err) => {
      if (err instanceof Error && /401|unauthorized/i.test(err.message)) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // Hooks must not be conditional: declare them before any early return
  // Autoplay using Embla API
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const timerRef = useRef<number | null>(null);
  const intervalMs = 6000; // 6 seconds

  const slides = (data?.data ?? []).map((item) => pickAttributes<any>(item));

  // Pre-extraer media (url, mime) por slide para evitar recalculos en render
  const mediaList = useMemo(
    () => slides.map((attrs: any) => pickMedia(attrs.cover)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  useEffect(() => {
    // Only autoplay if we have a carousel and more than 1 slide
    if (!api || slides.length <= 1) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const run = () => api.scrollNext();
    timerRef.current = window.setInterval(run, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [api, slides.length]);

  // Sincronizar currentIdx con Embla
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentIdx(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Reproducir el video activo y pausar los demas. Asi solo gastamos ancho de
  // banda y CPU en el slide visible; los demas siguen con preload de metadata.
  useEffect(() => {
    videoRefs.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === currentIdx) {
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        try {
          v.pause();
          v.currentTime = 0;
        } catch {
          /* noop */
        }
      }
    });
  }, [currentIdx]);

  // Inyectar preconnect + preload para que el primer video empiece a bajar lo
  // antes posible (incluso antes de que el <video> se monte).
  useEffect(() => {
    const first = mediaList[0];
    if (!first?.url) return;
    if (!isVideoUrl(first.url, first.mime)) return;
    return injectVideoPreload(first.url);
  }, [mediaList]);

  // Fallback to static hero if error or no data
  if (error || slides.length === 0) return null;

  return (
    <section id="hero" className="relative h-screen w-full" style={{ minHeight: '100vh' }}>
      <Carousel
        className="w-full h-full"
        setApi={(embla) => setApi(embla)}
        opts={{ loop: true, align: 'start', skipSnaps: false }}
      >
        <CarouselContent className="h-full -ml-0" style={{ height: '100vh' }}>
          {slides.map((attrs: any, idx: number) => {
            const media = mediaList[idx] ?? {};
            const bg = media.url ?? pickMediaUrl(attrs.cover);
            const overlay = typeof attrs.overlayOpacity === 'number' ? attrs.overlayOpacity : 0.4;
            const isVideo = isVideoUrl(bg, media.mime);
            // Solo el slide activo y el siguiente bajan el video completo;
            // el resto se queda con metadata (~unos KB) hasta que toque verlos.
            const nextIdx = slides.length > 0 ? (currentIdx + 1) % slides.length : -1;
            const shouldPreloadFull = idx === currentIdx || idx === nextIdx;
            const videoMime = guessVideoMime(bg, media.mime);

            return (
              <CarouselItem key={idx} className="h-full pl-0 basis-full" style={{ height: '100vh' }}>
                <div className="relative w-full" style={{ height: '100vh' }}>
                  {/* Background media - video o imagen */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {bg && (
                      isVideo ? (
                        <video
                          ref={(el) => { videoRefs.current[idx] = el; }}
                          autoPlay={idx === 0}
                          muted
                          loop
                          playsInline
                          disablePictureInPicture
                          preload={shouldPreloadFull ? "auto" : "metadata"}
                          {...(idx === 0 ? { fetchpriority: "high" } : {})}
                          aria-hidden="true"
                          className="w-full h-full object-cover"
                        >
                          <source src={bg} type={videoMime} />
                        </video>
                      ) : (
                        <img
                          src={bg}
                          alt={attrs?.cover?.data?.attributes?.alternativeText || attrs?.title || `slide-${idx+1}`}
                          className="w-full h-full object-cover object-center"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          {...(idx === 0 ? { fetchpriority: "high" as any } : {})}
                        />
                      )
                    )}
                    {/* Overlay con gradiente */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"
                      style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${Math.min(overlay + 0.3, 0.8)}), transparent)` }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full w-full flex items-center justify-center">
                    <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center text-white">
                      <div className="max-w-5xl mx-auto space-y-0.5 sm:space-y-1 md:space-y-1.5">
                      {attrs.title && (
                        <h1 className={`${getTitleSizeClasses(attrs.titleSize)} leading-tight font-normal drop-shadow-lg`} style={{ fontFamily: 'edwardian_script_itcregular, "Allura", cursive' }}>
                          {attrs.title}
                        </h1>
                      )}
                      {attrs.subtitle && (
                        <p className={`${getSubtitleSizeClasses(attrs.subtitleSize)} leading-snug font-light opacity-95 line-clamp-2 sm:line-clamp-3 md:line-clamp-none px-1 sm:px-2 drop-shadow-md`} style={{ fontFamily: '"PT Serif", serif' }}>
                          {attrs.subtitle}
                        </p>
                      )}
                      {(attrs.ctaText && attrs.ctaUrl) && (
                        <div className="flex justify-center">
                          <Button
                            size="lg"
                            className="bg-primary-green hover:bg-primary-green/90 text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 md:px-10 md:py-5 text-sm sm:text-base md:text-xl smooth-transition shadow-lg"
                            onClick={() => openCta(attrs.ctaUrl)}
                          >
                            {attrs.ctaText}
                          </Button>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {slides.length > 1 && (
          <>
            <CarouselPrevious className="left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-white/30 text-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            <CarouselNext className="right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-white/30 text-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </>
        )}
        
        {/* Botón de scroll hacia abajo */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={() => {
              const nextSection = document.querySelector('#locations') || document.querySelector('#sucursales');
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-bounce shadow-xl"
            size="lg"
            title="Ir a sucursales"
          >
            <ChevronDown size={28} className="sm:w-8 sm:h-8" />
          </Button>
        </div>
      </Carousel>
    </section>
  );
};

export default DynamicHero;
