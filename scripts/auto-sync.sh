#!/usr/bin/env bash
# ==============================================================================
# Script de sincronización continua con el repositorio GitHub
# Palabritas - Auto-sync & Docker rebuild
# ==============================================================================

set -euo pipefail

APP_DIR="/opt/palabritas"
BRANCH="main"

cd "${APP_DIR}"

# Asegurar que el origen remoto esté configurado
if ! git remote get-url origin > /dev/null 2>&1; then
    exit 0
fi

# Traer últimos cambios de GitHub de forma silenciosa
git fetch origin "${BRANCH}" --quiet

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse "origin/${BRANCH}")

# Si hay diferencias entre el commit local y el remoto en GitHub
if [ "${LOCAL_COMMIT}" != "${REMOTE_COMMIT}" ]; then
    echo "=========================================================="
    echo "🔔 Nuevos cambios detectados en GitHub (${LOCAL_COMMIT:0:7} -> ${REMOTE_COMMIT:0:7})"
    echo "⏰ Fecha: $(date)"
    echo "📥 Actualizando código..."
    git reset --hard "origin/${BRANCH}"
    
    echo "🐳 Reconstruyendo y actualizando contenedores Docker..."
    docker compose up -d --build
    
    echo "✅ Palabritas actualizado exitosamente al commit ${REMOTE_COMMIT:0:7}"
    echo "=========================================================="
fi
