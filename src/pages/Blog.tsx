import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { strapiApi, mediaUrl, type StrapiList, type Post } from "@/lib/strapiClient";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts with search and pagination
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts", searchTerm, currentPage],
    queryFn: () => {
      if (searchTerm.trim()) {
        return strapiApi.searchPosts(searchTerm, {
          params: {
            pagination: {
              page: currentPage,
              pageSize: POSTS_PER_PAGE,
            },
          },
        });
      }
      
      return strapiApi.getPosts({
        params: {
          pagination: {
            page: currentPage,
            pageSize: POSTS_PER_PAGE,
          },
          filters: {
            publishedAt: {
              $notNull: true,
            },
          },
        },
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = data?.meta?.pagination?.pageCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Blog</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explora nuestros últimos artículos y descubre contenido fascinante
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar los posts</h3>
              <p className="text-red-700 mb-4">No se pudieron cargar los artículos. Por favor intenta de nuevo.</p>
              <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                Reintentar
              </Button>
            </div>
          </div>
        )}

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
        {!isLoading && !error && data && (
          <>
            {data.data.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron artículos</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm 
                      ? `No hay artículos que coincidan con "${searchTerm}"`
                      : "No hay artículos publicados aún."
                    }
                  </p>
                  {searchTerm && (
                    <Button onClick={() => handleSearch("")} variant="outline">
                      Ver todos los artículos
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((post) => (
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
  post: {
    id: number;
    attributes: Post;
  };
}

function PostCard({ post }: PostCardProps) {
  const { attributes } = post;
  
  // Get image URL
  const imageUrl = attributes.imagen?.data?.attributes?.url 
    ? mediaUrl(attributes.imagen.data.attributes.url)
    : null;
  
  // Format date
  const publishedDate = new Date(attributes.publishedAt || attributes.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-white">
      {/* Image */}
      {imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={attributes.imagen?.data?.attributes?.alternativeText || attributes.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          {publishedDate}
        </div>
        
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {attributes.titulo}
        </CardTitle>
        
        {attributes.resumen && (
          <CardDescription className="line-clamp-3">
            {attributes.resumen}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardFooter className="pt-0">
        <Link 
          to={`/blog/${attributes.slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Leer más
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}