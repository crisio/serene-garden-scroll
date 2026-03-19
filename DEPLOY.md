# Guía de Deploy - Funerales del Recuerdo

## Información del Servidor

- **Host:** `srv743466.hstgr.cloud`
- **Usuario:** `root`
- **Clave SSH:** `~/.ssh/id_ed25519_hostinger`
- **Directorio Frontend:** `/var/www/funerales/frontend`
- **Directorio Source:** `/var/www/funerales/frontend-source`
- **Directorio Backend:** `/var/www/funerales/api`

## URLs de Producción

- **Frontend:** https://funeralesdelrecuerdo.ciudadanosb.com
- **API Backend:** https://funeralesapi.ciudadanosb.com
- **Admin Strapi:** https://funeralesapi.ciudadanosb.com/admin

---

## 📋 Requisitos Previos

### En tu Máquina Local

1. Git configurado y autenticado con GitHub
2. Node.js y npm instalados
3. Acceso SSH al servidor configurado

### En el Servidor

- Nginx instalado y configurado
- PM2 para gestión de procesos Node.js
- Node.js v20+ instalado
- Certificados SSL Let's Encrypt configurados

---

## 🚀 Deploy del Frontend

### Paso 1: Hacer Cambios Localmente

```bash
# Navegar al directorio del proyecto
cd C:\laragon\www\strapi\serene-garden-scroll

# Hacer tus cambios en el código...
# Luego agregar, commit y push
git add .
git commit -m "Descripción de tus cambios"
git push origin main
```

### Paso 2: Desplegar en el Servidor

**Opción A: Comando único (PowerShell)**

```powershell
ssh -i $env:USERPROFILE\.ssh\id_ed25519_hostinger root@srv743466.hstgr.cloud "cd /var/www/funerales/frontend-source && git pull && npm run build && rm -rf /var/www/funerales/frontend/* && cp -r dist/* /var/www/funerales/frontend/"
```

**Opción B: Paso a paso**

```bash
# 1. Conectar al servidor
ssh -i ~/.ssh/id_ed25519_hostinger root@srv743466.hstgr.cloud

# 2. Navegar al directorio source
cd /var/www/funerales/frontend-source

# 3. Descargar últimos cambios
git pull

# 4. (Opcional) Instalar dependencias si package.json cambió
npm install

# 5. Compilar el proyecto
npm run build

# 6. Desplegar archivos compilados
rm -rf /var/www/funerales/frontend/*
cp -r dist/* /var/www/funerales/frontend/

# 7. Verificar deployment
curl -I https://funeralesdelrecuerdo.ciudadanosb.com/

# 8. Salir del servidor
exit
```

### Paso 3: Verificar en el Navegador

1. Abrir https://funeralesdelrecuerdo.ciudadanosb.com
2. Hacer hard refresh:
   - **Windows/Linux:** `Ctrl + Shift + R`
   - **Mac:** `Cmd + Shift + R`
3. Verificar que los cambios están visibles

---

## 🔧 Deploy del Backend (Strapi)

### Cambios en Configuración

```bash
# Conectar al servidor
ssh -i ~/.ssh/id_ed25519_hostinger root@srv743466.hstgr.cloud

# Navegar al directorio de la API
cd /var/www/funerales/api

# Editar archivos de configuración si es necesario
nano config/middlewares.ts

# Compilar cambios (IMPORTANTE para archivos TypeScript)
npm run build

# Reiniciar servicio
pm2 restart funerales-api

# Verificar logs
pm2 logs funerales-api --lines 50

# Salir
exit
```

### Verificar Estado del Backend

```bash
# Ver estado de PM2
pm2 list

# Ver logs en tiempo real
pm2 logs funerales-api

# Reiniciar si hay problemas
pm2 restart funerales-api

# Ver uso de recursos
pm2 monit
```

### Contacto por Gmail (Strapi)

El frontend ya fue migrado para enviar el formulario de `Contáctanos` a un endpoint backend propio.

**Endpoint esperado por el frontend:**
- `POST /api/contact-email`
- URL completa por defecto: `https://funeralesapi.ciudadanosb.com/api/contact-email`
- Variable opcional en frontend para cambiar ruta: `VITE_CONTACT_EMAIL_ENDPOINT`

**Payload enviado:**

```json
{
   "nombre_completo": "Juan Perez",
   "telefono": "+504 9999-0000",
   "email": "juan@email.com",
   "servicio_interes": "funeral",
   "mensaje": "Necesito informacion"
}
```

**Respuesta esperada:**

```json
{
   "success": true,
   "message": "Correo enviado"
}
```

**Variables privadas backend (NO frontend):**

```env
GMAIL_USER=tu_cuenta@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_TO_CONTACT=destino@dominio.com
```

**Checklist rapido en Strapi backend (`/var/www/funerales/api`):**
1. Instalar y configurar `@strapi/plugin-email` con `nodemailer` y Gmail SMTP.
2. Crear ruta/controlador para `POST /api/contact-email`.
3. Validar campos obligatorios (`nombre_completo`, `telefono`, `email`) en servidor.
4. Enviar correo a `EMAIL_TO_CONTACT` con `replyTo` = email del usuario.
5. `npm run build` y `pm2 restart funerales-api`.
6. Probar endpoint con `curl` antes de desplegar frontend.

---

## 🔐 Configuración SSH (Primera Vez)

### 1. Configurar SSH en el Servidor para GitHub

```bash
# Conectar al servidor
ssh -i ~/.ssh/id_ed25519_hostinger root@srv743466.hstgr.cloud

# Crear archivo de configuración SSH
cat > ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
EOF

# Probar conexión
ssh -T git@github.com
# Debe responder: "Hi crisio! You've successfully authenticated..."

# Salir
exit
```

