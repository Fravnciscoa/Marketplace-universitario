import { Request, Response } from 'express';
import { pool } from '../db/pool';

// POST /api/reportes - Crear reporte
export const crearReporte = async (req: Request, res: Response) => {
  try {
    const { producto_id, razon, descripcion } = req.body;
    const usuario_id = req.user?.id;

    // Validar que el usuario está autenticado
    if (!usuario_id) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Validar campos requeridos
    if (!producto_id || !razon) {
      return res.status(400).json({
        success: false,
        error: 'producto_id y razon son requeridos'
      });
    }

    // Verificar que el producto existe
    const productoExiste = await pool.query(
      'SELECT id FROM productos WHERE id = $1',
      [producto_id]
    );

    if (productoExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Insertar reporte
    const result = await pool.query(
      `INSERT INTO reportes (producto_id, usuario_id, razon, descripcion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, producto_id, razon, descripcion, estado, created_at`,
      [producto_id, usuario_id, razon, descripcion]
    );

    res.status(201).json({
      success: true,
      message: 'Reporte enviado correctamente. Será revisado por un administrador.',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el reporte',
      details: error.message
    });
  }
};

// GET /api/reportes - Obtener todos los reportes (solo admin)
export const obtenerReportes = async (req: Request, res: Response) => {
  try {
    const estado = req.query.estado as string;

    let query = `
      SELECT 
        r.id,
        r.producto_id,
        r.razon,
        r.descripcion,
        r.estado,
        r.created_at,
        p.titulo as producto_titulo,
        p.precio as producto_precio,
        u.nombre as reportado_por,
        u.correo as reportado_por_correo
      FROM reportes r
      LEFT JOIN productos p ON r.producto_id = p.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
    `;

    const values: any[] = [];
    
    if (estado) {
      query += ' WHERE r.estado = $1';
      values.push(estado);
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reportes',
      details: error.message
    });
  }
};

// PUT /api/reportes/:id - Actualizar estado de reporte (solo admin)
export const actualizarEstadoReporte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['pendiente', 'revisado', 'resuelto'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido. Valores permitidos: pendiente, revisado, resuelto'
      });
    }

    const result = await pool.query(
      'UPDATE reportes SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado del reporte actualizado',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar reporte',
      details: error.message
    });
  }
};

// DELETE /api/reportes/:id - Eliminar reporte (solo admin)
export const eliminarReporte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM reportes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Reporte eliminado correctamente',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar reporte',
      details: error.message
    });
  }
};
