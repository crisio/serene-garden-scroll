// Strapi client for site-header and slogan Single Types
// Supports Strapi v4 (data.attributes) and v5 (data flat)
// If 403: Enable Public → find for site-header and slogan OR set VITE_STRAPI_TOKEN (API Token)
// Test: curl "http://localhost:1337/api/site-header?populate=logo,navitem"

const BASE = (import.meta.env.VITE_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const TOKEN = (import.meta.env.VITE_STRAPI_TOKEN || "").trim();

async function sget<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        url.searchParams.set(k, JSON.stringify(v));
      } else {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
  });
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json();
}

function mediaUrl(u?: string) {
  if (!u) return undefined;
  return u.startsWith("http") ? u : `${BASE}${u}`;
}

// ========== CITIES ==========
export type City = {
  id: number;
  name: string;
  slug: string;
};

// ========== SERVICES ==========
export type CityService = {
  id: number;
  cities: City[];  // Cambiado de city a cities (plural, porque es many)
  available: boolean;
  features: Array<{ 
    id: number;
    Text: string;
    customDescription?: string;
    gallery?: Array<{
      id: number;
      url: string;
      alternativeText?: string;
      mimeType?: string;
    }>;
  }>;
  customDescription?: string;
};

export type Service = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  gallery: Array<{
    id: number;
    url: string;
    alternativeText?: string;
    mimeType?: string;
  }>;
  cityservice: CityService[];  // Nombre real del campo en Strapi (singular, minúscula)
};

export type NavItem = {
  label: string;
  type: "anchor" | "route" | "external";
  value: string;
  order?: number;
};

export type SiteHeaderData = {
  title: string;
  subtitle: string;
  logoUrl?: string;
  navItems: NavItem[];
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
};

/**
 * Fetch all cities
 */
export async function fetchCities(): Promise<City[]> {
  try {
    const res = await sget<{ data: any[] }>("/api/cities", {
      sort: "name:asc"
    });
    
    return res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    }));
  } catch (err) {
    console.error("Error fetching cities:", err);
    return [];
  }
}

/**
 * Fetch all services with city services populated
 * Optionally filter by city slug
 */
export async function fetchServices(citySlug?: string): Promise<Service[]> {
  try {
    const url = new URL(`${BASE}/api/services`);
    url.searchParams.append("populate[0]", "gallery");
    url.searchParams.append("populate[1]", "cityservice.cities");
    url.searchParams.append("populate[2]", "cityservice.features");
    url.searchParams.append("populate[3]", "cityservice.features.gallery");
    
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    });
    
    if (!res.ok) throw new Error(`Strapi ${res.status}`);
    const json = await res.json();
    
    const services: Service[] = json.data.map((item: any) => {
      const gallery = Array.isArray(item.gallery) 
        ? item.gallery.map((img: any) => ({
            id: img.id,
            url: mediaUrl(img.url) || "",
            alternativeText: img.alternativeText || "",
            mimeType: img.mime || img.mimeType || undefined,
          }))
        : [];
      
      const cityservice: CityService[] = Array.isArray(item.cityservice)
        ? item.cityservice.map((cs: any) => ({
            id: cs.id,
            cities: Array.isArray(cs.cities) ? cs.cities.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            })) : [],
            available: cs.available ?? true,
            features: Array.isArray(cs.features) ? cs.features.map((f: any) => ({
              id: f.id,
              Text: f.Text || "",
              customDescription: f.customDescription || undefined,
              gallery: Array.isArray(f.gallery) ? f.gallery.map((img: any) => ({
                id: img.id,
                url: mediaUrl(img.url) || "",
                alternativeText: img.alternativeText || "",
                mimeType: img.mime || img.mimeType || undefined,
              })) : [],
            })) : [],
            customDescription: cs.customDescription || cs.features?.[0]?.customDescription || undefined,
          }))
        : [];
      
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        description: item.description,
        gallery,
        cityservice,
      };
    });
    
    // Filter by city if specified
    if (citySlug) {
      return services.filter(service => 
        service.cityservice.some(cs => 
          cs.available && cs.cities.some(city => city.slug === citySlug)
        )
      );
    }
    
    return services;
  } catch (err) {
    console.error("Error fetching services:", err);
    return [];
  }
}

/**
 * Fetch a single service by slug with full gallery
 */
export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const url = new URL(`${BASE}/api/services`);
    url.searchParams.append("filters[slug][$eq]", slug);
    url.searchParams.append("populate[0]", "gallery");
    url.searchParams.append("populate[1]", "cityservice.cities");
    url.searchParams.append("populate[2]", "cityservice.features");
    url.searchParams.append("populate[3]", "cityservice.features.gallery");
    
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    });
    
    if (!res.ok) throw new Error(`Strapi ${res.status}`);
    const json = await res.json();
    
    if (!json.data || json.data.length === 0) return null;
    
    const item = json.data[0];
    const gallery = Array.isArray(item.gallery) 
      ? item.gallery.map((img: any) => ({
          id: img.id,
          url: mediaUrl(img.url) || "",
          alternativeText: img.alternativeText || "",
          mimeType: img.mime || img.mimeType || undefined,
        }))
      : [];
    
    const cityservice: CityService[] = Array.isArray(item.cityservice)
      ? item.cityservice.map((cs: any) => ({
          id: cs.id,
          cities: Array.isArray(cs.cities) ? cs.cities.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })) : [],
          available: cs.available ?? true,
          features: Array.isArray(cs.features) ? cs.features.map((f: any) => ({
            id: f.id,
            Text: f.Text || "",
            customDescription: f.customDescription || undefined,
            gallery: Array.isArray(f.gallery) ? f.gallery.map((img: any) => ({
              id: img.id,
              url: mediaUrl(img.url) || "",
              alternativeText: img.alternativeText || "",
              mimeType: img.mime || img.mimeType || undefined,
            })) : [],
          })) : [],
          customDescription: cs.customDescription || cs.features?.[0]?.customDescription || undefined,
        }))
      : [];
    
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      description: item.description,
      gallery,
      cityservice,
    };
  } catch (err) {
    console.error("Error fetching service:", err);
    return null;
  }
}

