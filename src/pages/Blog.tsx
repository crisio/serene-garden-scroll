import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Clock, ArrowRight, User, Home, ArrowLeft } from "lucide-react";
import { fetchBlogPosts, fetchBlogCategories, fetchSiteHeader, type BlogPost, type BlogCategory } from "@/lib/strapi";

const POSTS_PER_PAGE = 6;
const defaultLogo = "/lovable-uploads/07568c23-c994-4213-83cf-06bea56fbc27.png";

const extractTextFromChildren = (children: any[]): string => {
  if (!Array.isArray(children)) return "";

  return children
    .map((child) => {
      if (!child) return "";
      if (child.type === "text") return child.text || "";
      if (Array.isArray(child.children)) return extractTextFromChildren(child.children);
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractTextFromBlocks = (blocks: any[]): string => {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (!block) return "";

      if (Array.isArray(block.children)) {
        return extractTextFromChildren(block.children);
      }

      if (Array.isArray(block.body)) {
        return extractTextFromBlocks(block.body);
      }

      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const getPostSummary = (post: BlogPost, maxLength = 180): string => {
  const explicitExcerpt = post.excerpt?.trim();
  if (explicitExcerpt) return explicitExcerpt;

  const sectionText = post.sections
    .filter((section) => section.__component === "blog-post.rich-text-section")
    .map((section) => extractTextFromBlocks(section.body))
    .join(" ")
    .trim();

  const contentText = extractTextFromBlocks(post.content);
  const rawSummary = (sectionText || contentText || "Artículo disponible en nuestro blog").replace(/\s+/g, " ").trim();

  if (rawSummary.length <= maxLength) {
    return rawSummary;
  }

  return `${rawSummary.slice(0, maxLength).trim()}...`;
};

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);

  useEffect(() => {
    Promise.all([
      fetchBlogPosts(),
      fetchBlogCategories(),
      fetchSiteHeader(),
    ]).then(([postsData, categoriesData, headerData]) => {
      setPosts(postsData.posts);
      setFilteredPosts(postsData.posts);
      setCategories(categoriesData);
      if (headerData.logoUrl) setLogoUrl(headerData.logoUrl);
      setIsLoading(false);
    });
  }, []);

  // Filter posts by search and category
  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category?.slug === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(lowerSearch) ||
        getPostSummary(post).toLowerCase().includes(lowerSearch) ||
        post.author.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, posts]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => navigate("/", { state: { scrollTo: "top" } })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>

        {/* Header with Logo */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link to="/">
              <img 
                src={logoUrl} 
                alt="Jardines del Recuerdo" 
                className="h-24 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">Nuestro Blog</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Información, consejos y guías para acompañarte en los momentos importantes
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Ir a Página Principal
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.slug)}
                  style={
                    selectedCategory === category.slug && category.color
                      ? { backgroundColor: category.color, borderColor: category.color }
                      : undefined
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && (
          <>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron artículos</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm || selectedCategory
                      ? "No hay artículos que coincidan con tus filtros"
                      : "No hay artículos publicados aún."
                    }
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory(null);
                      }}
                      variant="outline"
                    >
                      Ver todos los artículos
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Post Card Component
interface PostCardProps {
  post: BlogPost;
}

function PostCard({ post }: PostCardProps) {
  const summary = getPostSummary(post);

  // Format date
  const publishedDate = new Date(post.publishedDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link to={`/blog/${post.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-white cursor-pointer h-full">
        {/* Image */}
        {post.featuredImageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          {/* Category Badge */}
          {post.category && (
            <Badge
              className="mb-2 w-fit"
              style={post.category.color ? { backgroundColor: post.category.color } : undefined}
            >
              {post.category.name}
            </Badge>
          )}

          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          
          {summary && (
            <CardDescription className="line-clamp-3">
              {summary}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {publishedDate}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min
            </div>
          </div>
          {post.author && (
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-2">
              <User className="h-4 w-4" />
              {post.author}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
            Leer más
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}