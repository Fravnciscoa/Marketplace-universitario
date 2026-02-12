# ============================================================
#   📘 DOCUMENTACIÓN – Conexión a Azure Database PostgreSQL
#   Proyecto: Marketplace Universitario (Ionic + Angular + Node)
# ============================================================

## Este documento explica la arquitectura, la conexión a Azure,
## la configuración de la base de datos en la nube,
## y cómo el backend interactúa directamente con Azure PostgreSQL.
## Está diseñado para servir como documentación oficial del proyecto.
---------------------------------------------------------------


# ====================================
# 🏗️ 1. Arquitectura General del Sistema
# ====================================

## El Marketplace funciona con tres capas conectadas así:

Ionic/Angular (Frontend – puerto 8100)
        ↓ // Peticiones HTTP
Node.js + Express (Backend – puerto 3000)
        ↓ // Conexión SSL obligatoria
Azure Database for PostgreSQL – Flexible Server (Cloud)

## Toda la información dinámica (productos, usuarios, publicaciones)
## se almacena en Azure de forma remota.


# ====================================
# 🌐 2. Detalles del Servidor en Azure
# ====================================

## Tipo de servidor:
- Azure Database for PostgreSQL – Flexible Server

## Configuración utilizada:
- Nombre del servidor: `marketplace-universitario`
- Endpoint: `marketplace-universitario.postgres.database.azure.com`
- Ubicación: Chile Central
- Motor: PostgreSQL 17.6
- Usuario administrador:
  postgres@marketplace-universitario
- SSL: Requerido (obligatorio para conectar)
- Firewall: Se agregó la IP del cliente

// Se puede ver todo en Azure Portal → Información general.


# ================================
# 📦 3. Base de Datos: “marketplace”
# ================================

## Base de datos principal del proyecto:
- Nombre: `marketplace`

## Tablas principales:
- productos
- usuarios
- (cualquier tabla agregada por el proyecto)

## Ubicación en pgAdmin:
Servers  
 └── azure  
      └── Databases  
           └── marketplace  
                └── Schemas  
                     └── public  
                          └── Tables

// Desde ahí se pueden ver, editar y consultar los datos.


# ======================================
# 🔒 4. Configuración de Seguridad Azure
# ======================================

## Azure PostgreSQL Flexible Server requiere:

1. Autenticación con usuario tipo:
postgres@marketplace-universitario 
ó
postgres


2. SSL obligatorio  
El backend DEBE conectarse usando SSL.

3. Firewall configurado:
- Se debe agregar la IP del cliente.
- Si cambia la IP, hay que volver a agregarla.

// Esto evita conexiones no autorizadas.


# ======================================
# 🔌 5. Conexión del Backend a Azure
# ======================================

## Ubicación:
`backend/src/db/pool.ts`

## Código del pool oficial:

```ts
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
host: "marketplace-universitario.postgres.database.azure.com",
user: "postgres@marketplace-universitario",
password: "TU_PASSWORD",
database: "marketplace",
port: 5432,
ssl: {
 rejectUnauthorized: false
},
});

Explicación:

// host → Servidor en la nube
// user → Usuario administrador de Azure
// database → Base de datos real del Marketplace
// ssl → Azure obliga a usar SSL
// rejectUnauthorized:false → Necesario porque Azure usa certificados automáticos

============================================================
🔍 6. Test de conexión (sin iniciar el backend completo)
============================================================
Archivo temporal: src/db/test-db.ts

import { pool } from "./pool";

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error conectando a Azure:", err);
  } else {
    console.log("🔥 Conexión exitosa a Azure:", res.rows);
  }
  pool.end();
});

npx ts-node src/db/test-db.ts
debería salir
🔥 Conexión exitosa a Azure

=
📡 7. Flujo de Datos: CRUD desde la nube
========================================
GET – Obtener productos

Ruta:

GET /api/productos


El backend responde:

{
  "success": true,
  "data": [...],
  "pagination": {...}
}


✔ Home obtiene productos desde Azure
✔ Sin datos locales hardcodeados

POST – Crear producto
POST /api/productos
Authorization: Bearer <token>


Internamente ejecuta:

INSERT INTO productos (...)


✔ Guarda directamente en Azure
✔ MisProductos y Home lo verán de inmediato

GET – Mis Productos

Requiere token:

GET /api/productos/mis-productos


Devuelve los productos ligados al user_id.

// Esto permite que cada usuario vea sus propias publicaciones.

====================================================
🧪 8. Cómo ver datos directamente en Azure (3 métodos)
====================================================
MÉTODO 1 — pgAdmin (recomendado)

View/Edit Data → All Rows

Ejecutar queries

Ver tablas y estructura

MÉTODO 2 — VS Code

Instalar extensión:

PostgreSQL (Microsoft)


Conectar con:
host, user, password, database, SSL required

MÉTODO 3 — Azure Portal

En algunos planes aparece “Query Editor (preview)”

Permite ejecutar consultas directamente en el navegador

=============================
🚀 9. Resultado Final del Setup
=============================

✔ Backend conectado 100% a Azure
✔ Todas las operaciones CRUD se guardan en la nube
✔ Home carga productos desde Azure
✔ Mis Productos funciona por user_id
✔ No se utiliza base local
✔ Datos administrables desde pgAdmin o VS Code

// El proyecto queda funcionando como un Marketplace real,
// con una base de datos cloud escalable y segura.