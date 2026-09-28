-- Sistema de créditos: saldo por usuario y créditos disponibles para reclamar.
-- Ejecutar en la base de datos despues de crear las tablas "usuarios" y "productos".

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS creditos NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Créditos otorgados a un usuario (bono de bienvenida, promociones, referidos, etc.)
-- que aun no han sido reclamados y sumados a su saldo.
CREATE TABLE IF NOT EXISTS creditos_disponibles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  motivo VARCHAR(255) NOT NULL,
  reclamado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_reclamo TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creditos_disponibles_pendientes
  ON creditos_disponibles (user_id)
  WHERE reclamado = FALSE;
