# 📱 Sistema de Mensajería - Documentación Backend

## 📋 Descripción General

Sistema de mensajería en tiempo real para el marketplace universitario PUCV que permite la comunicación entre usuarios mediante conversaciones uno a uno.

**Características principales:**
- Crear conversaciones entre usuarios
- Enviar y recibir mensajes
- Historial de mensajes por conversación
- Listar todas las conversaciones del usuario
- Indicador de mensajes no leídos
- Asociar conversaciones a productos
- Autenticación JWT

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** Azure PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Librería de BD:** pg (node-postgres)

***

## 🗄️ Estructura de la Base de Datos

### Tabla: conversaciones

Almacena las conversaciones entre dos usuarios. Cada conversación puede estar relacionada opcionalmente con un producto.

**Columnas:**
- `id`: Identificador único
- `usuario1_id`: ID del primer usuario participante
- `usuario2_id`: ID del segundo usuario participante
- `producto_id`: ID del producto relacionado (opcional)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Tabla: mensajes

Almacena todos los mensajes de las conversaciones.

**Columnas:**
- `id`: Identificador único del mensaje
- `conversacion_id`: ID de la conversación a la que pertenece
- `remitente_id`: ID del usuario que envió el mensaje
- `mensaje`: Contenido del mensaje (texto)
- `leido`: Indica si el mensaje fue leído (true/false)
- `created_at`: Fecha y hora de envío

***

## ⚙️ Configuración

### Variables de Entorno

El archivo `.env` debe contener:

- **DATABASE_URL:** Cadena de conexión a Azure PostgreSQL con SSL
- **JWT_SECRET:** Clave secreta para firmar tokens JWT
- **PORT:** Puerto del servidor (por defecto 3000)

### Archivo de Conexión (pool.ts)

Se configuró un pool de conexiones a PostgreSQL con soporte SSL para Azure. Incluye eventos para confirmar conexión exitosa o reportar errores.

### Rutas (chat.routes.ts)

Todas las rutas están protegidas con el middleware de autenticación JWT. Las rutas disponibles son:

- **GET /conversaciones:** Listar conversaciones del usuario
- **POST /conversaciones:** Crear o obtener conversación
- **GET /:conversacionId/mensajes:** Obtener mensajes
- **POST /:conversacionId/mensajes:** Enviar mensaje

