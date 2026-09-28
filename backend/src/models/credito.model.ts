import { pool } from '../db/pool';

export interface CreditoDisponible {
  id: number;
  user_id: number;
  monto: number;
  motivo: string;
  reclamado: boolean;
  fecha_reclamo: Date | null;
  created_at: Date;
}

export const BONO_BIENVENIDA = 1000;
export const MOTIVO_BONO_BIENVENIDA = 'Bono de bienvenida';

// Otorga un crédito reclamable a un usuario (no se suma al saldo hasta que lo reclame)
export const otorgarCreditoDisponible = async (
  userId: number,
  monto: number,
  motivo: string
) => {
  const result = await pool.query(
    `INSERT INTO creditos_disponibles (user_id, monto, motivo)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, monto, motivo]
  );
  return result.rows[0];
};

export const getSaldoCreditos = async (userId: number): Promise<number> => {
  const result = await pool.query(
    'SELECT creditos FROM usuarios WHERE id = $1',
    [userId]
  );
  return Number(result.rows[0]?.creditos ?? 0);
};

export const getCreditosPendientes = async (userId: number) => {
  const result = await pool.query(
    `SELECT * FROM creditos_disponibles
     WHERE user_id = $1 AND reclamado = FALSE
     ORDER BY created_at`,
    [userId]
  );
  return result.rows;
};

// Reclama todos los créditos pendientes de un usuario y los suma a su saldo.
// Devuelve null si no tenia créditos pendientes.
export const reclamarCreditosPendientes = async (userId: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pendientes = await client.query(
      `SELECT id, monto FROM creditos_disponibles
       WHERE user_id = $1 AND reclamado = FALSE
       FOR UPDATE`,
      [userId]
    );

    if (pendientes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const montoReclamado = pendientes.rows.reduce(
      (total, fila) => total + Number(fila.monto),
      0
    );
    const ids = pendientes.rows.map((fila) => fila.id);

    await client.query(
      `UPDATE creditos_disponibles
       SET reclamado = TRUE, fecha_reclamo = CURRENT_TIMESTAMP
       WHERE id = ANY($1::int[])`,
      [ids]
    );

    const usuarioActualizado = await client.query(
      `UPDATE usuarios
       SET creditos = creditos + $1
       WHERE id = $2
       RETURNING creditos`,
      [montoReclamado, userId]
    );

    await client.query('COMMIT');

    return {
      montoReclamado,
      saldo: Number(usuarioActualizado.rows[0].creditos),
      cantidadReclamada: pendientes.rows.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