/**
 * Fetch site-header Single Type with logo and navitem populated
 * Handles logo as multiple media (takes first)
 * Auto-normalizes anchor→route if value starts with /
 */
export async function fetchSiteHeader(): Promise<SiteHeaderData> {
  try {
    const json = await sget<any>("/api/site-header", {
      populate: "*",
    });
    const data = json?.data ?? {};

    console.log("Raw Strapi data:", data);

    // logo: multiple media → take first
    const logoUrl = mediaUrl(data?.logo?.[0]?.url);
    console.log("Logo URL:", logoUrl);

    // nav items with normalization
    let nav: NavItem[] = (data?.navitem ?? []).map((n: any) => ({
      label: n.label,
      type: String(n.type || "").replace(/,/g, "").trim() as any, // remove trailing commas
      value: n.value,
      order: n.order ?? 0,
    }));

    console.log("Nav items before auto-fix:", nav);

    // Auto-fix: if type=anchor but value starts with /, treat as route
    nav = nav.map((n) =>
      n.type === "anchor" && typeof n.value === "string" && n.value.startsWith("/")
        ? { ...n, type: "route" as const }
        : n
    ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    console.log("Nav items after auto-fix and sort:", nav);

    return {
      title: data?.title ?? "Jardines del Recuerdo",
      subtitle: data?.subtitle ?? "Más de 50 años de experiencia",
      logoUrl,
      navItems: nav,
      facebookUrl: data?.facebookUrl || "https://facebook.com/jardinesdelrecuerdo",
      instagramUrl: data?.instagramUrl || "https://instagram.com/jardinesdelrecuerdo",
      whatsappNumber: data?.whatsappNumber || "50425567400",
    };
  } catch (error) {
    console.error("Failed to fetch site-header from Strapi:", error);
    return {
      title: "Jardines del Recuerdo",
      subtitle: "Más de 50 años de experiencia",
      logoUrl: undefined,
      navItems: [],
      facebookUrl: "https://facebook.com/jardinesdelrecuerdo",
      instagramUrl: "https://instagram.com/jardinesdelrecuerdo",
      whatsappNumber: "50425567400",
    };
  }
}

/**
 * Fetch slogan Single Type (optional)
 * Returns empty string if fails
 */
export async function fetchSlogan(): Promise<string> {
  try {
    const json = await sget<any>("/api/slogan");
    return json?.data?.slogan ?? ""; // v5 single flat
  } catch {
    return "";
  }
}

// ============ LOCATIONS ============

export type LocationPhone = {
  number: string;
};

export type Location = {
  id: number;
  name: string;
  address: string;
  city: "San Pedro Sula" | "La Ceiba";
  order: number;
  isActive: boolean;
  phone: LocationPhone[];
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
};

export type LocationsPageData = {
  title: string;
  subtitle: string;
  grassMaintenanceTitle: string;
  grassPhones: LocationPhone[];
  grassImageUrl?: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
};

/**
 * Fetch all locations Collection Type
 * Returns active locations sorted by order
 */
export async function fetchLocations(): Promise<Location[]> {
  try {
    const json = await sget<any>("/api/locations", {
      populate: "phone",
      sort: "order:asc",
    });
    const locations: Location[] = (json?.data ?? []).map((item: any) => ({
      id: item.id,
      name: item.name ?? "",
      address: item.address ?? "",
      city: item.city ?? "San Pedro Sula",
      order: item.order ?? 0,
      isActive: item.isActive ?? true,
      phone: item.phone ?? [],
      latitude: item.latitude,
      longitude: item.longitude,
      mapsUrl: item.mapsUrl,
    }));
    
    return locations.filter(loc => loc.isActive);
  } catch (error) {
    console.error("Failed to fetch locations from Strapi:", error);
    return [];
  }
}

/**
 * Fetch locations-page Single Type
 * Returns page content with fallbacks
 */
export async function fetchLocationsPage(): Promise<LocationsPageData> {
  try {
    const json = await sget<any>("/api/locations-page", {
      populate: "*",
    });
    const data = json?.data ?? {};
    
    // Extract grass image URL
    const grassImageUrl = mediaUrl(data?.grassImage?.url);
    
    console.log("Locations-page raw data:", data);
    console.log("Grass image extracted:", grassImageUrl);
    
    return {
      title: data.title ?? "Nuestras Sucursales",
      subtitle: data.subtitle ?? "Presencia en las principales ciudades de Honduras para servirle mejor",
      grassMaintenanceTitle: data.grassMaintenanceTitle ?? "Contactos Responsables de Mantenimiento de Grama",
      grassPhones: data.grassPhones ?? [],
      grassImageUrl,
      ctaTitle: data.ctaTitle ?? "¿Necesita asistencia inmediata?",
      ctaSubtitle: data.ctaSubtitle ?? "Nuestro equipo está disponible 24/7 para atenderle",
      ctaButtonText: data.ctaButtonText ?? "Contactar Ahora",
    };
  } catch (error) {
    console.error("Failed to fetch locations-page from Strapi:", error);
    return {
      title: "Nuestras Sucursales",
      subtitle: "Presencia en las principales ciudades de Honduras para servirle mejor",
      grassMaintenanceTitle: "Contactos Responsables de Mantenimiento de Grama",
      grassPhones: [],
      grassImageUrl: undefined,
      ctaTitle: "¿Necesita asistencia inmediata?",
      ctaSubtitle: "Nuestro equipo está disponible 24/7 para atenderle",
      ctaButtonText: "Contactar Ahora",
    };
  }
}

// ============ ABOUT SECTION ============

export type AboutValue = {
  icon: string;
  title: string;
  description: string;
  order: number;
};

export type ServiceItem = {
  text: string;
};

export type LegacySection = {
  title: string;
  paragraph1: string;
  paragraph2: string;
  experienceYears: string;
  experienceLabel: string;
  serviceitems: ServiceItem[];
};

export type MissionVision = {
  missionTitle: string;
  missionIcon: string;
  missionContent: string;
  visionTitle: string;
  visionIcon: string;
  visionContent: string;
};

export type AboutSectionData = {
  title: string;
  subtitle: string;
  value: AboutValue[];
  legacysection: LegacySection;
  missionvision: MissionVision;
};

/**
 * Fetch about-section Single Type
 * Returns about page content with fallbacks
 */
export async function fetchAboutSection(): Promise<AboutSectionData> {
  try {
    // Build manual URL with nested populate
    const url = new URL(`${BASE}/api/about-section`);
    url.searchParams.append("populate[value]", "*");
    url.searchParams.append("populate[legacysection][populate][serviceitems]", "*");
    url.searchParams.append("populate[legacysection][populate][missionvision]", "*");
    
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    });
    
    if (!res.ok) {
      console.error("Strapi error:", await res.text());
      throw new Error(`Strapi ${res.status}`);
    }
    
    const json = await res.json();
    const data = json?.data ?? {};
    
    console.log("About-section raw data:", data);
    console.log("Serviceitems data:", data.legacysection?.serviceitems);
    console.log("Mission vision data:", data.legacysection?.missionvision);
    
    return {
      title: data.title ?? "Nuestra Historia",
      subtitle: data.subtitle ?? "Con más de 50 años de trayectoria...",
      value: (data.value ?? []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
      legacysection: {
        title: data.legacysection?.title ?? "Un Legado de Servicio",
        paragraph1: data.legacysection?.paragraph1 ?? "",
        paragraph2: data.legacysection?.paragraph2 ?? "",
        experienceYears: data.legacysection?.experienceYears ?? "50+",
        experienceLabel: data.legacysection?.experienceLabel ?? "Años de Experiencia",
        serviceitems: data.legacysection?.serviceitems ?? [],
      },
      missionvision: {
        missionTitle: data.legacysection?.missionvision?.missionTitle ?? "Nuestra Misión",
        missionIcon: data.legacysection?.missionvision?.missionIcon ?? "Heart",
        missionContent: data.legacysection?.missionvision?.missionContent ?? "Brindar servicios funerarios de la más alta calidad, acompañando a las familias hondureñas con respeto, dignidad y profesionalismo en sus momentos más significativos, siendo un apoyo integral y confiable.",
        visionTitle: data.legacysection?.missionvision?.visionTitle ?? "Nuestra Visión",
        visionIcon: data.legacysection?.missionvision?.visionIcon ?? "Lightbulb",
        visionContent: data.legacysection?.missionvision?.visionContent ?? "Ser el grupo funerario líder en Honduras, reconocidos por nuestra excelencia en el servicio, innovación constante y compromiso con las familias, expandiendo nuestra cobertura nacional mientras mantenemos los más altos estándares de calidad.",
      },
    };
  } catch (error) {
    console.error("Failed to fetch about-section from Strapi:", error);
    return {
      title: "Nuestra Historia",
      subtitle: "Con más de 50 años de trayectoria, hemos acompañado a las familias hondureñas con respeto, calidad y ética en los momentos más significativos.",
      value: [],
      legacysection: {
        title: "Un Legado de Servicio",
        paragraph1: "",
        paragraph2: "",
        experienceYears: "50+",
        experienceLabel: "Años de Experiencia",
        serviceitems: [],
      },
      missionvision: {
        missionTitle: "Nuestra Misión",
        missionIcon: "Heart",
        missionContent: "Brindar servicios funerarios de la más alta calidad, acompañando a las familias hondureñas con respeto, dignidad y profesionalismo en sus momentos más significativos, siendo un apoyo integral y confiable.",
        visionTitle: "Nuestra Visión",
        visionIcon: "Lightbulb",
        visionContent: "Ser el grupo funerario líder en Honduras, reconocidos por nuestra excelencia en el servicio, innovación constante y compromiso con las familias, expandiendo nuestra cobertura nacional mientras mantenemos los más altos estándares de calidad.",
      },
    };
  }
}

