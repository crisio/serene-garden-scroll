#!/usr/bin/env bash
# Instala el toolkit de QA a nivel usuario (~/.claude) para reutilizarlo en CUALQUIER app
# cuando corres Claude Code localmente. (En el entorno remoto efímero ~/.claude no persiste;
# la fuente de verdad es este repo.)
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"   # .../.claude
DEST="${HOME}/.claude"

mkdir -p "$DEST/agents" "$DEST/commands" "$DEST/qa/reports"

cp "$SRC/agents/qa-engineer.md"     "$DEST/agents/qa-engineer.md"
cp "$SRC/commands/qa-test.md"       "$DEST/commands/qa-test.md"
cp "$SRC/qa/budget.json"            "$DEST/qa/budget.json"
cp "$SRC/qa/report-template.md"     "$DEST/qa/report-template.md"
cp "$SRC/qa/setup.sh"               "$DEST/qa/setup.sh"

echo "QA toolkit instalado en $DEST"
echo "Recuerda registrar el MCP chrome-devtools a nivel usuario:"
echo "  claude mcp add -s user chrome-devtools -- npx -y chrome-devtools-mcp@latest --headless=true --isolated=true"
echo "Uso:  /qa-test https://tu-app.com"
