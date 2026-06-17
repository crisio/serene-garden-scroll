#!/usr/bin/env bash
# Setup best-effort para el agente de QA (Chrome DevTools MCP).
# Idempotente y NO debe romper la sesión si algo no está disponible
# (p. ej. network policy restrictiva o falta de permisos apt).
set -uo pipefail

log() { printf '[qa-setup] %s\n' "$*"; }

cd "$(dirname "$0")/../.." 2>/dev/null || true

# 1. Dependencias del proyecto (para poder levantar el dev server)
if [ -f package.json ] && [ ! -d node_modules ]; then
  log "Instalando dependencias del proyecto (npm ci)..."
  npm ci >/dev/null 2>&1 || npm install >/dev/null 2>&1 || log "npm install falló (revisa red)."
fi

# 2. Librerías de sistema que Chrome headless suele necesitar (best-effort)
if command -v apt-get >/dev/null 2>&1; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1 && SUDO="sudo"
  if [ "$(id -u)" -eq 0 ] || [ -n "$SUDO" ]; then
    log "Verificando libs de sistema para Chrome..."
    $SUDO apt-get update -y >/dev/null 2>&1 || true
    $SUDO apt-get install -y \
      libnss3 libatk-bridge2.0-0 libatk1.0-0 libcups2 libgbm1 libasound2 \
      libpangocairo-1.0-0 libgtk-3-0 libxshmfence1 libxdamage1 libxrandr2 \
      libxcomposite1 libxfixes3 fonts-liberation >/dev/null 2>&1 \
      || log "No se pudieron instalar todas las libs (continuo igual)."
  fi
fi

# 3. Pre-descargar el navegador que usa chrome-devtools-mcp (Chrome for Testing)
log "Pre-cargando Chrome para el MCP (puede tardar la 1a vez)..."
npx -y puppeteer browsers install chrome >/dev/null 2>&1 \
  || npx -y chrome-devtools-mcp@latest --version >/dev/null 2>&1 \
  || log "No se pudo pre-descargar Chrome (network policy?). El MCP lo intentará al ejecutarse."

log "Listo. Si el MCP falla por sandbox en contenedor, ver fallback --browserUrl en .claude/qa/README.md"
exit 0
