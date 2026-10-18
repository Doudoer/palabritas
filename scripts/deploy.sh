#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Automatizado a VPS
# Palabritas - Aprende a Leer y Escribir
# ==============================================================================

set -euo pipefail

VPS_HOST="${VPS_HOST:-167.235.21.59}"
VPS_USER="${VPS_USER:-root}"
DEST_DIR="${DEST_DIR:-/opt/palabritas}"

echo "=========================================================="
echo "🚀 Desplegando Palabritas en ${VPS_USER}@${VPS_HOST}:${DEST_DIR}..."
echo "=========================================================="

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Sincronizar archivos del proyecto hacia el VPS excluyendo temporales
echo "📤 Sincronizando archivos del proyecto..."
rsync -avz --delete \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude ".git" \
    --exclude ".DS_Store" \
    --exclude "*.log" \
    --exclude ".env.local" \
    --exclude ".agents" \
    ./ "${VPS_USER}@${VPS_HOST}:${DEST_DIR}/"

# 2. Reconstruir e iniciar contenedor en el servidor remoto
echo "🐳 Construyendo e iniciando contenedores en el VPS..."
ssh "${VPS_USER}@${VPS_HOST}" << 'EOF'
set -euo pipefail
cd /opt/palabritas
echo "Building and launching container..."
docker compose up -d --build

echo "Waiting for healthcheck..."
sleep 6
docker compose ps
EOF

# 3. Comprobar conectividad HTTP desde el exterior
echo "🔍 Verificando conectividad HTTP pública..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${VPS_HOST}/" || true)

echo "=========================================================="
if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 ¡Despliegue exitoso! La aplicación está en vivo:"
    echo "   👉 http://${VPS_HOST} (Puerto 80)"
    echo "   👉 http://${VPS_HOST}:3000 (Puerto 3000)"
else
    echo "⚠️ Respuesta HTTP recibida: ${HTTP_CODE}."
    echo "   Verifica los logs en el VPS con: ssh ${VPS_USER}@${VPS_HOST} 'docker compose logs -f'"
fi
echo "=========================================================="
