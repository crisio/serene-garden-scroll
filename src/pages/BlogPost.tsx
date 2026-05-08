import { useState, useEffect, type SyntheticEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft, Calendar, Clock, Share2, User, Phone } from "lucide-react";
import {
  fetchBlogPost,
  fetchFloatingButtons,
  type BlogPost as BlogPostType,
  type BlogSection,
} from "@/lib/strapi";

const normalizeStrapiBaseUrl = (rawUrl?: string) => {
  const cleaned = (rawUrl ?? "http://localhost:1337").trim().replace(/\/+$/, "");
  const normalized = cleaned.replace(/\/admin$/, "").replace(/\/api$/, "");
  return normalized || "http://localhost:1337";
};

const STRAPI_BASE_URL = normalizeStrapiBaseUrl(import.meta.env.VITE_API_URL);

const toAbsoluteMediaUrl = (url?: string | null) =>
  !url ? "" : url.startsWith("http") ? url : `${STRAPI_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

const isVideoAsset = (mimeType?: string, url?: string) => {
  if (mimeType?.toLowerCase().startsWith("video")) return true;
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(url);
};

const getVideoAspectRatio = (videoWidth?: number, videoHeight?: number): number => {
  // Prefer 9:16 as default when metadata is not available yet.
  if (!videoWidth || !videoHeight) {
    return 9 / 16;
  }

  return videoHeight >= videoWidth ? 9 / 16 : 16 / 9;
};

type AdaptiveVideoProps = {
  src: string;
  mimeType?: string;
  poster?: string;
  caption?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
};

const AdaptiveVideo = ({
  src,
  mimeType,
  poster,
  caption,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}: AdaptiveVideoProps) => {
  const [ratio, setRatio] = useState<number>(9 / 16);
  const [isPortrait, setIsPortrait] = useState<boolean>(true);

  const handleLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const element = event.currentTarget;
    const nextRatio = getVideoAspectRatio(element.videoWidth, element.videoHeight);
    setRatio(nextRatio);
    setIsPortrait(nextRatio === 9 / 16);
  };

  return (
    <figure className="not-prose my-8">
      <div className={isPortrait ? "max-w-sm mx-auto" : "w-full"}>
        <AspectRatio ratio={ratio} className="overflow-hidden rounded-lg bg-black">
          <video
            className="w-full h-full object-cover"
            controls={controls}
            autoPlay={autoPlay}
            muted={autoPlay ? true : muted}
            loop={loop}
            playsInline
            preload="metadata"
            poster={poster}
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={src} type={mimeType || undefined} />
            Tu navegador no soporta reproducir este video.
          </video>
        </AspectRatio>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-slate-500 text-center">{caption}</figcaption>
      )}
    </figure>
  );
};

const toTrustedEmbedUrl = (rawUrl: string, autoplay = false): string | null => {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      let videoId = "";

      if (host === "youtu.be") {
        videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
      } else if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") || "";
      } else {
        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments[0] === "embed" && segments[1]) videoId = segments[1];
        if (segments[0] === "shorts" && segments[1]) videoId = segments[1];
      }

      if (!videoId) return null;
      const query = autoplay ? "?autoplay=1&mute=1" : "";
      return `https://www.youtube.com/embed/${videoId}${query}`;
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const segments = parsed.pathname.split("/").filter(Boolean);
      let videoId = segments.find((segment) => /^\d+$/.test(segment)) || "";

      if (!videoId && host === "player.vimeo.com") {
        const videoIndex = segments.findIndex((segment) => segment === "video");
        if (videoIndex >= 0 && segments[videoIndex + 1]) {
          videoId = segments[videoIndex + 1];
        }
      }

      if (!videoId) return null;
      const query = autoplay ? "?autoplay=1" : "";
      return `https://player.vimeo.com/video/${videoId}${query}`;
    }

    return null;
  } catch {
    return null;
  }
};

