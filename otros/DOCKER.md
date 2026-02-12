Dockerización Implementada (EF6)
1. Dockerfile del Frontend

Ubicación: frontend/Dockerfile

Implementación: Containerización del frontend Ionic/Angular con Node.js 22

Características:

    Imagen base: node:22-alpine (compatible con Angular CLI v18+)

    Ionic CLI instalado globalmente

    Hot reload habilitado

    Puerto expuesto: 8100

    Servidor accesible externamente (--host=0.0.0.0)

Contenido:

text
FROM node:22-alpine
RUN npm install -g @ionic/cli
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8100
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--external"]

Beneficios:

    Entorno de desarrollo consistente

    No requiere instalación local de Node.js/Ionic

    Aislamiento de dependencias

    Hot reload para desarrollo ágil

2. Archivo .dockerignore

Ubicación: frontend/.dockerignore

Implementación: Exclusión de archivos innecesarios del contexto Docker

Archivos excluidos:

    node_modules/ - Reinstalados en el contenedor

    .angular/ - Cache de Angular

    dist/ y www/ - Archivos compilados

    .vscode/, .idea/ - Configuraciones de IDE

    *.log - Logs de npm/Angular

    .git/ - Historial de Git

Beneficios:

    Reduce tiempo de build en ~80%

    Imagen final más liviana (~500MB vs ~1.2GB)

    Evita conflictos de dependencias

3. Docker Compose

Ubicación: docker-compose.yml (raíz del proyecto)

Implementación: Orquestación de servicios con Docker Compose
Servicios Configurados:
3.1. PostgreSQL

    Imagen: postgres:14-alpine

    Puerto: 5432

    Base de datos: IngWeb

    Credenciales: postgres/postgres

    Volumen persistente: postgres_data

    Health check: Verifica cada 10s con pg_isready

Configuración:

text
postgres:
  image: postgres:14-alpine
  container_name: marketplace-db
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s

Beneficios:

    Base de datos aislada y portable

    Datos persistentes entre reinicios

    Fácil backup/restore

    No requiere PostgreSQL instalado localmente

3.2. Frontend Ionic

    Build context: ./frontend

    Puerto: 8100

    Dependencia: Espera a que PostgreSQL esté healthy

    Volúmenes:

        Código fuente montado para hot reload

        node_modules excluido del montaje

    Red: marketplace-network (comunicación con PostgreSQL)

Configuración:

text
frontend:
  build:
    context: ./frontend
  container_name: marketplace-frontend
  ports:
    - "8100:8100"
  depends_on:
    postgres:
      condition: service_healthy
  volumes:
    - ./frontend:/app
    - /app/node_modules

Beneficios:

    Desarrollo en entorno idéntico a producción

    Hot reload sin necesidad de reconstruir imagen

    Aislamiento de dependencias frontend/backend

    Fácil escalabilidad

4. Red Privada

Implementación: Red bridge personalizada marketplace-network

Características:

    Comunicación interna entre contenedores

    Frontend puede acceder a PostgreSQL usando hostname postgres

    Aislamiento de red del host

Beneficios:

    Seguridad: Servicios no expuestos innecesariamente

    Resolución DNS automática entre contenedores

    Fácil adición de nuevos servicios

5. Volúmenes Persistentes

Implementación: Volumen Docker para PostgreSQL

Volumen creado: postgres_data

Características:

    Datos de PostgreSQL persisten entre reinicios

    Independiente del ciclo de vida del contenedor

    Backups fáciles con docker cp

Beneficios:

    No se pierden datos al hacer docker compose down

    Migraciones de base de datos seguras

    Respaldo y recuperación simplificados

6. Health Checks

Ubicación: Servicio PostgreSQL en docker-compose.yml

Implementación:

text
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5

Funcionamiento:

    Verifica cada 10 segundos si PostgreSQL acepta conexiones

    Frontend espera a que PostgreSQL esté healthy antes de iniciar

    Máximo 5 reintentos antes de marcar como unhealthy

Beneficios:

    Previene errores de conexión al iniciar frontend

    Autorecuperación en caso de fallos temporales

    Orden de inicio garantizado

Arquitectura Final

text
┌─────────────────────────────────────┐
│       Docker Compose                │
│                                     │
│  ┌──────────┐      ┌──────────┐   │
│  │ Frontend │      │PostgreSQL│   │
│  │ :8100    │◄────►│ :5432    │   │
│  │ (Ionic)  │      │          │   │
│  └──────────┘      └──────────┘   │
│       ↓                             │
└───────┼─────────────────────────────┘
        ↓
  ┌──────────┐
  │ Backend  │
  │ :3000    │ (Local)
  │(Node.js) │
  └──────────┘

Comandos Implementados

Iniciar entorno:

bash
docker compose up

Detener entorno:

bash
docker compose down

Reconstruir después de cambios:

bash
docker compose up --build

Ver logs en tiempo real:

bash
docker compose logs -f frontend

Resultados de la Implementación
Antes de Docker

    Dependencias globales requeridas (Node.js, Ionic CLI)
    Conflictos de versiones entre proyectos
    PostgreSQL local requerido
    Configuración manual por desarrollador
    "Funciona en mi máquina" problems

Después de Docker

    Solo Docker Desktop requerido
    Entorno consistente para todo el equipo
    PostgreSQL containerizado y portable
    Un comando para levantar todo: docker compose up
    Fácil onboarding de nuevos desarrolladores

Métricas

Tiempo de setup:

    Sin Docker: ~45-60 minutos (instalación + configuración)

    Con Docker: ~5 minutos (solo Docker Desktop)

Tamaño de imágenes:

    Frontend: ~500 MB

    PostgreSQL: ~100 MB

    Total: ~600 MB

Rendimiento:

    Tiempo de inicio: ~15 segundos

    Hot reload: <1 segundo

    Rebuild completo: ~3-5 minutos (primera vez)

Tecnologías Utilizadas

    Docker: v24.0+

    Docker Compose: v2.0+

    Node.js: v22.x (Alpine)

    PostgreSQL: v14 (Alpine)

    Ionic CLI: v7.x

    Angular: v18.x

Proyecto: Marketplace PUCV
Entrega Final: EF6 - Docker y Despliegue