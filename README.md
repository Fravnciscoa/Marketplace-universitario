# Presentado por:
- Sebastian Castro
- Francisco Castro
- Esteban Martinez
- Joaquin Llanos
# Marketplace-universitario

## Índice 
1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Requerimientos](#requerimientos)
3. [Prototipo de diseño](#prototipo-de-diseño)
4. [Diagrama de flujo](#diagrama-de-flujo)
5. [Experiencia de usuario](#experiencia-de-usuario)
6. [Librerias usadas](#librerias-usadas)
   

## Resumen del proyecto
- El Marketplace Universitario es una aplicación pensada para los estudiantes de la PUCV, donde podrán comprar, vender o intercambiar productos y servicios dentro de la comunidad universitaria. La idea es crear un espacio seguro y confiable que fomente la economía circular entre los estudiantes.

- La aplicación permitirá a los usuarios registrarse, publicar productos, buscar lo que necesiten, reservar o comprar, y comunicarse entre sí. Todo esto con una interfaz sencilla, accesible y atractiva, basada en los colores institucionales de la universidad.

## Requerimientos Funcionales 

### Rol usuario

- **1 – RF – Reporte de publicaciones (Usuarios)**: El sistema debera permitir a los usuarios reportar publicaciones o comportamientos inadecuados.
  
- **2 – RF – Gestion de perfil de usuario (Usuarios)**: El sistema debera permitir al los usuarios editar su perfil (nombre, foto, carrera, datos de contacto) y ver su historial de de compra/venta.
  
- **3 – RF - Gestion de publicaciones (Usuarios)**: El sistema debera permitir que los usuarios puedan crear, editar y eliminar publicaciones de productos con titulo, descripcion, categoria, precio y fotos.
  
- **4 – RF – Busqueda de productos (Usuarios)**: El sistema debera permitir a los usuarios buscar mediante palabras claves, categorias.
  
- **5 – RF – Carrito de compras (Usuarios)**: El sistema debera permitir a los usuarios agreagar productos al carrito de compras y realizar la compra o reservar.
  
- **6 – RF – Chat interno (Usuarios)**: El sistema debera permitir tener comunicacion con el comprador y vendedor a traves de un sistema de mensajeria dentro de la plataforma.

## Requerimientos no funcionales

- **1 – RFN – Correo electronico institucional**: El sistema debera registrar solamente a estudiantes con extension de correo de la institucion (ej@mail.pucv.cl o ej@pucv.cl).
  
- **2 – RFN – Compatibilidad entre dispositivos**: El sistema debera ser compatible en dispositivos moviles (iOS 18.x/26 y Android 16) y dispostivos desktop (Windows 11/10).
  
-	**3 – RFN – Seguridad de datos**: El sistema protegera la informacion personal y transaccional de los usuarios utilizando cifrado de comunicacion y almacenamiento.
  
-	**4 – RFN – Mantenibilidad y actualizacion**: El sistema debera ser desarrolladode manera modular y documentada, permitiendo futuras actualizaciones y mejoras sin interrupcion del servicio.
  
-	**5 – RFN – Tolerancia a fallos**: El sistema debera estar disponible 98% durante el periodo academico, implementando metodos de recuperacion ante fallas y respaldos para la base de datos
  
-	**6 – RFN – Rendimiento y escalabilidad**: El sistema debera soportar por lo menos a 100 usuarios realizando operaciones criticas (busqueda, chat, compra) sin tanto tiempo de respuesta.
  
-	**7 – RFN – Integridad de informacion**: El sistema debera garantizar que las transaccione y publicaciones no sufran perdidas ni alteraciones, implementando controles de validacion e integridad.   

## Prototipo de diseño 

[Figma - Prototipo de Marketplace universitario](https://www.figma.com/design/sCQZDcJZkufCnVFbejz28F/Mercado-PUCV?m=auto&t=XBhZd2WwheQ1J7o2-1)

## Diagramas de flujo de datos

[Miro - Diagrama de flujo de navegacion de usuario](https://miro.com/app/board/uXjVJBmUGrc=/?share_link_id=335988796617)

![Modelo relacional del proyecto](./src/assets/Modelos/Modelo%20relacional.png)

## Experiencia de usuario

-Se espera que los estudiantes perciban la plataforma como:
  -Eficiente: Acciones rápidas, búsquedas con filtros claros y compras con pocos pasos.
  -Accesible: Interfaz legible, con contraste adecuado, soporte de lectores de pantalla y cumplimiento de estándares WCAG 2.1.
  -Estética y coherente: Uso de paleta institucional de la universidad (azul/amarillo PUCV), tipografía consistente y jerarquías visuales claras.

-Principios de UX aplicados
  -Consistencia: Los botones, menús y colores mantienen un estilo uniforme en todas las pantallas.
  -Visibilidad del estado del sistema: El sistema entrega retroalimentación inmediata (mensajes de éxito, errores, confirmaciones).
  -Prevención de errores: Formularios con validación en tiempo real (ej. precio no negativo, categoría obligatoria).
  -Flexibilidad y eficiencia de uso: Búsqueda con autocompletado y filtros dinámicos para reducir tiempo de interacción.
  -Minimalismo estético: La interfaz evita elementos innecesarios, priorizando claridad en la acción principal de cada pantalla.


-Patrones de diseño UX utilizados
  -Card Layout: Cada publicación se muestra como una tarjeta con foto, título, precio y estado, facilitando la comparación.
  -Bottom Navigation (en móvil): Barra fija con accesos directos a Inicio, Búsqueda, Publicar, Carrito y Perfil.
  -Grid System: Organización de contenidos en grillas para mejorar la legibilidad y escalabilidad.
  -Chat pattern (messaging UI): Conversaciones con diseño similar a apps de mensajería conocidas para reducir curva de aprendizaje.

-Accesibilidad
  -Contraste de colores conforme a WCAG 2.1 nivel AA.
  -Alternativas textuales (atributo alt) para imágenes de productos.
  -Tamaños de fuente mínimos de 14px y escalables.
  -Navegación mediante teclado y compatibilidad con lectores de pantalla.

## Librerias usadas 

-@ionic/angular
-@angular/core
-@angular/common
-@angular/platform-browser
-@angular/router
-@angular/forms
-rxjs
-zone.js
-ionicons
-typescript
-@angular-devkit/build-angular
-@angular/cli
-karma
-karma-chrome-launcher
-karma-jasmine
-karma-jasmine-html-reporter
-jasmine-core
-@types/jasmine
-eslint
-@angular-eslint/*
-prettier



---

## Instalación y Ejecución

### Requisitos previos
- Node.js v18+
- PostgreSQL 12+
- Git

### Pasos para ejecutar

1. **Clonar el repositorio**
git clone https://github.com/Fravnciscoa/Marketplace-universitario.git
cd Marketplace-universitario-main
2. **Instalar dependencias del backend**
cd backend
npm install
3. **Configurar variables de entorno (backend)**
Crear archivo `.env` en la carpeta `backend/`:
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=IngWeb
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=3000
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_2025
4. **Crear base de datos y tabla**
-- Ejecutar los scripts SQL en src/db/
5. **Instalar dependencias del frontend**
cd ..
npm install

6. **Ejecutar en dos terminales**

Terminal 1 (Backend):
cd backend
npm run dev
Terminal 2 (Frontend):
ionic serve


La aplicación estará disponible en: `http://localhost:8100`

---

## API Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere autenticación)

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear producto (requiere autenticación)
- `PUT /api/productos/:id` - Actualizar producto (requiere autenticación)
- `DELETE /api/productos/:id` - Eliminar producto (requiere autenticación)

---

## Estructura del Proyecto
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── middlewares/
│ │ ├── models/
│ │ ├── db/
│ │ └── server.ts
│ ├── .env
│ └── package.json
├── src/
│ ├── app/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── models/
│ │ ├── interceptors/
│ │ └── app.routes.ts
│ └── main.ts
├── otros/
│ ├── diagramas/
│ └── documentacion/
├── README.md
└── .gitignore
