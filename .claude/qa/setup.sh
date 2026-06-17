#!/usr/bin/env bash
# Setup best-effort para el agente de QA (Chrome DevTools MCP).
# Deja un Chrome headless escuchando en :9222 con --no-sandbox (necesario al correr
# como root en contenedor) para que el MCP se conecte vía --browserUrl.
# Idempotente y NO debe romper la sesión si algo falla (network policy / permisos).
set -uo pipefail

DEBUG_PORT="${QA_CHROME_PORT:-9222}"
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
    $SUDO apt-get install -y \
      libnss3 libatk-bridge2.0-0 libatk1.0-0 libcups2 libgbm1 libasound2 \
      libpangocairo-1.0-0 libgtk-3-0 libxshmfence1 libxdamage1 libxrandr2 \
      libxcomposite1 libxfixes3 fonts-liberation >/dev/null 2>&1 || true
  fi
fi

# 3. Resolver binario de Chrome (descarga Chrome for Testing si hace falta)
find_chrome() {
  for c in google-chrome google-chrome-stable chromium chromium-browser; do
    command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return 0; }
  done
  ls "$HOME"/.cache/puppeteer/chrome/*/chrome-linux64/chrome 2>/dev/null | head -1 && return 0
  return 1
}
CHROME="$(find_chrome || true)"
if [ -z "${CHROME:-}" ]; then
  log "Descargando Chrome for Testing (1a vez)..."
  npx -y puppeteer browsers install chrome >/dev/null 2>&1 || log "No se pudo descargar Chrome (network policy?)."
  CHROME="$(find_chrome || true)"
fi

# 4. Levantar Chrome headless con remote debugging si el puerto no responde
if curl -sf "http://127.0.0.1:${DEBUG_PORT}/json/version" >/dev/null 2>&1; then
  log "Chrome ya escucha en :${DEBUG_PORT}."
elif [ -n "${CHROME:-}" ]; then
  log "Lanzando Chrome headless en :${DEBUG_PORT}..."
  rm -rf /tmp/qa-chrome
  nohup "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
    --remote-debugging-address=127.0.0.1 --remote-debugging-port="${DEBUG_PORT}" \
    --user-data-dir=/tmp/qa-chrome about:blank >/tmp/qa-chrome.log 2>&1 &
  for _ in $(seq 1 15); do
    curl -sf "http://127.0.0.1:${DEBUG_PORT}/json/version" >/dev/null 2>&1 && break
    sleep 1
  done
  curl -sf "http://127.0.0.1:${DEBUG_PORT}/json/version" >/dev/null 2>&1 \
    && log "Chrome listo en :${DEBUG_PORT}." \
    || log "Chrome no respondió en :${DEBUG_PORT} (ver /tmp/qa-chrome.log)."
else
  log "No hay binario de Chrome disponible; el MCP no podrá conectarse."
fi

log "Setup terminado."
exit 0
