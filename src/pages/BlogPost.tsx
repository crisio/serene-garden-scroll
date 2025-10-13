import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { strapiApi, mediaUrl, type Post } from "@/lib/strapiClient";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch post by slug
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => strapiApi.getPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract post data
  const post = data?.data?.[0];
  const postAttributes = post?.attributes;

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share && postAttributes) {
      try {
        await navigator.share({
          title: postAttributes.titulo,
          text: postAttributes.resumen || postAttributes.titulo,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post || !postAttributes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {error ? "Error al cargar el artículo" : "Artículo no encontrado"}
              </h1>
              <p className="text-slate-600 mb-6">
                {error 
                  ? "Ocurrió un error al intentar cargar el artículo. Por favor intenta de nuevo."
                  : `No se pudo encontrar un artículo con el slug "${slug}".`
                }
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Link to="/blog">
                  <Button>Ver todos los artículos</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get image URL
  const imageUrl = postAttributes.imagen?.data?.attributes?.url 
    ? mediaUrl(postAttributes.imagen.data.attributes.url)
    : null;

  // Format date
  const publishedDate = new Date(postAttributes.publishedAt || postAttributes.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Estimate reading time (rough calculation based on word count)
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const readingTime = estimateReadingTime(postAttributes.contenido);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate(-1)} 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          {/* Hero image */}
          {imageUrl && (
            <div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt={postAttributes.imagen?.data?.attributes?.alternativeText || postAttributes.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article header */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {postAttributes.titulo}
              </h1>
              
              {postAttributes.resumen && (
                <p className="text-lg text-slate-600 leading-relaxed">
                  {postAttributes.resumen}
                </p>
              )}
            </div>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-t border-slate-200 pt-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {publishedDate}
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {readingTime} min de lectura
              </div>

              <Button 
                onClick={handleShare}
                variant="ghost" 
                size="sm"
                className="ml-auto text-slate-500 hover:text-slate-700"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Article content */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div 
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-blockquote:border-primary prose-blockquote:text-slate-600 prose-code:text-primary prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ 
                __html: postAttributes.contenido 
              }}
            />
          </div>

          {/* Footer navigation */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="text-center">
              <Link to="/blog">
                <Button variant="outline" className="bg-white">
                  Ver más artículos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}