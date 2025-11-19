--schema.sql
-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  rol VARCHAR(20) NOT NULL DEFAULT 'user';
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
CREATE TABLE IF NOT EXISTS productos (
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
CREATE TABLE IF NOT EXISTS reportes (
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
-- 💬 TABLAS DE CHAT (NUEVAS)
-- ============================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
  id SERIAL PRIMARY KEY,
  usuario1_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario2_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Restricción: no permitir conversación de un usuario consigo mismo
  CONSTRAINT check_usuarios_diferentes CHECK (usuario1_id != usuario2_id),
  -- Índice único para evitar conversaciones duplicadas
  CONSTRAINT unique_conversacion UNIQUE (usuario1_id, usuario2_id, producto_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id SERIAL PRIMARY KEY,
  conversacion_id INTEGER NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES OPTIMIZADOS
-- ============================================

-- Índice para consultas rápidas
CREATE INDEX idx_reportes_producto_id ON reportes(producto_id);
CREATE INDEX idx_reportes_estado ON reportes(estado);


-- Índices para mejor rendimiento
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_producto_id ON pedido_items(producto_id);
-- Índices de productos
CREATE INDEX IF NOT EXISTS idx_productos_user_id ON productos(user_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_campus ON productos(campus);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_created_at_desc ON productos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_campus ON productos(categoria, campus);

-- Índices de reportes
CREATE INDEX IF NOT EXISTS idx_reportes_producto_id ON reportes(producto_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

-- Índices de conversaciones (OPTIMIZACIÓN CRÍTICA)
CREATE INDEX IF NOT EXISTS idx_conversaciones_usuario1 ON conversaciones(usuario1_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_usuario2 ON conversaciones(usuario2_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_producto ON conversaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_updated_at ON conversaciones(updated_at DESC);

-- Índices de mensajes (OPTIMIZACIÓN CRÍTICA)
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON mensajes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido) WHERE leido = FALSE;

-- Índice compuesto para consultas de mensajes no leídos por usuario
CREATE INDEX IF NOT EXISTS idx_mensajes_no_leidos_usuario 
  ON mensajes(conversacion_id, remitente_id, leido) 
  WHERE leido = FALSE;
