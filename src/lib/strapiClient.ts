// Strapi API client with TypeScript support

// Basic Strapi types
export interface StrapiEntity<T = Record<string, unknown>> {
  id: number;
  attributes: T & {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
}

export interface StrapiList<T = Record<string, unknown>> {
  data: StrapiEntity<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiOne<T = Record<string, unknown>> {
  data: StrapiEntity<T>;
  meta: Record<string, unknown>;
}

// Post entity type based on Strapi collection
export interface Post {
  titulo: string;
  slug: string;
  resumen?: string;
  contenido: string;
  imagen?: {
    data: StrapiEntity<{
      name: string;
      alternativeText?: string;
      caption?: string;
      width: number;
      height: number;
      formats?: Record<string, unknown>;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
    }> | null;
  };
}

// Strapi fetch options
export interface StrapiFetchOptions {
  params?: {
    populate?: string | string[] | Record<string, unknown>;
    filters?: Record<string, unknown>;
    sort?: string | string[];
    pagination?: {
      page?: number;
      pageSize?: number;
      start?: number;
      limit?: number;
    };
    fields?: string[];
    locale?: string;
  };
  init?: RequestInit;
}

// Get API URL from environment variables
const getAPIUrl = (): string => {
  const isDev = import.meta.env.DEV;
  const devUrl = import.meta.env.VITE_API_URL;
  const prodUrl = import.meta.env.VITE_API_URL_PROD;
  
  return isDev ? devUrl : prodUrl;
};

// Get API token from environment variables
const getAPIToken = (): string | undefined => {
  return import.meta.env.VITE_API_TOKEN;
};

// Convert media URL to absolute URL
export const mediaUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle Strapi uploads - remove /api from the path and concatenate with base URL
  const baseUrl = getAPIUrl().replace('/api', '');
  
  // Ensure url starts with /
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${cleanUrl}`;
};

// Main Strapi fetch function
export const strapiFetch = async <T = Record<string, unknown>>(
  path: string,
  options: StrapiFetchOptions = {}
): Promise<T> => {
  const { params = {}, init = {} } = options;
  
  // Build URL
  const baseUrl = getAPIUrl();
  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  
  // Add query parameters
  if (params.populate) {
    if (Array.isArray(params.populate)) {
      params.populate.forEach(field => {
        url.searchParams.append('populate', field);
      });
    } else if (typeof params.populate === 'string') {
      url.searchParams.append('populate', params.populate);
    } else {
      // Handle deep population with object notation
      url.searchParams.append('populate', JSON.stringify(params.populate));
    }
  }
  
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested filters like { titulo: { $containsi: 'search' } }
        Object.entries(value as Record<string, unknown>).forEach(([operator, operatorValue]) => {
          url.searchParams.append(`filters[${key}][${operator}]`, String(operatorValue));
        });
      } else {
        url.searchParams.append(`filters[${key}]`, String(value));
      }
    });
  }
  
  if (params.sort) {
    if (Array.isArray(params.sort)) {
      params.sort.forEach(sortField => {
        url.searchParams.append('sort', sortField);
      });
    } else {
      url.searchParams.append('sort', params.sort);
    }
  }
  
  if (params.pagination) {
    Object.entries(params.pagination).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(`pagination[${key}]`, String(value));
      }
    });
  }
  
  if (params.fields) {
    params.fields.forEach(field => {
      url.searchParams.append('fields', field);
    });
  }
  
  if (params.locale) {
    url.searchParams.append('locale', params.locale);
  }
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  
  // Add authorization token if available
  const token = getAPIToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Strapi fetch error:', error);
    throw error;
  }
};

// Convenience functions for common operations
export const strapiApi = {
  // Get all posts
  getPosts: (options: StrapiFetchOptions = {}) =>
    strapiFetch<StrapiList<Post>>('/posts', {
      ...options,
      params: {
        populate: ['imagen'],
        sort: ['createdAt:desc'],
        ...options.params,
      },
    }),
  
  // Get single post by slug
  getPostBySlug: (slug: string, options: StrapiFetchOptions = {}) =>
    strapiFetch<StrapiList<Post>>('/posts', {
      ...options,
      params: {
        populate: ['imagen'],
        filters: {
          slug: {
            $eq: slug,
          },
        },
        ...options.params,
      },
    }),
  
  // Search posts
  searchPosts: (query: string, options: StrapiFetchOptions = {}) =>
    strapiFetch<StrapiList<Post>>('/posts', {
      ...options,
      params: {
        populate: ['imagen'],
        filters: {
          titulo: {
            $containsi: query,
          },
        },
        sort: ['createdAt:desc'],
        ...options.params,
      },
    }),
};