***

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/chat
```

**Autenticación requerida:** Todas las rutas requieren token JWT en el header Authorization.

***

### 1. Listar Conversaciones del Usuario

**Método:** GET  
**Ruta:** `/conversaciones`  
**Autenticación:** Requerida

**Respuesta:**
Devuelve un array con todas las conversaciones donde participa el usuario autenticado. Cada conversación incluye:
- Datos básicos de la conversación
- Nombre y usuario del otro participante
- Último mensaje enviado
- Cantidad de mensajes no leídos

***

### 2. Crear o Obtener Conversación

**Método:** POST  
**Ruta:** `/conversaciones`  
**Autenticación:** Requerida

**Parámetros del body:**
- `otroUsuarioId` (requerido): ID del usuario con quien conversar
- `productoId` (opcional): ID del producto relacionado

**Respuesta:**
Si la conversación ya existe, la devuelve. Si no existe, crea una nueva. Incluye un campo `nueva` que indica si fue creada o ya existía.

***

### 3. Obtener Mensajes de una Conversación

**Método:** GET  
**Ruta:** `/:conversacionId/mensajes`  
**Autenticación:** Requerida

**Respuesta:**
Devuelve un array con todos los mensajes de la conversación especificada, ordenados cronológicamente. Cada mensaje incluye:
- Contenido del mensaje
- ID y nombre del remitente
- Estado de lectura
- Fecha de envío

---

### 4. Enviar Mensaje

**Método:** POST  
**Ruta:** `/:conversacionId/mensajes`  
**Autenticación:** Requerida

**Parámetros del body:**
- `mensaje` (requerido): Texto del mensaje a enviar

**Respuesta:**
Devuelve el mensaje creado con todos sus datos incluyendo ID, timestamp y datos del remitente.

---

## 🔐 Seguridad

### Autenticación JWT

Todas las rutas están protegidas mediante middleware de verificación de token JWT. El token debe enviarse en el header Authorization con formato Bearer.

### Validaciones Implementadas

- Usuario debe estar autenticado para acceder a cualquier endpoint
- Usuario solo puede ver sus propias conversaciones
- Usuario solo puede enviar mensajes en conversaciones donde participa
- Los mensajes no pueden estar vacíos
- Se validan los IDs de conversación y usuarios

***

## 💡 Flujo de Uso

### Paso 1: Autenticación
El usuario debe hacer login para obtener un token JWT válido.

### Paso 2: Crear Conversación
Se envía una petición POST con el ID del otro usuario para iniciar o recuperar una conversación existente.

### Paso 3: Enviar Mensajes
Con el ID de la conversación, se pueden enviar mensajes mediante peticiones POST.

### Paso 4: Consultar Mensajes
Se puede obtener el historial completo de mensajes de cualquier conversación mediante peticiones GET.

### Paso 5: Ver Conversaciones
El usuario puede listar todas sus conversaciones activas para navegar entre ellas.

***

## 🧪 Testing

### Usuarios de Prueba

Se crearon dos usuarios de prueba en la base de datos:

**Usuario 1:**
- Correo: test1@mail.pucv.cl
- Contraseña: 12345678

**Usuario 2:**
- Correo: test2@mail.pucv.cl
- Contraseña: 12345678

### Casos de Prueba Verificados

- ✅ Crear conversación entre dos usuarios
- ✅ Enviar mensaje en conversación existente
- ✅ Obtener historial de mensajes
- ✅ Listar todas las conversaciones del usuario
- ✅ Validación de autenticación JWT

***

## 🚀 Despliegue

### Requisitos
- Node.js versión 18 o superior
- PostgreSQL 14 o superior (Azure)
- Variables de entorno correctamente configuradas

### Comandos Principales

**Desarrollo:** npm run dev  
**Compilar:** npm run build  
**Producción:** npm start

***

## 📝 Notas Importantes

- Las conversaciones se actualizan automáticamente cuando se envía un mensaje
- Los mensajes están ordenados cronológicamente (más antiguos primero)
- Las conversaciones se ordenan por última actualización (más recientes primero)
- El sistema soporta asociar conversaciones a productos específicos del marketplace
- La conexión a Azure PostgreSQL requiere SSL habilitado

***

## 🐛 Problemas Comunes

**Error: "no existe la relación conversaciones"**  
Solución: Verificar que las tablas estén creadas en la base de datos.

**Error: "getaddrinfo ENOTFOUND"**  
Solución: Revisar la cadena de conexión DATABASE_URL en el archivo .env.

**Error: "Usuario no autenticado"**  
Solución: Incluir el token JWT en el header Authorization de la petición.

**Error: "Token inválido"**  
Solución: Hacer login nuevamente para obtener un token válido y actualizado.

***

## 👥 Información del Proyecto

**Desarrollo:** Equipo Marketplace PUCV  
**Curso:** Ingeniería Web y Móvil  
**Institución:** Pontificia Universidad Católica de Valparaíso  
**Fecha:** Noviembre 2025

***

**Sistema completamente funcional y probado en entorno de desarrollo con Azure PostgreSQL.**


### **Nuevas Funcionalidades Avanzadas**

#### **WebSocket en Tiempo Real**
El sistema notifica automáticamente a los usuarios cuando reciben un nuevo mensaje mediante Socket.IO.

#### **Paginación de Mensajes**
Endpoint: `GET /:conversacionId/mensajes/paginados?pagina=1&limite=20`

Permite cargar mensajes por páginas para mejorar el rendimiento.

#### **Búsqueda de Conversaciones**
Endpoint: `GET /conversaciones/buscar?q=texto`

Busca conversaciones por nombre de usuario o contenido de mensajes.

#### **Eliminar Conversaciones**
Endpoint: `DELETE /:conversacionId`

Permite eliminar conversaciones completas (incluyendo todos sus mensajes por CASCADE).

***

## 📊 ESTADÍSTICAS DEL PROYECTO

- **Archivos modificados:** 4
  - `server.ts`
  - `chat.controller.ts`
  - `chat.routes.ts`
  - `socket/socket.ts` (nuevo)
- **Líneas de código:** ~500+
- **Endpoints API:** 7
- **Funcionalidades:** 8
- **Base de datos:** Azure PostgreSQL
- **Tiempo de desarrollo:** 1 sesión

***