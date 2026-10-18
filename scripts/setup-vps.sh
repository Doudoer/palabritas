#!/usr/bin/env bash
# ==============================================================================
# Script de aprovisionamiento inicial para VPS (Ubuntu / Debian)
# Palabritas - Preparación de entorno Docker y seguridad básica
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🚀 Iniciando preparación del VPS para Palabritas..."
echo "=========================================================="

# 1. Verificar permisos de root
if [ "$(id -u)" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root o con sudo."
    exit 1
fi

# 2. Actualización del sistema
echo "📦 Actualizando lista de paquetes del sistema..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# 3. Instalación de dependencias esenciales
echo "🔧 Instalando herramientas esenciales..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    git \
    rsync \
    htop \
    unzip

# 4. Instalación de Docker y Docker Compose oficial
echo "🐳 Verificando e instalando Docker Engine..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    echo "✅ Docker instalado correctamente:"
    docker --version
    docker compose version
else
    echo "✅ Docker ya se encuentra instalado:"
    docker --version
    docker compose version
fi

# 5. Configuración del Firewall (UFW)
echo "🛡️ Configurando Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Palabritas'
ufw allow 3000/tcp comment 'Palabritas App Port'
# ufw allow 443/tcp comment 'HTTPS (futuro)'

# Habilitar UFW sin pedir confirmación interactiva
echo "y" | ufw enable || true
ufw status verbose

# 6. Crear directorio de despliegue para la app
APP_DIR="/opt/palabritas"
echo "📁 Creando directorio de la aplicación en ${APP_DIR}..."
mkdir -p "${APP_DIR}"
chmod 755 "${APP_DIR}"

echo "=========================================================="
echo "🎉 ¡VPS preparado con éxito!"
echo "   - Docker y Docker Compose listos y activos"
echo "   - Firewall UFW activo (Puertos 22, 80 y 3000 abiertos)"
echo "   - Directorio de la aplicación: ${APP_DIR}"
echo "=========================================================="