// ========== OTHER SERVICES ==========
export type PhoneNumber = {
  id: number;
  number: string;
};

export type OtherService = {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  phonenumber: PhoneNumber[];
};

export type OtherServicesPageData = {
  title: string;
  subtitle: string;
  other_services: OtherService[];
};

export async function fetchOtherServicesPage(): Promise<OtherServicesPageData> {
  try {
    const res = await sget<any>("/api/other-services-page", {
      populate: "other_services.phonenumber",
    });

    // En Strapi v5, data viene directamente
    const raw = res.data || {};
    
    console.log("Raw other-services-page data:", raw);
    
    // Obtener los servicios y ordenarlos
    let services: OtherService[] = [];
    if (raw.other_services && Array.isArray(raw.other_services)) {
      services = raw.other_services
        .map((s: any) => {
          // En v5 los datos vienen planos, no en attributes
          return {
            id: s.id,
            title: s.title || "",
            description: s.description || "",
            icon: s.icon || "FileText",
            order: s.order || 0,
            isActive: s.isActive !== false,
            phonenumber: (s.phonenumber || []).map((p: any) => ({
              id: p.id,
              number: p.number || "",
            })),
          };
        })
        .filter((s: OtherService) => s.isActive)
        .sort((a: OtherService, b: OtherService) => a.order - b.order);
    }

    console.log("Parsed services:", services);

    return {
      title: raw.title || "Otras Gestiones",
      subtitle: raw.subtitle || "Además de nuestros servicios principales, ofrecemos una variedad de gestiones administrativas para facilitar todos sus trámites.",
      other_services: services,
    };
  } catch (err) {
    console.error("Error fetching other services page:", err);
    return {
      title: "Otras Gestiones",
      subtitle: "Además de nuestros servicios principales, ofrecemos una variedad de gestiones administrativas para facilitar todos sus trámites.",
      other_services: [],
    };
  }
}

