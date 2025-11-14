import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Share2, MapPin, User, Phone, Clock } from "lucide-react";
import { fetchObituary, fetchContactSection, type Obituary } from "@/lib/strapi";

// Helper function to render Strapi Blocks (same as BlogPost)
function renderBlocks(blocks: any[]): JSX.Element[] {
  if (!Array.isArray(blocks)) return [];
  
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4">
            {renderChildren(block.children)}
          </p>
        );
      case 'heading':
        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-bold mb-4">
            {renderChildren(block.children)}
          </HeadingTag>
        );
      case 'list':
        const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={index} className="mb-4 ml-6 list-disc">
            {block.children?.map((item: any, i: number) => (
              <li key={i}>{renderChildren(item.children)}</li>
            ))}
          </ListTag>
        );
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4">
            {renderChildren(block.children)}
          </blockquote>
        );
      case 'code':
        return (
          <pre key={index} className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto my-4">
            <code>{renderChildren(block.children)}</code>
          </pre>
        );
      case 'image':
        return (
          <img
            key={index}
            src={block.image.url}
            alt={block.image.alternativeText || ''}
            className="rounded-lg my-4"
          />
        );
      default:
        return <div key={index}>{renderChildren(block.children)}</div>;
    }
  });
}

function renderChildren(children: any[]): React.ReactNode {
  if (!Array.isArray(children)) return null;
  
  return children.map((child, index) => {
    if (child.type === 'text') {
      let text: React.ReactNode = child.text;
      
      if (child.bold) text = <strong key={index}>{text}</strong>;
      if (child.italic) text = <em key={index}>{text}</em>;
      if (child.underline) text = <u key={index}>{text}</u>;
      if (child.strikethrough) text = <del key={index}>{text}</del>;
      if (child.code) text = <code key={index} className="bg-slate-100 px-1 rounded">{text}</code>;
      
      return text;
    }
    
    if (child.type === 'link') {
      return (
        <a key={index} href={child.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          {renderChildren(child.children)}
        </a>
      );
    }
    
    return null;
  });
}

export default function ObituaryPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [obituary, setObituary] = useState<Obituary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState("(504) 2234-5678");

  useEffect(() => {
    if (!slug) {
      setError(true);
      setIsLoading(false);
      return;
    }

    Promise.all([
      fetchObituary(slug),
      fetchContactSection(),
    ])
      .then(([obituaryData, contactData]) => {
        if (obituaryData) {
          setObituary(obituaryData);
        } else {
          setError(true);
        }
        if (contactData.emergencyPhone) {
          setEmergencyPhone(contactData.emergencyPhone);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share && obituary) {
      try {
        await navigator.share({
          title: `En memoria de ${obituary.fullName}`,
          text: `Obituario de ${obituary.fullName}`,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="h-96 w-full mb-8" />
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
  if (error || !obituary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {error ? "Error al cargar el obituario" : "Obituario no encontrado"}
              </h1>
              <p className="text-slate-600 mb-6">
                {error 
                  ? "Ocurrió un error al intentar cargar el obituario. Por favor intenta de nuevo."
                  : `No se pudo encontrar un obituario con el slug "${slug}".`
                }
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Link to="/obituarios">
                  <Button>Ver todos los obituarios</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate age
  const calculateAge = (birthDate: string, deathDate: string) => {
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    let age = death.getFullYear() - birth.getFullYear();
    const monthDiff = death.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format dates
  const birthDateFormatted = new Date(obituary.birthDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const deathDateFormatted = new Date(obituary.deathDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const ceremonyDateFormatted = obituary.ceremonyDate 
    ? new Date(obituary.ceremonyDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const age = calculateAge(obituary.birthDate, obituary.deathDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          {/* Obituary Container */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Profile Image */}
            {obituary.profileImageUrl && (
              <div className="relative h-96 md:h-[500px] overflow-hidden bg-slate-100">
                <img
                  src={obituary.profileImageUrl}
                  alt={obituary.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8 md:p-12 lg:p-16">
              {/* Title */}
              <div className="text-center mb-8 pb-8 border-b">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  {obituary.fullName}
                </h1>
                <p className="text-xl text-slate-600">
                  {new Date(obituary.birthDate).getFullYear()} - {new Date(obituary.deathDate).getFullYear()} • {age} años
                </p>
              </div>

              {/* Dates and Location Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Nacimiento</p>
                      <p className="text-slate-600">{birthDateFormatted}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Fallecimiento</p>
                      <p className="text-slate-600">{deathDateFormatted}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {ceremonyDateFormatted && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Ceremonia</p>
                        <p className="text-slate-600">{ceremonyDateFormatted}</p>
                      </div>
                    </div>
                  )}
                  {obituary.ceremonyLocation && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Ubicación</p>
                        <p className="text-slate-600">{obituary.ceremonyLocation}</p>
                      </div>
                    </div>
                  )}
                  {obituary.funeralHome && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Funeraria</p>
                        <p className="text-slate-600">{obituary.funeralHome}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button */}
              <div className="flex justify-end mb-6">
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>

              {/* Biography */}
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-img:rounded-lg mb-8">
                {renderBlocks(obituary.biography)}
              </div>

              {/* Gallery */}
              {obituary.galleryImageUrls.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Galería de Fotos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {obituary.galleryImageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                        <img
                          src={imageUrl}
                          alt={`Foto ${index + 1} de ${obituary.fullName}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA - Llamar a un Asesor */}
              <div className="mt-12 mb-8 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    ¿Necesitas asistencia o información?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Nuestros asesores están disponibles 24/7 para apoyarte en este momento difícil
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href={`tel:${emergencyPhone}`}>
                      <Button size="lg" className="gap-2 w-full sm:w-auto">
                        <Phone className="h-5 w-5" />
                        Llamar Ahora
                      </Button>
                    </a>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <Phone className="h-5 w-5 text-primary" />
                      {emergencyPhone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Obituaries */}
              <div className="mt-8 pt-8 border-t">
                <Link to="/obituarios">
                  <Button variant="outline" className="w-full md:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ver más obituarios
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