---

## 🌐 Configuración de Nginx

### Ubicación de Archivos

```bash
# Configuración del sitio
/etc/nginx/sites-available/funerales

# Link simbólico activo
/etc/nginx/sites-enabled/funerales
```

### Comandos Útiles de Nginx

```bash
# Verificar sintaxis de configuración
nginx -t

# Recargar configuración (sin downtime)
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver logs de errores
tail -f /var/log/nginx/error.log

# Ver logs de acceso
tail -f /var/log/nginx/access.log
```

---

## ⚙️ Variables de Entorno

### Frontend (.env)

**Archivo:** `/var/www/funerales/frontend-source/.env`

```env
VITE_API_URL=https://funeralesapi.ciudadanosb.com/api
VITE_API_URL_PROD=https://funeralesapi.ciudadanosb.com/api
VITE_STRAPI_URL=https://funeralesapi.ciudadanosb.com
```

**IMPORTANTE:** NO incluir `VITE_API_TOKEN` para acceso público

### Backend (.env)

**Archivo:** `/var/www/funerales/api/.env`

Contiene configuraciones sensibles de base de datos, admin, etc.

---

## 🔍 Solución de Problemas Comunes

### Error 401 en la API

**Problema:** Frontend muestra errores 401 Unauthorized

**Solución:**
1. Verificar que NO haya `VITE_API_TOKEN` en `.env`
2. Recompilar frontend: `npm run build`
3. Redesplegar archivos compilados

### Error CORS

**Problema:** "has been blocked by CORS policy"

**Solución:**
1. Verificar configuración CORS en Strapi:
   ```bash
   cat /var/www/funerales/api/config/middlewares.ts
   ```
2. Asegurar que el origen está en la lista permitida
3. Recompilar Strapi: `npm run build`
4. Reiniciar: `pm2 restart funerales-api`

### Frontend no Actualiza

**Problema:** Cambios no se reflejan en el navegador

**Solución:**
1. Verificar timestamp de archivos:
   ```bash
   ls -lh /var/www/funerales/frontend/
   ```
2. Limpiar caché del navegador (hard refresh)
3. Verificar que los archivos fueron copiados correctamente

### Git Pull Falla

**Problema:** "Repository not found" o error de permisos

**Solución:**
1. Verificar configuración SSH:
   ```bash
   cat ~/.ssh/config
   ```
2. Probar conexión con GitHub:
   ```bash
   ssh -T git@github.com
   ```
3. Verificar permisos de la clave:
   ```bash
   chmod 600 ~/.ssh/id_ed25519_github
   ```

### PM2 no Inicia

**Problema:** Servicio funerales-api no arranca

**Solución:**
1. Ver logs de error:
   ```bash
   pm2 logs funerales-api --err --lines 100
   ```
2. Verificar puerto 1337 no esté en uso:
   ```bash
   netstat -tlnp | grep 1337
   ```
3. Reiniciar PM2:
   ```bash
   pm2 delete funerales-api
   cd /var/www/funerales/api
   pm2 start npm --name "funerales-api" -- start
   pm2 save
   ```

---

## 📊 Monitoreo y Mantenimiento

### Verificar Estado General

```bash
# Estado de servicios
systemctl status nginx
pm2 status

# Uso de disco
df -h

# Espacio en directorio
du -sh /var/www/funerales/*

# Procesos Node
ps aux | grep node

# Memoria RAM
free -h
```

### Logs Importantes

```bash
# Logs de Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Logs de PM2
pm2 logs funerales-api

# Logs del sistema
journalctl -u nginx -f
```

### Backup

```bash
# Backup de base de datos Strapi (SQLite)
cd /var/www/funerales/api
tar -czf backup-$(date +%Y%m%d).tar.gz .tmp/data.db

# Backup de archivos subidos
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

---

## 🔄 Workflow Completo de Deploy

### Flujo Estándar

```bash
# EN TU PC LOCAL
cd C:\laragon\www\strapi\serene-garden-scroll
git add .
git commit -m "Tu mensaje de commit"
git push origin main

# EN EL SERVIDOR (PowerShell - una sola línea)
ssh -i $env:USERPROFILE\.ssh\id_ed25519_hostinger root@srv743466.hstgr.cloud "cd /var/www/funerales/frontend-source && git pull && npm run build && rm -rf /var/www/funerales/frontend/* && cp -r dist/* /var/www/funerales/frontend/"

# EN TU NAVEGADOR
# Ctrl + Shift + R (hard refresh)
```

---

## 📞 Contactos de Emergencia

### Proveedores
- **Hosting:** Hostinger
- **Dominio:** ciudadanosb.com
- **SSL:** Let's Encrypt (auto-renovado)

### Ubicaciones Importantes
- **Repositorio:** github.com/crisio/serene-garden-scroll
- **Documentación Strapi:** strapi.io/documentation

---

## ✅ Checklist Post-Deploy

Después de cada deploy, verificar:

- [ ] Sitio carga correctamente (https://funeralesdelrecuerdo.ciudadanosb.com)
- [ ] API responde (https://funeralesapi.ciudadanosb.com/api/hero-slides)
- [ ] No hay errores 401/CORS en consola del navegador
- [ ] Imágenes cargan correctamente
- [ ] Fuentes se muestran correctamente
- [ ] Links de teléfono funcionan (tel:)
- [ ] Botones de WhatsApp funcionan
- [ ] Mobile menu funciona
- [ ] PM2 muestra servicio "online"
- [ ] Nginx no tiene errores en logs

---

**Última actualización:** Febrero 2026
**Mantenido por:** Equipo de Desarrollo