// ========== GROUP SECTION ==========
export type StatItem = {
  id: number;
  number: string;
  label: string;
  description: string;
  icon: string;
};

export type GroupSectionData = {
  title: string;
  subtitle: string;
  statitem: StatItem[];
  missionTitle: string;
  missionContent: string;
};

export async function fetchGroupSection(): Promise<GroupSectionData> {
  try {
    const res = await sget<any>("/api/group-section", {
      populate: "statitem",
    });

    const raw = res.data || {};
    
    console.log("Raw group-section data:", raw);
    
    // Parsear stats
    let stats: StatItem[] = [];
    if (raw.statitem && Array.isArray(raw.statitem)) {
      stats = raw.statitem.map((s: any) => ({
        id: s.id,
        number: s.number || "",
        label: s.label || "",
        description: s.description || "",
        icon: s.icon || "Building",
      }));
    }

    console.log("Parsed stats:", stats);

    return {
      title: raw.title || "Somos Grupo INCOSA",
      subtitle: raw.subtitle || "Un grupo empresarial hondureño líder en servicios funerarios...",
      statitem: stats,
      missionTitle: raw.missionTitle || "Nuestra Misión",
      missionContent: raw.missionContent || "Brindar servicios funerarios...",
    };
  } catch (err) {
    console.error("Error fetching group section:", err);
    return {
      title: "Somos Grupo INCOSA",
      subtitle: "Un grupo empresarial hondureño líder en servicios funerarios, cementerios y cremaciones, con presencia nacional y compromiso con la excelencia.",
      statitem: [],
      missionTitle: "Nuestra Misión",
      missionContent: "Brindar servicios funerarios, de cementerio y cremación de la más alta calidad, acompañando a las familias hondureñas en sus momentos más difíciles con compasión, dignidad y profesionalismo, honrando la memoria de sus seres queridos y ofreciendo espacios de paz para el descanso eterno.",
    };
  }
}

// ========== CONTACT SECTION ==========
export type ContactInfoItem = {
  id: number;
  title: string;
  info: string;
  description: string;
  icon: string;
};

export type ContactSectionData = {
  title: string;
  subtitle: string;
  contactinfo: ContactInfoItem[];
  emergencyTitle: string;
  emergencyPhone: string;
  emergencyButtonText: string;
  formTitle: string;
  formSubmitButtonText: string;
  backgroundImageUrl?: string;
};

