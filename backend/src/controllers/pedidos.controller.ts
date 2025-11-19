import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const crearPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();

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

    await client.query('BEGIN');

    try {
      for (const item of items) {
        // Verificar existencia del producto
        const productoResult = await client.query(
          `SELECT id, titulo, estado, precio, vendedor_id
           FROM productos 
           WHERE id = $1`,
          [item.producto_id]
        );

        if (productoResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: `Producto con ID ${item.producto_id} no encontrado`
          });
        }

        const producto = productoResult.rows[0];

        if (producto.vendedor_id === usuario_id) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `No puedes comprar tu propio producto: ${producto.titulo}`
          });
        }

        if (producto.estado === 'vendido' || producto.estado === 'inactivo') {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `El producto "${producto.titulo}" ya fue vendido o está inactivo`
          });
        }

        // ======= FLUJO AUTOMÁTICO DE RESERVA =======
        // Buscar reserva confirmada
        let reservaResult = await client.query(
          `SELECT id FROM reservas WHERE producto_id = $1 AND comprador_id = $2 AND estado = 'confirmada'`,
          [item.producto_id, usuario_id]
        );

        // Si no la hay, crearla automáticamente y confirmarla
        if (reservaResult.rows.length === 0) {
          await client.query(
            `INSERT INTO reservas (producto_id, comprador_id, vendedor_id, estado)
            VALUES ($1, $2, $3, 'confirmada')`,
            [item.producto_id, usuario_id, producto.vendedor_id]
          );

          // Opcionalmente: marcar estado producto como reservado aquí si quieres, pero como al final se marca 'vendido', puede omitirse
        }

        // Chequear que el precio coincida
        if (Math.abs(item.precio - producto.precio) > 0.01) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `El precio del producto "${producto.titulo}" ha cambiado. Precio actual: $${producto.precio}`
          });
        }
      }

      // ===== CREAR EL PEDIDO =====
      const pedidoResult = await client.query(
        `INSERT INTO pedidos (usuario_id, total, metodo_pago, direccion_entrega, notas, estado)
         VALUES ($1, $2, $3, $4, $5, 'pendiente')
         RETURNING id, usuario_id, total, estado, metodo_pago, direccion_entrega, created_at`,
        [usuario_id, total, metodo_pago, direccion_entrega, notas]
      );

      const pedido = pedidoResult.rows[0];

      // ===== INSERTAR ITEMS Y ACTUALIZAR PRODUCTOS =====
      for (const item of items) {
        const subtotal = item.precio * item.cantidad;

        await client.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedido.id, item.producto_id, item.cantidad, item.precio, subtotal]
        );

        // Marcar producto como Vendido
        await client.query(
          `UPDATE productos
             SET estado = 'vendido', updated_at = NOW()
           WHERE id = $1`,
          [item.producto_id]
        );

        // Completar la reserva
        await client.query(
          `UPDATE reservas
             SET estado = 'completada', updated_at = NOW()
           WHERE producto_id = $1 AND comprador_id = $2 AND estado = 'confirmada'`,
          [item.producto_id, usuario_id]
        );
      }

      await client.query('COMMIT');

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
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el pedido',
      details: error.message
    });
  } finally {
    client.release();
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
        p.updated_at,
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

    // Obtener items del pedido con información de productos
    const itemsResult = await pool.query(
      `SELECT 
        pi.*,
        p.titulo as producto_titulo,
        p.imagen_url as producto_imagen,
        p.estado as producto_estado
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

// PUT /api/pedidos/:id/cancelar - Cancelar un pedido
export const cancelarPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;

    await client.query('BEGIN');

    // Verificar que el pedido existe y pertenece al usuario
    const pedidoResult = await client.query(
      `SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2`,
      [id, usuario_id]
    );

    if (pedidoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    const pedido = pedidoResult.rows[0];

    // Solo se pueden cancelar pedidos pendientes o confirmados
    if (!['pendiente', 'confirmado'].includes(pedido.estado)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `No se puede cancelar un pedido en estado: ${pedido.estado}`
      });
    }

    // Obtener items del pedido
    const itemsResult = await client.query(
      `SELECT * FROM pedido_items WHERE pedido_id = $1`,
      [id]
    );

    // Liberar productos (volver a disponible)
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE productos 
         SET estado = 'disponible',
             updated_at = NOW()
         WHERE id = $1`,
        [item.producto_id]
      );
    }

    // Actualizar estado del pedido
    await client.query(
      `UPDATE pedidos 
       SET estado = 'cancelado', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pedido cancelado exitosamente'
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar el pedido',
      details: error.message
    });
  } finally {
    client.release();
  }
};

// PUT /api/pedidos/:id/confirmar - Confirmar pedido (solo vendedor/admin)
export const confirmarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;

    // Obtener pedido
    const pedidoResult = await pool.query(
      `SELECT p.*, pi.producto_id
       FROM pedidos p
       LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    const pedido = pedidoResult.rows[0];

    // Verificar que el usuario es el vendedor del producto
    const productoResult = await pool.query(
      `SELECT vendedor_id FROM productos WHERE id = $1`,
      [pedido.producto_id]
    );

    if (productoResult.rows[0]?.vendedor_id !== usuario_id) {
      return res.status(403).json({
        success: false,
        error: 'Solo el vendedor puede confirmar el pedido'
      });
    }

    // Actualizar estado
    await pool.query(
      `UPDATE pedidos 
       SET estado = 'confirmado', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Pedido confirmado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al confirmar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al confirmar el pedido',
      details: error.message
    });
  }
};
