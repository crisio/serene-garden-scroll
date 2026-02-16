import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Share2, User, Phone } from "lucide-react";
import { fetchBlogPost, fetchContactSection, fetchFloatingButtons, type BlogPost as BlogPostType } from "@/lib/strapi";

// Helper function to render Strapi Blocks
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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preverPhones, setPreverPhones] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) {
      setError(true);
      setIsLoading(false);
      return;
    }

    Promise.all([
      fetchBlogPost(slug),
      fetchFloatingButtons(),
    ])
      .then(([postData, floatingButtonsData]) => {
        if (postData) {
          setPost(postData);
        } else {
          setError(true);
        }
        // Extract all PREVER button phone numbers
        if (floatingButtonsData?.buttons) {
          const preverButton = floatingButtonsData.buttons.find(
            (btn: any) => btn.label === "PREVER"
          );
          if (preverButton?.phoneNumbers && Array.isArray(preverButton.phoneNumbers)) {
            const phones = preverButton.phoneNumbers.map((item: any) => ({
              label: item.label,
              phoneNumber: item.phoneNumber.trim(),
              city: item.city
            }));
            setPreverPhones(phones);
          }
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="max-w-6xl mx-auto">
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
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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

  // Format date
  const publishedDate = new Date(post.publishedDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

          {/* Article Container */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="relative h-96 md:h-[500px] overflow-hidden">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8 md:p-12 lg:p-16">
              {/* Category Badge */}
              {post.category && (
                <Badge
                  className="mb-4"
                  style={post.category.color ? { backgroundColor: post.category.color } : undefined}
                >
                  {post.category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                {post.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{publishedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{post.readTime} min de lectura</span>
                </div>
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-xl text-slate-600 mb-8 pb-8 border-b italic">
                  {post.excerpt}
                </div>
              )}

              {/* Rich Text Content */}
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-img:rounded-lg">
                {renderBlocks(post.content)}
              </div>

              {/* CTA - Llamar a un Asesor */}
              <div className="mt-12 mb-8 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    ¿Necesitas más información?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Nuestros asesores están disponibles 24/7 para atenderte y resolver todas tus dudas
                  </p>
                  {preverPhones.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3">
                      {preverPhones.map((phone: any, index: number) => (
                        <a key={index} href={`tel:${phone.phoneNumber}`}>
                          <Button size="lg" className="gap-2">
                            <Phone className="h-5 w-5" />
                            {phone.city}
                          </Button>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button size="lg" className="gap-2 w-full sm:w-auto" disabled>
                        <Phone className="h-5 w-5" />
                        No disponible
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Blog CTA */}
              <div className="mt-8 pt-8 border-t">
                <Link to="/blog">
                  <Button variant="outline" className="w-full md:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ver más artículos
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