export async function fetchContactSection(): Promise<ContactSectionData> {
  try {
    const res = await sget<any>("/api/contact-section", {
      populate: "*",
    });

    const raw = res.data || {};
    
    console.log("Raw contact-section data:", raw);
    
    // Parsear contact info items (nota: el campo es contactInfo con I mayúscula)
    let contactItems: ContactInfoItem[] = [];
    const contactInfoField = raw.contactInfo || raw.contactinfo || [];
    if (Array.isArray(contactInfoField)) {
      contactItems = contactInfoField.map((item: any) => ({
        id: item.id,
        title: item.title || "",
        info: item.info || "",
        description: item.description || "",
        icon: item.icon || "Phone",
      }));
    }

    // Parsear background image
    let bgImageUrl: string | undefined;
    if (raw.backgroundImage) {
      const imgData = raw.backgroundImage;
      if (imgData) {
        const url = imgData.url;
        bgImageUrl = mediaUrl(url);
      }
    }

    console.log("Parsed contact items:", contactItems);
    console.log("Background image URL:", bgImageUrl);

    return {
      title: raw.title || "Contáctanos",
      subtitle: raw.subtitle || "Estamos aquí para apoyarlo cuando más nos necesite...",
      contactinfo: contactItems,
      emergencyTitle: raw.emergencyTitle || "Emergencia 24/7",
      emergencyPhone: raw.emergencyPhone || "(504) 2234-5678",
      emergencyButtonText: raw.emergencyButtonText || "Llamar Ahora:",
      formTitle: raw.formTitle || "Envíanos un Mensaje",
      formSubmitButtonText: raw.formSubmitButtonText || "Enviar Mensaje",
      backgroundImageUrl: bgImageUrl,
    };
  } catch (err) {
    console.error("Error fetching contact section:", err);
    return {
      title: "Contáctanos",
      subtitle: "Estamos aquí para apoyarlo cuando más nos necesite. Contáctenos en cualquier momento del día o la noche.",
      contactinfo: [],
      emergencyTitle: "Emergencia 24/7",
      emergencyPhone: "(504) 2234-5678",
      emergencyButtonText: "Llamar Ahora:",
      formTitle: "Envíanos un Mensaje",
      formSubmitButtonText: "Enviar Mensaje",
    };
  }
}

// ========== FOOTER ==========
export type FooterLink = {
  id: number;
  label: string;
  url: string;
};

export type FooterData = {
  logoUrl?: string;
  title: string;
  subtitle: string;
  description: string;
  availabilityText: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
  madeWithText: string;
  servicesFooterText: string;
  quickLinks: FooterLink[];
  servicesLinks: FooterLink[];
};

export async function fetchFooter(): Promise<FooterData> {
  try {
    const res = await sget<any>("/api/footer", {
      populate: "*",
    });

    const raw = res.data || {};
    
    console.log("Raw footer data:", raw);
    
    // Parsear logo
    let logoUrl: string | undefined;
    if (raw.logo && Array.isArray(raw.logo) && raw.logo.length > 0) {
      const logo = raw.logo[0];
      logoUrl = mediaUrl(logo.url);
    }

    // Parsear quick links
    let quickLinks: FooterLink[] = [];
    if (raw.quickLinks && Array.isArray(raw.quickLinks)) {
      quickLinks = raw.quickLinks.map((link: any) => ({
        id: link.id,
        label: link.label || "",
        url: link.url || "#",
      }));
    }

    // Parsear services links
    let servicesLinks: FooterLink[] = [];
    if (raw.servicesLinks && Array.isArray(raw.servicesLinks)) {
      servicesLinks = raw.servicesLinks.map((link: any) => ({
        id: link.id,
        label: link.label || "",
        url: link.url || "#",
      }));
    }

    console.log("Parsed footer data:", { logoUrl, quickLinks, servicesLinks });

    return {
      logoUrl,
      title: raw.title || "Jardines del Recuerdo",
      subtitle: raw.subtitle || "Grupo INCOSA",
      description: raw.description || "",
      availabilityText: raw.availabilityText || "Atención 24 horas / 7 días a la semana",
      phone: raw.phone || "(504) 2234-5678",
      email: raw.email || "info@jardinesdelrecuerdo.hn",
      address: raw.address || "Colonia Palmira, Tegucigalpa, Honduras",
      copyrightText: raw.copyrightText || "© 2025 Jardines del Recuerdo - Grupo INCOSA. Todos los derechos reservados.",
      madeWithText: raw.madeWithText || "Hecho con ❤️ para las familias hondureñas",
      servicesFooterText: raw.servicesFooterText || "Atención 24/7 · Servicios de emergencia disponibles · Cobertura nacional en Honduras",
      quickLinks,
      servicesLinks,
    };
  } catch (err) {
    console.error("Error fetching footer:", err);
    return {
      title: "Jardines del Recuerdo",
      subtitle: "Grupo INCOSA",
      description: "Con más de 50 años de trayectoria...",
      availabilityText: "Atención 24 horas / 7 días a la semana",
      phone: "(504) 2234-5678",
      email: "info@jardinesdelrecuerdo.hn",
      address: "Colonia Palmira, Tegucigalpa, Honduras",
      copyrightText: "© 2025 Jardines del Recuerdo - Grupo INCOSA. Todos los derechos reservados.",
      madeWithText: "Hecho con ❤️ para las familias hondureñas",
      servicesFooterText: "Atención 24/7 · Servicios de emergencia disponibles · Cobertura nacional en Honduras",
      quickLinks: [],
      servicesLinks: [],
    };
  }
}

// ========== BLOG ==========
export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: any; // Rich text blocks
  publishedDate: string;
  readTime: number;
  isPublished: boolean;
  author: string;
  category?: BlogCategory;
  featuredImageUrl?: string;
};

