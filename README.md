# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b44121b9-a876-4da7-816c-d99f41525977

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b44121b9-a876-4da7-816c-d99f41525977) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- TanStack Query (React Query) for data fetching
- React Router for navigation
- Strapi CMS integration for content management

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b44121b9-a876-4da7-816c-d99f41525977) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Conectar con Strapi

Este proyecto incluye una integración completa con Strapi CMS para gestionar contenido del blog.

### Configuración del entorno

1. **Configura las variables de entorno** en el archivo `.env`:

```env
# Strapi API Configuration
VITE_API_URL=http://localhost:1337/api          # URL para desarrollo
VITE_API_URL_PROD=http://localhost:1337/api     # URL para producción
VITE_API_TOKEN=                                 # Token de API (opcional)
```

2. **Asegúrate de tener Strapi corriendo** en `http://localhost:1337`

### Colección de Posts en Strapi

Crea una colección llamada **`posts`** con los siguientes campos:

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `titulo` | Text | ✅ Sí | Campo de título |
| `slug` | UID | ✅ Sí | Basado en `titulo` |
| `resumen` | Textarea | ❌ No | Texto opcional para descripción |
| `contenido` | Rich Text | ✅ Sí | Editor HTML para el contenido |
| `imagen` | Media | ❌ No | Imagen destacada del post |

### Comandos para desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (conecta a Strapi local)
npm run dev

# Construir para desarrollo
npm run build:dev

# Construir para producción
npm run build

# Preview de la build
npm run preview

# Linter
npm run lint
```

### Rutas disponibles

- **`/blog`** - Listado de posts con búsqueda y paginación
- **`/blog/:slug`** - Detalle de un post específico

### Características de la integración

#### Cliente Strapi (`src/lib/strapiClient.ts`)

- ✅ **`strapiFetch()`** - Función principal para hacer requests a Strapi
- ✅ **`mediaUrl()`** - Convierte URLs de media relativas a absolutas
- ✅ **Tipos TypeScript** completos para entidades Strapi
- ✅ **Manejo de parámetros** avanzados: populate, filters, sort, pagination
- ✅ **Autenticación** opcional con tokens
- ✅ **Manejo de errores** robusto

#### Página de Listado (`/blog`)

- ✅ **Grid responsivo** de posts publicados
- ✅ **Búsqueda en tiempo real** por título
- ✅ **Paginación** completa
- ✅ **Estados de carga** con skeletons
- ✅ **Manejo de errores** con retry
- ✅ **Imágenes optimizadas** con lazy loading
- ✅ **Filtrado automático** por posts publicados

#### Página de Detalle (`/blog/:slug`)

- ✅ **Contenido HTML renderizado** de forma segura
- ✅ **Estimación de tiempo de lectura**
- ✅ **Compartir en redes sociales**
- ✅ **Meta información** (fecha, tiempo de lectura)
- ✅ **Navegación** de regreso y a listado
- ✅ **Estados de error** y post no encontrado

### Ejemplos de queries a Strapi

```typescript
// Obtener todos los posts con paginación
const posts = await strapiApi.getPosts({
  params: {
    pagination: { page: 1, pageSize: 6 },
    populate: ['imagen'],
    sort: ['createdAt:desc']
  }
});

// Buscar posts por título
const searchResults = await strapiApi.searchPosts('react', {
  params: {
    pagination: { page: 1, pageSize: 10 }
  }
});

// Obtener un post por slug
const post = await strapiApi.getPostBySlug('mi-primer-post');

// Query personalizada
const customQuery = await strapiFetch('/posts', {
  params: {
    filters: {
      publishedAt: { $notNull: true },
      titulo: { $containsi: 'javascript' }
    },
    populate: {
      imagen: {
        fields: ['url', 'alternativeText', 'width', 'height']
      }
    },
    sort: ['publishedAt:desc'],
    pagination: { page: 1, pageSize: 12 }
  }
});
```

### Troubleshooting

#### Problemas comunes

1. **Error de CORS**
   - Asegúrate de configurar CORS en Strapi para permitir `http://localhost:5173`
   - Verifica que Strapi esté corriendo en el puerto correcto

2. **Posts no aparecen**
   - Verifica que los posts estén **publicados** en Strapi
   - Confirma que la colección se llame exactamente `posts`
   - Revisa los permisos de la API en Strapi

3. **Imágenes no cargan**
   - Verifica la configuración de medios en Strapi
   - Confirma que las imágenes estén subidas correctamente
   - Revisa la función `mediaUrl()` en `strapiClient.ts`

4. **Variables de entorno**
   - Asegúrate de que las variables empiecen con `VITE_`
   - Reinicia el servidor de desarrollo después de cambios en `.env`
   - Verifica que `.env` esté en la raíz del proyecto

#### Debug

Para debuggear problemas con la API:

```typescript
// Habilitar logs en desarrollo
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('API Token:', import.meta.env.VITE_API_TOKEN);
```

#### Verificar integración

1. ✅ **Lista muestra posts publicados** - Navega a `/blog`
2. ✅ **Detalle carga por slug** - Haz clic en cualquier post
3. ✅ **Imágenes aparecen con `mediaUrl`** - Verifica que las imágenes se muestren
4. ✅ **Búsqueda/paginación funciona** - Prueba buscar y cambiar páginas
5. ✅ **Sin secretos en el repo** - Solo variables de entorno públicas o vacías

### Configuración de producción

Para producción, actualiza las variables de entorno:

```env
VITE_API_URL_PROD=https://tu-strapi-url.com/api
VITE_API_TOKEN=tu_token_de_produccion_aqui
```

---

## Hero dinámico con Strapi (sin código)

Consulta la guía operativa con endpoints y checklist para conectar el hero/carrusel al CMS:

- docs/hero-slides-integration.md

Incluye:
- Endpoints REST con filtros (activos, fechas), orden y populate de media.
- Estrategia de imágenes por tamaño (small/medium/large).
- Checklist de permisos, CORS y publicación.