// Helper function to render Strapi Blocks
function renderBlocks(blocks: any[]): React.ReactNode[] {
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
      case 'image': {
        const blockImageUrl = toAbsoluteMediaUrl(block.image?.url);
        if (!blockImageUrl) return null;

        return (
          <img
            key={index}
            src={blockImageUrl}
            alt={block.image.alternativeText || ''}
            className="rounded-lg my-4"
          />
        );
      }
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

function renderSection(section: BlogSection, index: number): JSX.Element | null {
  const sectionKey = `${section.__component}-${section.id}-${index}`;

  if (section.__component === "blog-post.rich-text-section") {
    if (!section.body.length) return null;

    return (
      <div key={sectionKey} className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-img:rounded-lg">
        {renderBlocks(section.body)}
      </div>
    );
  }

  if (section.__component === "blog-post.image-section") {
    if (!section.imageUrl) return null;

    return (
      <figure key={sectionKey} className="not-prose my-8">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-slate-100">
          <img
            src={section.imageUrl}
            alt={section.alt || "Imagen del artículo"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </AspectRatio>
        {section.caption && (
          <figcaption className="mt-2 text-sm text-slate-500 text-center">{section.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (section.__component === "blog-post.video-upload-section") {
    if (!section.videoUrl) return null;

    return (
      <AdaptiveVideo
        key={sectionKey}
        src={section.videoUrl}
        mimeType={section.videoMimeType}
        poster={section.posterUrl}
        caption={section.caption}
        controls={section.controls}
        autoPlay={section.autoplay}
        muted={section.muted}
        loop={section.loop}
      />
    );
  }

  if (section.__component === "blog-post.video-embed-section") {
    const embedUrl = toTrustedEmbedUrl(section.url, section.autoplay);
    if (!embedUrl) return null;

    return (
      <figure key={sectionKey} className="not-prose my-8">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-black">
          <iframe
            src={embedUrl}
            title={section.title || "Video del artículo"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </AspectRatio>
        {section.caption && (
          <figcaption className="mt-2 text-sm text-slate-500 text-center">{section.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (section.__component === "blog-post.cta-section") {
    const target = section.openInNewTab ? "_blank" : undefined;
    const rel = section.openInNewTab ? "noopener noreferrer" : undefined;

    return (
      <aside key={sectionKey} className="not-prose my-8 p-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
        {section.title && <h3 className="text-2xl font-bold text-slate-900 mb-2">{section.title}</h3>}
        {section.description && <p className="text-slate-600 mb-4">{section.description}</p>}
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <a href={section.buttonUrl} target={target} rel={rel}>
            {section.buttonLabel}
          </a>
        </Button>
      </aside>
    );
  }

  return null;
}

function renderLegacyVideos(videos: BlogPostType["legacyVideos"]): JSX.Element | null {
  const videoAssets = videos.filter((video) => isVideoAsset(video.mimeType, video.url));

  if (videoAssets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {videoAssets.map((video, index) => (
        <AdaptiveVideo
          key={`${video.url}-${index}`}
          src={video.url}
          mimeType={video.mimeType}
          caption={video.name}
          controls
        />
      ))}
    </div>
  );
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
                <Button onClick={() => navigate("/blog")} variant="outline">
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

  const featuredIsVideo = isVideoAsset(post.featuredImageMimeType, post.featuredImageUrl);
  const hasSections = post.sections.length > 0;
  const hasRichTextSection = post.sections.some(
    (section) => section.__component === "blog-post.rich-text-section"
  );
  const hasInlineVideoSection = post.sections.some(
    (section) =>
      section.__component === "blog-post.video-upload-section" ||
      section.__component === "blog-post.video-embed-section"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/blog")}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          {/* Article Container */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Featured Media */}
            {post.featuredImageUrl && (
              <div className="relative overflow-hidden bg-slate-100">
                <AspectRatio ratio={16 / 9}>
                  {featuredIsVideo ? (
                    <video className="w-full h-full object-cover" controls preload="metadata">
                      <source src={post.featuredImageUrl} type={post.featuredImageMimeType || undefined} />
                      Tu navegador no soporta reproducir este video.
                    </video>
                  ) : (
                    <img
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </AspectRatio>
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

              {/* Interactive Content */}
              <div className="space-y-6">
                {hasSections ? (
                  <>
                    {post.sections.map((section, index) => renderSection(section, index))}
                    {!hasRichTextSection && post.content.length > 0 && (
                      <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-img:rounded-lg">
                        {renderBlocks(post.content)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-img:rounded-lg">
                    {renderBlocks(post.content)}
                  </div>
                )}

                {!hasInlineVideoSection && renderLegacyVideos(post.legacyVideos)}
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