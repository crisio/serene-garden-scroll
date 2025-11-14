import { useQuery } from "@tanstack/react-query";
import { strapiApi, mediaUrl } from "@/lib/strapiClient";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const StrapiCarousel = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["carussell-images"],
    queryFn: () => strapiApi.getCarouselImages(),
    staleTime: 5 * 60 * 1000,
  });

  if (error || !data) return null;

  const items = data.data;
  if (!items.length) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <Carousel className="w-full">
        <CarouselContent>
          {items.map((item, idx) => {
            // Try to locate a media field heuristically
            const attrs = item.attributes as any;
            const mediaField = attrs?.imagen || attrs?.image || attrs?.media;
            const url = mediaField?.data?.attributes?.url
              ? mediaUrl(mediaField.data.attributes.url)
              : undefined;

            return (
              <CarouselItem key={item.id ?? idx}>
                <div className="relative h-56 md:h-80 lg:h-96 rounded-xl overflow-hidden">
                  {url ? (
                    <img src={url} alt={attrs?.title || `slide-${idx+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      Imagen de carrusel no configurada
                    </div>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default StrapiCarousel;
