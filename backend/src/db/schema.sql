-- ============================================
-- MARKETPLACE UNIVERSITARIO PUCV
-- Database Schema
-- Autor: [Tu nombre]
-- Fecha: 13 de Noviembre, 2025
-- ============================================

-- Tabla usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  rut VARCHAR(12),
  region VARCHAR(100),
  comuna VARCHAR(100),
  terminos_aceptados BOOLEAN DEFAULT FALSE
);

-- Tabla productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  precio INTEGER NOT NULL,
  imagen VARCHAR(500),
  descripcion TEXT,
  categoria VARCHAR(100),
  campus VARCHAR(100),
  user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes de publicaciones
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    razon VARCHAR(50) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, revisado, resuelto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA DE PEDIDOS
-- ============================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    total INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmado, enviado, completado, cancelado
    metodo_pago VARCHAR(50), -- efectivo, transferencia, tarjeta
    direccion_entrega TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA DE ITEMS DE PEDIDOS (detalle)
-- ============================================
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario INTEGER NOT NULL, -- Precio al momento de la compra
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Crear índices para búsquedas rápidas
CREATE INDEX idx_productos_user_id ON productos(user_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_campus ON productos(campus);

-- Índice para filtros de rango de precio
CREATE INDEX idx_productos_precio ON productos(precio);

-- Índice compuesto para ordenamiento por fecha (productos recientes primero)
CREATE INDEX idx_productos_created_at_desc ON productos(created_at DESC);

-- Índice compuesto para búsquedas combinadas (AVANZADO)
CREATE INDEX idx_productos_categoria_campus ON productos(categoria, campus);

-- Índice para consultas rápidas
CREATE INDEX idx_reportes_producto_id ON reportes(producto_id);
CREATE INDEX idx_reportes_estado ON reportes(estado);


-- Índices para mejor rendimiento
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_producto_id ON pedido_items(producto_id);