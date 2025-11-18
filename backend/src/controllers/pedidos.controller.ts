import { Request, Response } from 'express';
import { pool } from '../db/pool';

// POST /api/pedidos - Crear nuevo pedido (checkout)
export const crearPedido = async (req: Request, res: Response) => {
  try {
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const { items, total, metodo_pago, direccion_entrega, notas } = req.body;

    // Validar datos requeridos
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El pedido debe tener al menos un producto'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Total inválido'
      });
    }

    // Iniciar transacción
    await pool.query('BEGIN');

    try {
      // 1. Crear el pedido
      const pedidoResult = await pool.query(
        `INSERT INTO pedidos (usuario_id, total, metodo_pago, direccion_entrega, notas, estado)
         VALUES ($1, $2, $3, $4, $5, 'pendiente')
         RETURNING id, usuario_id, total, estado, metodo_pago, direccion_entrega, created_at`,
        [usuario_id, total, metodo_pago, direccion_entrega, notas]
      );

      const pedido = pedidoResult.rows[0];

      // 2. Insertar items del pedido
      for (const item of items) {
        const subtotal = item.precio * item.cantidad;

        await pool.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedido.id, item.producto_id, item.cantidad, item.precio, subtotal]
        );
      }

      // Confirmar transacción
      await pool.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: {
          pedido_id: pedido.id,
          total: pedido.total,
          estado: pedido.estado,
          fecha: pedido.created_at
        }
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el pedido',
      details: error.message
    });
  }
};

// GET /api/pedidos - Obtener pedidos del usuario autenticado
export const obtenerMisPedidos = async (req: Request, res: Response) => {
  try {
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.total,
        p.estado,
        p.metodo_pago,
        p.direccion_entrega,
        p.notas,
        p.created_at,
        COUNT(pi.id) as cantidad_items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      WHERE p.usuario_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [usuario_id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pedidos',
      details: error.message
    });
  }
};

// GET /api/pedidos/:id - Obtener detalle de un pedido
export const obtenerDetallePedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;

    // Obtener pedido
    const pedidoResult = await pool.query(
      `SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2`,
      [id, usuario_id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    const pedido = pedidoResult.rows[0];

    // Obtener items del pedido
    const itemsResult = await pool.query(
      `SELECT 
        pi.*,
        p.titulo as producto_titulo,
        p.imagen as producto_imagen
      FROM pedido_items pi
      LEFT JOIN productos p ON pi.producto_id = p.id
      WHERE pi.pedido_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...pedido,
        items: itemsResult.rows
      }
    });

  } catch (error: any) {
    console.error('Error al obtener detalle del pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener detalle del pedido',
      details: error.message
    });
  }
};
