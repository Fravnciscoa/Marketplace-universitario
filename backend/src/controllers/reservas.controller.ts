import { Request, Response } from 'express';
import { pool } from '../db/pool';

// POST /api/reservas - Crear reserva (comprador)
export const crearReserva = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const comprador_id = req.user?.id;
    const { producto_id } = req.body;

    if (!comprador_id) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!producto_id) {
      return res.status(400).json({
        success: false,
        error: 'El producto_id es requerido'
      });
    }

    await client.query('BEGIN');

    // Verificar que el producto existe y está disponible
    const productoResult = await client.query(
      `SELECT id, titulo, estado, vendedor_id, precio 
       FROM productos 
       WHERE id = $1`,
      [producto_id]
    );

    if (productoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    const producto = productoResult.rows[0];

    // Verificar que no es el propio vendedor
    if (producto.vendedor_id === comprador_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'No puedes reservar tu propio producto'
      });
    }

    // Verificar estado del producto
    if (producto.estado !== 'disponible') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `El producto no está disponible (estado: ${producto.estado})`
      });
    }

    // Verificar si ya hay una reserva activa
    const reservaExistenteResult = await client.query(
      `SELECT id FROM reservas 
       WHERE producto_id = $1 
       AND comprador_id = $2 
       AND estado IN ('pendiente', 'confirmada')`,
      [producto_id, comprador_id]
    );

    if (reservaExistenteResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Ya tienes una reserva activa para este producto'
      });
    }

    // Crear la reserva
    const reservaResult = await client.query(
      `INSERT INTO reservas (producto_id, comprador_id, vendedor_id, estado)
       VALUES ($1, $2, $3, 'pendiente')
       RETURNING id, producto_id, comprador_id, vendedor_id, estado, created_at`,
      [producto_id, comprador_id, producto.vendedor_id]
    );

    // Actualizar estado del producto a 'reservado'
    await client.query(
      `UPDATE productos 
       SET estado = 'reservado', updated_at = NOW()
       WHERE id = $1`,
      [producto_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        reserva: reservaResult.rows[0],
        producto: {
          id: producto.id,
          titulo: producto.titulo,
          precio: producto.precio
        }
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la reserva',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// PUT /api/reservas/:id/aceptar - Aceptar reserva (vendedor)
export const aceptarReserva = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const vendedor_id = req.user?.id;

    await client.query('BEGIN');

    const reservaResult = await client.query(
      `SELECT r.*, p.titulo as producto_titulo
       FROM reservas r
       JOIN productos p ON r.producto_id = p.id
       WHERE r.id = $1`,
      [id]
    );

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const reserva = reservaResult.rows[0];

    if (reserva.vendedor_id !== vendedor_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para aceptar esta reserva'
      });
    }

    if (reserva.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `La reserva no está pendiente (estado: ${reserva.estado})`
      });
    }

    await client.query(
      `UPDATE reservas 
       SET estado = 'confirmada', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Reserva aceptada. El comprador puede proceder con la compra',
      data: {
        reserva_id: reserva.id,
        producto: reserva.producto_titulo
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al aceptar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aceptar la reserva',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// PUT /api/reservas/:id/rechazar - Rechazar reserva (vendedor)
export const rechazarReserva = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const vendedor_id = req.user?.id;

    await client.query('BEGIN');

    const reservaResult = await client.query(
      `SELECT * FROM reservas WHERE id = $1`,
      [id]
    );

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const reserva = reservaResult.rows[0];

    if (reserva.vendedor_id !== vendedor_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para rechazar esta reserva'
      });
    }

    if (reserva.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden rechazar reservas pendientes'
      });
    }

    await client.query(
      `UPDATE reservas 
       SET estado = 'rechazada', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Liberar el producto
    await client.query(
      `UPDATE productos 
       SET estado = 'disponible', updated_at = NOW()
       WHERE id = $1`,
      [reserva.producto_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Reserva rechazada. El producto está nuevamente disponible'
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al rechazar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar la reserva',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// GET /api/reservas/mis-reservas - Mis reservas como comprador
export const obtenerMisReservas = async (req: Request, res: Response) => {
  try {
    const comprador_id = req.user?.id;

    const result = await pool.query(
      `SELECT 
        r.*,
        p.titulo as producto_titulo,
        p.precio as producto_precio,
        p.imagen_url as producto_imagen,
        u.nombre as vendedor_nombre
      FROM reservas r
      JOIN productos p ON r.producto_id = p.id
      JOIN usuarios u ON r.vendedor_id = u.id
      WHERE r.comprador_id = $1
      ORDER BY r.created_at DESC`,
      [comprador_id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las reservas',
      details: error.message
    });
  }
};

// GET /api/reservas/pendientes - Reservas pendientes como vendedor
export const obtenerReservasPendientes = async (req: Request, res: Response) => {
  try {
    const vendedor_id = req.user?.id;

    const result = await pool.query(
      `SELECT 
        r.*,
        p.titulo as producto_titulo,
        p.precio as producto_precio,
        p.imagen_url as producto_imagen,
        u.nombre as comprador_nombre,
        u.email as comprador_email
      FROM reservas r
      JOIN productos p ON r.producto_id = p.id
      JOIN usuarios u ON r.comprador_id = u.id
      WHERE r.vendedor_id = $1 AND r.estado = 'pendiente'
      ORDER BY r.created_at DESC`,
      [vendedor_id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Error al obtener reservas pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las reservas',
      details: error.message
    });
  }
};

// DELETE /api/reservas/:id - Cancelar reserva (comprador)
export const cancelarReserva = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const comprador_id = req.user?.id;

    await client.query('BEGIN');

    const reservaResult = await client.query(
      `SELECT * FROM reservas WHERE id = $1 AND comprador_id = $2`,
      [id, comprador_id]
    );

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const reserva = reservaResult.rows[0];

    if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Solo puedes cancelar reservas pendientes o confirmadas'
      });
    }

    await client.query(
      `UPDATE reservas 
       SET estado = 'cancelada', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Liberar producto
    await client.query(
      `UPDATE productos 
       SET estado = 'disponible', updated_at = NOW()
       WHERE id = $1`,
      [reserva.producto_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar la reserva',
      details: error.message
    });
  } finally {
    client.release();
  }
};