// ========== FLOATING BUTTONS ==========
export type FloatingButton = {
  id: number;
  label: string;
  action: "prevention-dialog" | "social-dialog" | "call";
  phoneNumber?: string;
  phoneNumbers?: Array<{ id?: number; label?: string; phoneNumber?: string; city?: string }>;
  icon: "shield" | "message" | "phone";
  color: string;
  order: number;
  showOnDesktop: boolean;
  showOnMobile: boolean;
};

export type FloatingButtonsData = {
  mobileHelpText: string;
  buttons: FloatingButton[];
};

export async function fetchFloatingButtons(): Promise<FloatingButtonsData> {
  try {
    console.log("Fetching floating-button from Strapi...");
    // Populate nested phoneNumbers/emergencyNumbers using Strapi-style query params
    // Note: avoid JSON stringify of objects; use bracket notation keys
    const res = await sget<any>("/api/floating-button", {
      "populate[0]": "FloatingButton",
      "populate[1]": "FloatingButton.phoneNumbers", // Strapi v5: field name phoneNumbers
      // Note: if you had an old field emergencyNumbers, keep parsing fallback below, but we don't populate it to avoid 400
    });

    console.log("Strapi floating-button response:", res);

    const data = res.data || {};

    // Parse buttons array - el campo se llama FloatingButton en Strapi
    const buttons: FloatingButton[] = (data.FloatingButton || []).map((btn: any) => ({
      id: btn.id || 0,
      label: btn.label || "",
      action: btn.action || "call",
      phoneNumber: btn.phoneNumber || undefined,
      phoneNumbers: (btn.phoneNumbers || btn.emergencyNumbers || []).map((p: any) => ({
        id: p.id,
        label: p.label || p.city || "",
        phoneNumber: p.phoneNumber || p.number || "",
        city: p.city || undefined,
      })),
      icon: btn.icon || "phone",
      color: btn.color || "#10b981",
      order: btn.order || 0,
      showOnDesktop: btn.showOnDesktop !== false,
      showOnMobile: btn.showOnMobile !== false,
    }));

    // Sort by order
    buttons.sort((a, b) => a.order - b.order);

    return {
      mobileHelpText: data.mobileHelpText || "¿Necesitas ayuda?",
      buttons,
    };
  } catch (error) {
    console.error("Error fetching floating buttons:", error);
    // Return defaults
    return {
      mobileHelpText: "¿Necesitas ayuda?",
      buttons: [
        {
          id: 1,
          label: "PREVER",
          action: "prevention-dialog",
          icon: "shield",
          color: "#10b981",
          order: 1,
          showOnDesktop: true,
          showOnMobile: true,
        },
        {
          id: 2,
          label: "CONTACTANOS",
          action: "social-dialog",
          icon: "message",
          color: "#25D366",
          order: 2,
          showOnDesktop: true,
          showOnMobile: true,
        },
        {
          id: 3,
          label: "EMERGENCIA",
          action: "call",
          phoneNumber: "+50425567400",
          icon: "phone",
          color: "#ef4444",
          order: 3,
          showOnDesktop: true,
          showOnMobile: true,
        },
      ],
    };
  }
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  try {
    const res = await sget<any>("/api/blog-categories", {
      sort: "name:asc",
    });

    const rawCategories = res.data || [];
    
    return rawCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || undefined,
      color: cat.color || undefined,
    }));
  } catch (err) {
    console.error("Error fetching blog categories:", err);
    return [];
  }
}

export async function fetchBlogPosts(options?: {
  categorySlug?: string;
  limit?: number;
  page?: number;
}): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const params: any = {
      populate: "*",
      sort: "publishedDate:desc",
      "filters[isPublished][$eq]": true,
    };

    if (options?.categorySlug) {
      params["filters[blog_category][slug][$eq]"] = options.categorySlug;
    }

    if (options?.limit) {
      params["pagination[pageSize]"] = options.limit;
      params["pagination[page]"] = options.page || 1;
    }

    const res = await sget<any>("/api/blog-posts", params);

    const rawPosts = res.data || [];
    const meta = res.meta || {};
    
    console.log("Raw blog posts data:", rawPosts);

    const posts: BlogPost[] = rawPosts.map((post: any) => {
      let category: BlogCategory | undefined;
      if (post.blog_category) {
        category = {
          id: post.blog_category.id,
          name: post.blog_category.name || "",
          slug: post.blog_category.slug || "",
          description: post.blog_category.description,
          color: post.blog_category.color,
        };
      }

      let featuredImageUrl: string | undefined;
      if (post.featuredImage) {
        featuredImageUrl = mediaUrl(post.featuredImage.url);
      }

      return {
        id: post.id,
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || [],
        publishedDate: post.publishedDate || "",
        readTime: post.readTime || 5,
        isPublished: post.isPublished || false,
        author: post.author || "Jardines del Recuerdo",
        category,
        featuredImageUrl,
      };
    });

    return {
      posts,
      total: meta.pagination?.total || posts.length,
    };
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return { posts: [], total: 0 };
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await sget<any>("/api/blog-posts", {
      populate: "*",
      "filters[slug][$eq]": slug,
      "filters[isPublished][$eq]": true,
    });

    const rawPosts = res.data || [];
    
    if (rawPosts.length === 0) {
      return null;
    }

    const post = rawPosts[0];
    
    console.log("Raw blog post data:", post);

    let category: BlogCategory | undefined;
    if (post.blog_category) {
      category = {
        id: post.blog_category.id,
        name: post.blog_category.name || "",
        slug: post.blog_category.slug || "",
        description: post.blog_category.description,
        color: post.blog_category.color,
      };
    }

    let featuredImageUrl: string | undefined;
    if (post.featuredImage) {
      featuredImageUrl = mediaUrl(post.featuredImage.url);
    }

    return {
      id: post.id,
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || [],
      publishedDate: post.publishedDate || "",
      readTime: post.readTime || 5,
      isPublished: post.isPublished || false,
      author: post.author || "Jardines del Recuerdo",
      category,
      featuredImageUrl,
    };
  } catch (err) {
    console.error("Error fetching blog post:", err);
    return null;
  }
}

