# **Marketplace Universitario PUCV – Documentación Técnica por Entregables (Profesional)**

## **1. Entrega Parcial 1 – Diseño y Estructura Inicial**
**Objetivo:** Definir requerimientos, arquitectura UX, estructura del frontend y diseño inicial de la aplicación.

---

## **EP 1.1 – Requerimientos Funcionales y No Funcionales**
Se definieron **7 requerimientos funcionales** y **7 no funcionales**, considerando **dos roles: Usuario y Administrador**.

### **Requerimientos Funcionales (RF)**
1. RF01 – El usuario podrá buscar productos mediante filtros avanzados.
2. RF02 – El usuario podrá publicar productos con imágenes y detalles.
3. RF03 – El usuario podrá editar o eliminar sus publicaciones.
4. RF04 – El usuario podrá enviar mensajes al vendedor mediante chat integrado.
5. RF05 – El administrador podrá gestionar reportes de contenido.
6. RF06 – El usuario podrá ver su perfil y administrar su información.
7. RF07 – El administrador podrá deshabilitar publicaciones inapropiadas.

### **Requerimientos No Funcionales (RNF)**
1. RNF01 – El sistema debe cargar la UI en menos de 3 segundos.
2. RNF02 – Toda la comunicación debe realizarse mediante HTTPS.
3. RNF03 – Tiempo de respuesta del backend debe ser ≤ 500ms.
4. RNF04 – La aplicación debe ser responsive (web/móvil).
5. RNF05 – La API debe soportar concurrencia de 200 usuarios.
6. RNF06 – El sistema debe utilizar estándares de accesibilidad WCAG.
7. RNF07 – El diseño debe seguir lineamientos estéticos PUCV.

---

## **EP 1.2 – Bocetos de UI/UX + Prototipo Figma**
Se desarrollaron **7 pantallas prototipadas** en Figma versión web y móvil:
- Home
- Detalle de producto
- Publicación de producto
- Conversación (Chat)
- Lista de conversaciones
- Perfil de usuario
- Página de administración

Cada mockup sigue principios UX: **consistencia, visibilidad del estado, accesibilidad, jerarquía visual, minimalismo**.

---

## **EP 1.3 – Formularios de Login y Registro**
Se diseñaron dos formularios completos que incluyen:
- Nombre de usuario
- RUT
- Correo electrónico
- Región y comuna
- Contraseña y confirmación
- Aceptación de términos

Ambos formularios fueron desarrollados en Figma y posteriormente en Angular usando formularios reactivos.

---

## **EP 1.4 – Navegación y Experiencia de Usuario**
### **Flujo de navegación definido:**
```
Home → Detalle Producto → Chat → Perfil → Mis Productos → Administrador
```

### **Principios UX aplicados:**
- Ley de Fitts
- Ley de Hick
- Normas WCAG para accesibilidad
- Patrones Mobile-first y navegación persistente

### **Patrones aplicados:**
- Card-based UI
- Bottom navigation
- Floating Action Button
- Headers institucionales

---

## **EP 1.5 – Creación del Proyecto Ionic + Angular**
Se inicializó el proyecto con:
```
ice start marketplace tabs --type=angular --standalone
```
Estructura modularizada por páginas y servicios.

---

## **EP 1.6 – Implementación de la Navegación**
Se integró el sistema de rutas en Angular Standalone:
- RouterOutlet global
- Segmentos por módulo
- Guards para vistas protegidas

---

## **EP 1.7 – Diseño de Pantallas Principales (mín. 4)**
- Home
- Detalle de Producto
- Publicar Producto
- Perfil

Cada pantalla implementada con componentes Ionic.

---

## **EP 1.8 – Uso de Ionic Components**
Componentes utilizados:
- ion-card
- ion-input
- ion-button
- ion-grid
- ion-list
- ion-modal
- ion-segment
- ion-fab

---

# **2. Entrega Parcial 2 – Integración Frontend + Backend y Autenticación**
**Objetivo:** Crear backend, modelar la base de datos y conectar la app.

---

## **EP 2.1 – Creación del Servidor Backend (Node.js + Express)**
- Proyecto inicializado en TypeScript.
- Arquitectura en capas: rutas, controladores, servicios y middleware.

---

## **EP 2.2 – Modelado de Base de Datos Relacional (PostgreSQL Azure)**
Tablas creadas:
- usuarios
- productos
- conversaciones
- mensajes
- reportes

Se definieron claves foráneas, índices y relaciones.

---

## **EP 2.3 – Desarrollo de API REST**
Endpoints principales:
- Autenticación
- Productos (CRUD)
- Chat (REST + WebSocket)
- Reportes

La API cumple principios REST y manejo de errores.

---

## **EP 2.4 – Consumo de API desde Ionic**
Implementado con HttpClient de Angular y servicios:
```
AuthService
ProductoService
ChatService
ReporteService
```

---

## **EP 2.5 – Autenticación con JWT**
Incluye:
- Generación de token
- Verificación en middleware
- Interceptor HTTP en frontend
- Roles

---

## **EP 2.6 – Validación de Usuarios y Manejo de Sesiones**
- Sesiones persistidas con localStorage
- Guards
- Auto-logout por expiración

---

# **3. Entrega Final – Funcionalidades Avanzadas y Despliegue**
**Objetivo:** Completar funcionalidades, optimizar, asegurar y desplegar.

---

## **EF 1 – Funcionalidades completas (CRUD + chat + notificaciones)**
Incluye:
- Publicación de productos
- Edición y eliminación
- Chat en tiempo real
- Indicadores de lectura y escritura
- Notificaciones internas

---

## **EF 2 – Mejoras UI/UX y Rendimiento**
- Lazy loading
- SCSS optimizado
- Componentes reutilizables
- Accesibilidad mejorada
- Animaciones suaves en Ionic

---

## **EF 3 – Seguridad Avanzada**
- Protección contra SQL Injection
- Sanitización de entradas
- CORS seguro
- Hashing de contraseñas con bcrypt
- Validación estricta de formularios

---

## **EF 4 – Optimización de Consultas**
- Índices en columnas críticas
- Consultas JOIN optimizadas
- Reducción de ancho de respuesta

---

## **EF 5 – Integración con Servicio Externo**
- Azure PostgreSQL Database
- Azure Storage para imágenes
- (Previo: Cloudinary)

---

## **EF 6 – Dockerización Completa**
- Creación de Dockerfile frontend y backend
- docker-compose para orquestación de:
  - frontend
  - backend
  - base de datos
- Pruebas locales de despliegue

---

# **4. Entrega Final – Resultado Global**
- CRUD completo funcional
- UI/UX optimizado estilo profesional
- Seguridad web aplicada
- Chat en tiempo real estable
- Backend robusto y documentado
- Proyecto listo para despliegue en la nube

---

# **5. Repositorio y Material Entregado**
- Repositorio GitHub con frontend y backend
- Prototipo Figma
- Pruebas Postman
- Documentación técnica completa

