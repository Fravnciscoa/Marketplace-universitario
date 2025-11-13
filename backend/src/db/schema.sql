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

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_productos_user_id ON productos(user_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_campus ON productos(campus);
