<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Palabritas - Aprende a Leer y Escribir

Aplicación educativa infantil interactiva de lectoescritura, fonética en español, trazos táctiles y álbum de recompensas (React 19 + Vite + Tailwind CSS + PWA).

---

## 🐳 Ejecución con Docker (Recomendado)

El proyecto cuenta con un contenedor Docker optimizado mediante compilación **multi-etapa**:
- **Builder**: Bun para instalación ultrarrápida y compilación del bundle Vite.
- **Runner**: Servidor web Nginx Alpine ultraligero con compresión Gzip, cabeceras de seguridad, caché optimizada para PWA y soporte SPA.

### 1. Iniciar en Modo Producción (Actualmente Activo)

```bash
docker compose up -d --build
```

Abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

Para ver el estado del contenedor y su healthcheck:
```bash
docker compose ps
docker compose logs -f
```

Para detenerlo:
```bash
docker compose down
```

### 2. Iniciar en Modo Desarrollo (con Hot-Reload)

Si deseas modificar código en tiempo real dentro del contenedor:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 💻 Ejecución Local sin Docker

**Requisitos:** Node.js (v20+) o Bun

1. Instalar dependencias:
   ```bash
   bun install   # o npm install
   ```

2. Ejecutar servidor de desarrollo:
   ```bash
   bun run dev   # o npm run dev
   ```

3. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)
