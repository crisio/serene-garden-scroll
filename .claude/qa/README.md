# Agente de QA web (Chrome DevTools MCP)

Toolkit para probar apps web con estándar de calidad alto: **errores** (consola + red),
**seguridad** (headers, HTTPS, mixed content, cookies), **velocidad** y **tiempos de carga**
(Core Web Vitals + Lighthouse), comparando todo contra un presupuesto editable.

## Componentes
| Archivo | Qué es |
|---|---|
| `../../.mcp.json` | Registra el servidor MCP `chrome-devtools` |
| `../agents/qa-engineer.md` | El subagente de QA (metodología + tools) |
| `../commands/qa-test.md` | Slash command `/qa-test [url]` |
| `budget.json` | Parámetros / umbrales de calidad (edítalos) |
| `report-template.md` | Plantilla del reporte |
| `reports/` | Reportes generados (`<fecha>-<host>.md`) |
| `setup.sh` | Hook de SessionStart: deps + Chrome (best-effort) |
| `install-global.sh` | Copia el toolkit a `~/.claude` para otras apps |

## Uso
```text
/qa-test                         # prueba http://localhost:8080 (este repo)
/qa-test https://tu-app.com      # prueba cualquier URL
```
También puedes invocar directamente al subagente `qa-engineer`.

## Permisos (opcional, para evitar prompts)
Añade a `.claude/settings.local.json` → `permissions.allow`:
```json
"Bash(npx:*)", "Bash(node:*)", "Bash(bash .claude/qa/setup.sh)", "mcp__chrome-devtools__*"
```
(No se añadieron automáticamente porque ampliar permisos requiere tu aprobación.)

## Arquitectura (verificada en este contenedor)
1. El hook **SessionStart** corre `setup.sh`, que: instala deps del proyecto, descarga
   Chrome for Testing y lanza un **Chrome headless con `--no-sandbox`** escuchando en
   `127.0.0.1:9222` (necesario al correr como root en contenedor).
2. `.mcp.json` conecta el servidor `chrome-devtools` a ese Chrome vía
   `--browserUrl=http://127.0.0.1:9222`.
3. El agente `qa-engineer` usa las tools `mcp__chrome-devtools__*` para navegar, medir y auditar.

## Requisitos / troubleshooting
- Necesita **Node** y salida a internet la 1ª vez (descarga `chrome-devtools-mcp` + Chrome).
- Si el MCP no conecta: corre `bash .claude/qa/setup.sh` y verifica
  `curl http://127.0.0.1:9222/json/version`. Cambia el puerto con `QA_CHROME_PORT`.
- En una máquina **no-contenedor** (Mac/Windows/local) puedes dejar que el MCP lance su
  propio Chrome: cambia los args de `.mcp.json` a
  `["-y","chrome-devtools-mcp@latest","--headless=true","--isolated=true"]`.
- El dev server de este repo usa `host: "::"` (IPv6); en entornos sin IPv6 levántalo con
  `npx vite --host 127.0.0.1`.
- Ajusta el rigor editando `budget.json` (los defaults son Core Web Vitals "good" = estándar alto).