// ========== FLORERIA ==========
export type FloreriaFeature = {
  id: number;
  icon: string;
  title: string;
  description: string;
};

export type FloralArrangement = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type FloreriaData = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroHighlight?: string;
  heroImageUrl?: string;
  ctaButtonText: string;
  ecommerceUrl?: string;
  features: FloreriaFeature[];
  arrangementsTitle: string;
  arrangementsSubtitle: string;
  arrangements: FloralArrangement[];
  finalSectionLabel: string;
  finalTitle: string;
  finalDescription: string;
  finalImageUrl?: string;
};

// ========== OBITUARIES ==========
export type Obituary = {
  id: number;
  fullName: string;
  slug: string;
  birthDate: string;
  deathDate: string;
  biography: any; // Rich text blocks
  ceremonyDate?: string;
  ceremonyLocation?: string;
  funeralHome?: string;
  isPublished: boolean;
  profileImageUrl?: string;
  galleryMedia: Array<{
    url: string;
    alternativeText?: string;
    mimeType?: string;
  }>;
};

export async function fetchObituaries(options?: {
  searchQuery?: string;
  limit?: number;
  page?: number;
}): Promise<{ obituaries: Obituary[]; total: number }> {
  try {
    const params: any = {
      populate: "*",
      sort: "deathDate:desc",
      "filters[isPublished][$eq]": true,
    };

    if (options?.searchQuery) {
      params["filters[$or][0][fullName][$containsi]"] = options.searchQuery;
    }

    if (options?.limit) {
      params["pagination[pageSize]"] = options.limit;
      params["pagination[page]"] = options.page || 1;
    }

    const res = await sget<any>("/api/obituaries", params);

    const rawObituaries = res.data || [];
    const meta = res.meta || {};
    
    console.log("Raw obituaries data:", rawObituaries);

    const obituaries: Obituary[] = rawObituaries.map((obit: any) => {
      let profileImageUrl: string | undefined;
      if (obit.profileImage) {
        profileImageUrl = mediaUrl(obit.profileImage.url);
      }

      let galleryMedia: Array<{ url: string; alternativeText?: string; mimeType?: string }> = [];
      if (obit.galleryImages && Array.isArray(obit.galleryImages)) {
        galleryMedia = obit.galleryImages.map((img: any) => ({
          url: mediaUrl(img.url) || "",
          alternativeText: img.alternativeText || undefined,
          mimeType: img.mime || img.mimeType || undefined,
        }));
      }

      return {
        id: obit.id,
        fullName: obit.fullName || "",
        slug: obit.slug || "",
        birthDate: obit.birthDate || "",
        deathDate: obit.deathDate || "",
        biography: obit.biography || [],
        ceremonyDate: obit.ceremonyDate,
        ceremonyLocation: obit.ceremonyLocation,
        funeralHome: obit.funeralHome,
        isPublished: obit.isPublished || false,
        profileImageUrl,
        galleryMedia,
      };
    });

    return {
      obituaries,
      total: meta.pagination?.total || obituaries.length,
    };
  } catch (err) {
    console.error("Error fetching obituaries:", err);
    return { obituaries: [], total: 0 };
  }
}

export async function fetchObituary(slug: string): Promise<Obituary | null> {
  try {
    const res = await sget<any>("/api/obituaries", {
      populate: "*",
      "filters[slug][$eq]": slug,
      "filters[isPublished][$eq]": true,
    });

    const rawObituaries = res.data || [];
    
    if (rawObituaries.length === 0) {
      return null;
    }

    const obit = rawObituaries[0];
    
    console.log("Raw obituary data:", obit);

    let profileImageUrl: string | undefined;
    if (obit.profileImage) {
      profileImageUrl = mediaUrl(obit.profileImage.url);
    }

    let galleryMedia: Array<{ url: string; alternativeText?: string; mimeType?: string }> = [];
    if (obit.galleryImages && Array.isArray(obit.galleryImages)) {
      galleryMedia = obit.galleryImages.map((img: any) => ({
        url: mediaUrl(img.url) || "",
        alternativeText: img.alternativeText || undefined,
        mimeType: img.mime || img.mimeType || undefined,
      }));
    }

    return {
      id: obit.id,
      fullName: obit.fullName || "",
      slug: obit.slug || "",
      birthDate: obit.birthDate || "",
      deathDate: obit.deathDate || "",
      biography: obit.biography || [],
      ceremonyDate: obit.ceremonyDate,
      ceremonyLocation: obit.ceremonyLocation,
      funeralHome: obit.funeralHome,
      isPublished: obit.isPublished || false,
      profileImageUrl,
      galleryMedia,
    };
  } catch (err) {
    console.error("Error fetching obituary:", err);
    return null;
  }
}

