import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeatureGalleryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  images: Array<{
    id: number;
    url: string;
    alternativeText?: string;
    mimeType?: string;
  }>;
  cityName?: string;
  customDescription?: string;
};

export const FeatureGalleryModal = ({
  isOpen,
  onClose,
  featureName,
  images,
  cityName,
  customDescription,
}: FeatureGalleryModalProps) => {
  const DEFAULT_ZOOM = 0.9; // start slightly zoomed out so the full image is visible
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [videoError, setVideoError] = useState(false);

  const clampZoom = (value: number) => Math.min(3, Math.max(0.5, value));
  const handleZoom = (delta: number) => setZoom((prev) => clampZoom(prev + delta));
  const resetZoom = () => setZoom(DEFAULT_ZOOM);

  const truncateWords = (text: string, maxWords: number) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return `${words.slice(0, maxWords).join(" ")}...`;
  };

  const isVideo = (media: { url: string; mimeType?: string }) => {
    if (media.mimeType?.toLowerCase().startsWith("video")) return true;
    return /\.(mp4|webm|ogg|mov|m4v|avi)$/i.test(media.url) || media.mimeType?.toLowerCase().includes("quicktime") === true;
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    setZoom(DEFAULT_ZOOM);
    setVideoError(false);
  }, [currentIndex, isOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-elegant-gray mb-2">
            {featureName}
          </DialogTitle>
          {cityName && (
            <p className="text-sm text-muted-foreground">
              Servicio disponible en: <span className="font-semibold text-primary-green">{cityName}</span>
            </p>
          )}
          {customDescription && (
            <div className="mt-2">
              <div
                className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${
                  showFullDescription ? "max-h-40 overflow-y-auto pr-1" : "max-h-16 overflow-hidden"
                }`}
              >
                {showFullDescription ? customDescription : truncateWords(customDescription, 15)}
              </div>
              {customDescription.trim().split(/\s+/).length > 15 && (
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-primary-green hover:underline"
                  onClick={() => setShowFullDescription((prev) => !prev)}
                >
                  {showFullDescription ? "Ver menos" : "Ver más"}
                </button>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="mt-4">
          {images.length === 1 ? (
            // Single image display
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 max-h-[45vh]">
              {!isVideo(images[0]) && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleZoom(0.25)}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleZoom(-0.25)}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={resetZoom}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="relative w-full h-full overflow-auto">
                {isVideo(images[0]) ? (
                  videoError ? (
                    <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center gap-2 text-sm text-center px-4">
                      <span>No se pudo reproducir el video.</span>
                      <a href={images[0].url} target="_blank" rel="noreferrer" className="underline font-semibold">Abrir o descargar video</a>
                    </div>
                  ) : (
                    <video
                      key={`${images[0].id}-${currentIndex}`}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain bg-black"
                      playsInline
                      onError={() => setVideoError(true)}
                      onLoadedData={() => setVideoError(false)}
                    >
                      <source src={images[0].url} type={images[0].mimeType || "video/mp4"} />
                      Tu navegador no soporta reproducir este video. <a href={images[0].url} className="underline">Descargar</a>
                    </video>
                  )
                ) : (
                  <img
                    src={images[0].url}
                    alt={images[0].alternativeText || featureName}
                    className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
                  />
                )}
              </div>
            </div>
          ) : (
            // Carousel for multiple images
            <div className="relative">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 max-h-[45vh]">
                        {!isVideo(image) && (
                          <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleZoom(0.25)}>
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleZoom(-0.25)}>
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={resetZoom}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="relative w-full h-full overflow-auto">
                          {isVideo(image) ? (
                            videoError ? (
                              <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center gap-2 text-sm text-center px-4">
                                <span>No se pudo reproducir el video.</span>
                                <a href={image.url} target="_blank" rel="noreferrer" className="underline font-semibold">Abrir o descargar video</a>
                              </div>
                            ) : (
                              <video
                                key={`${image.id}-${currentIndex}`}
                                controls
                                preload="metadata"
                                className="w-full h-full object-contain bg-black"
                                playsInline
                                onError={() => setVideoError(true)}
                                onLoadedData={() => setVideoError(false)}
                              >
                                <source src={image.url} type={image.mimeType || "video/mp4"} />
                                Tu navegador no soporta reproducir este video. <a href={image.url} className="underline">Descargar</a>
                              </video>
                            )
                          ) : (
                            <img
                              src={image.url}
                              alt={image.alternativeText || `${featureName} - Imagen ${index + 1}`}
                              className="w-full h-full object-contain"
                              style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
                            />
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          )}

          {/* Thumbnails for multiple images */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-0 overflow-x-auto pb-1 pr-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    api?.scrollTo(index);
                  }}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? "border-primary-green scale-105"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {isVideo(image) ? (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-semibold">
                      Video
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.alternativeText || `Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
