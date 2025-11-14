import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, ArrowRight, User, Home, ArrowLeft, MapPin } from "lucide-react";
import { fetchObituaries, fetchSiteHeader, type Obituary } from "@/lib/strapi";

const OBITUARIES_PER_PAGE = 9;
const defaultLogo = "/lovable-uploads/07568c23-c994-4213-83cf-06bea56fbc27.png";

export default function Obituarios() {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [filteredObituaries, setFilteredObituaries] = useState<Obituary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);

  useEffect(() => {
    Promise.all([
      fetchObituaries(),
      fetchSiteHeader(),
    ]).then(([obituariesData, headerData]) => {
      setObituaries(obituariesData.obituaries);
      setFilteredObituaries(obituariesData.obituaries);
      if (headerData.logoUrl) setLogoUrl(headerData.logoUrl);
      setIsLoading(false);
    });
  }, []);

  // Filter obituaries by search
  useEffect(() => {
    let filtered = obituaries;

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(obit =>
        obit.fullName.toLowerCase().includes(lowerSearch) ||
        obit.funeralHome?.toLowerCase().includes(lowerSearch) ||
        obit.ceremonyLocation?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredObituaries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, obituaries]);

  // Pagination
  const totalPages = Math.ceil(filteredObituaries.length / OBITUARIES_PER_PAGE);
  const startIndex = (currentPage - 1) * OBITUARIES_PER_PAGE;
  const paginatedObituaries = filteredObituaries.slice(startIndex, startIndex + OBITUARIES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
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

          <h1 className="text-4xl font-bold text-slate-900 mb-4">Obituarios</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Honrando la memoria de nuestros seres queridos
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

        {/* Search */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: OBITUARIES_PER_PAGE }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
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

        {/* Obituaries Grid */}
        {!isLoading && (
          <>
            {filteredObituaries.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron obituarios</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm
                      ? "No hay obituarios que coincidan con tu búsqueda"
                      : "No hay obituarios publicados aún."
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                    >
                      Ver todos los obituarios
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedObituaries.map((obituary) => (
                  <ObituaryCard key={obituary.id} obituary={obituary} />
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

// Obituary Card Component
interface ObituaryCardProps {
  obituary: Obituary;
}

function ObituaryCard({ obituary }: ObituaryCardProps) {
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
  const birthYear = new Date(obituary.birthDate).getFullYear();
  const deathYear = new Date(obituary.deathDate).getFullYear();
  const age = calculateAge(obituary.birthDate, obituary.deathDate);

  const deathDateFormatted = new Date(obituary.deathDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link to={`/obituarios/${obituary.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-white cursor-pointer h-full">
        {/* Profile Image */}
        {obituary.profileImageUrl && (
          <div className="relative h-64 overflow-hidden bg-slate-100">
            <img
              src={obituary.profileImageUrl}
              alt={obituary.fullName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {obituary.fullName}
          </CardTitle>
          
          <CardDescription className="text-base">
            {birthYear} - {deathYear} • {age} años
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{deathDateFormatted}</span>
            </div>
            {obituary.ceremonyLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{obituary.ceremonyLocation}</span>
              </div>
            )}
            {obituary.funeralHome && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{obituary.funeralHome}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
            Ver obituario
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
