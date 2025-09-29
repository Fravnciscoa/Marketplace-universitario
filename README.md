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

## Requerimientos Funcionales por rol

### Rol-Administrador

- **1 – RF – Gestion de categorias (Administrador)**: Gestionar categorías de productos/servicios para organizar el marketplace.
  
- **2 – RF – Moderacion de administradores (Administradores)**: El sistema debera poder ser administrado y moderado por los usuarios con rol de admin que podran eliminar si no se cumplen las normas de comunidad y revisar publicaciones.

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