// ========== FLORERIA ==========
export async function fetchFloreria(): Promise<FloreriaData> {
  try {
    console.log("Fetching floreria from Strapi...");
    const res = await sget<any>("/api/floreria", {
      populate: "*",
    });

    console.log("Strapi floreria response:", res);

    // Strapi v4: res.data.attributes; v5: res.data flat; fallback to res
    const raw = res.data || res;
    const data = raw.attributes || raw;

    // Handle Strapi v4/v5 media shapes (direct url or data.attributes.url), including arrays
    const extractMediaUrl = (media: any): string | undefined => {
      if (!media) return undefined;

      // If media is already a string URL or path
      if (typeof media === "string") {
        return mediaUrl(media);
      }

      // If media is an array, use the first element
      if (Array.isArray(media)) {
        return extractMediaUrl(media[0]);
      }

      // Direct url on the object
      const directUrl = media.url || media?.formats?.large?.url || media?.formats?.medium?.url || media?.formats?.small?.url;
      if (directUrl) return mediaUrl(directUrl);

      // Nested data/attributes (Strapi v4+)
      const dataNode = media.data || media?.attributes || media?.data?.attributes;
      if (dataNode?.url) return mediaUrl(dataNode.url);
      if (dataNode?.attributes?.url) return mediaUrl(dataNode.attributes.url);

      return undefined;
    };

    // Parse features
    const features: FloreriaFeature[] = (data.features || []).map((feature: any) => ({
      id: feature.id || 0,
      icon: feature.icon || "🌸",
      title: feature.title || "",
      description: feature.description || "",
    }));

    // Parse arrangements
    const arrangements: FloralArrangement[] = (data.arrangements || data.arrangement || []).map((arr: any) => ({
      id: arr.id || 0,
      name: arr.name || "",
      description: arr.description || undefined,
      imageUrl: extractMediaUrl(
        arr.image || arr.imageUrl || arr.media || arr.photo || arr.picture
      ),
    }));

    return {
      heroTitle: data.heroTitle || "Florería",
      heroSubtitle: data.heroSubtitle || "Las flores hablan cuando las palabras no alcanzan.",
      heroDescription: data.heroDescription || "En los momentos de pérdida, a veces el corazón siente más de lo que la voz puede decir.",
      heroHighlight: data.heroHighlight || undefined,
      heroImageUrl: extractMediaUrl(data.heroImage),
      ctaButtonText: data.ctaButtonText || "Enviar Flores",
      ecommerceUrl: data.ecommerceUrl || undefined,
      features,
      arrangementsTitle: data.arrangementsTitle || "Arreglos florales",
      arrangementsSubtitle: data.arrangementsSubtitle || "Con Blanc Florería hay sentimientos que florecen",
      arrangements,
      finalSectionLabel: data.finalSectionLabel || "Acompaña el Homenaje®",
      finalTitle: data.finalTitle || "Enviar flores es una forma de demostrar tu compañía y apoyo",
      finalDescription: data.finalDescription || "Acompañar a alguien en un Homenaje® no siempre requiere palabras; a veces, basta un gesto lleno de vida, color y memoria.",
      finalImageUrl: extractMediaUrl(data.finalImage),
    };
  } catch (error) {
    console.error("Error fetching floreria:", error);
    // Return defaults
    return {
      heroTitle: "Florería",
      heroSubtitle: "Las flores hablan cuando las palabras no alcanzan.",
      heroDescription: "En los momentos de pérdida, a veces el corazón siente más de lo que la voz puede decir. Una flor puede ser ese susurro suave que dice estoy contigo o te acompaño en tu dolor.",
      heroHighlight: "Acompañar a alguien en un Homenaje® no siempre requiere palabras; a veces, basta un gesto lleno de vida, color y memoria.",
      ctaButtonText: "Enviar Flores",
      features: [
        {
          id: 1,
          icon: "📞",
          title: "Servicio las 24 horas",
          description: "Puedes pedirlo cuando nos llames para solicitar el servicio.",
        },
        {
          id: 2,
          icon: "🏠",
          title: "Entrega directa en sala",
          description: "Así podrás permanecer en el Homenaje® acompañando a tus seres amados.",
        },
        {
          id: 3,
          icon: "🎨",
          title: "Arreglos frescos y de calidad",
          description: "Seleccionamos flores frescas y de temporada.",
        },
        {
          id: 4,
          icon: "🌸",
          title: "Gran variedad de diseños",
          description: "Realizados por expertos florales.",
        },
      ],
      arrangementsTitle: "Arreglos florales",
      arrangementsSubtitle: "Con Blanc Florería hay sentimientos que florecen",
      arrangements: [],
      finalSectionLabel: "Acompaña el Homenaje®",
      finalTitle: "Enviar flores es una forma de demostrar tu compañía y apoyo",
      finalDescription: "Acompañar a alguien en un Homenaje® no siempre requiere palabras; a veces, basta un gesto lleno de vida, color y memoria.",
    };
  }
}

