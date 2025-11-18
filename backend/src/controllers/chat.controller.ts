import { Request, Response } from 'express';
import { pool } from '../db/pool';

// Obtener todas las conversaciones del usuario autenticado
export const obtenerConversaciones = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const result = await pool.query(
      `SELECT 
        c.id,
        c.usuario1_id,
        c.usuario2_id,
        c.producto_id,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.usuario1_id = $1 THEN u2.nombre
          ELSE u1.nombre
        END as otro_usuario_nombre,
        CASE 
          WHEN c.usuario1_id = $1 THEN u2.usuario
          ELSE u1.usuario
        END as otro_usuario_usuario,
        (SELECT mensaje FROM mensajes WHERE conversacion_id = c.id ORDER BY created_at DESC LIMIT 1) as ultimo_mensaje,
        (SELECT COUNT(*) FROM mensajes WHERE conversacion_id = c.id AND remitente_id != $1 AND leido = false) as mensajes_no_leidos
      FROM conversaciones c
      LEFT JOIN usuarios u1 ON c.usuario1_id = u1.id
      LEFT JOIN usuarios u2 ON c.usuario2_id = u2.id
      WHERE c.usuario1_id = $1 OR c.usuario2_id = $1
      ORDER BY c.updated_at DESC`,
      [usuarioId]
    );

    res.json({
      success: true,
      conversaciones: result.rows
    });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener conversaciones'
    });
  }
};

// Obtener o crear una conversación
export const obtenerOCrearConversacion = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const { otroUsuarioId, productoId } = req.body;

    // Verificar que no sea el mismo usuario
    if (parseInt(otroUsuarioId) === usuarioId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes crear una conversación contigo mismo'
      });
    }

    // Buscar conversación existente
    const conversacionExistente = await pool.query(
      `SELECT * FROM conversaciones 
       WHERE ((usuario1_id = $1 AND usuario2_id = $2) 
          OR (usuario1_id = $2 AND usuario2_id = $1))
       AND ($3::INTEGER IS NULL OR producto_id = $3)
       LIMIT 1`,
      [usuarioId, otroUsuarioId, productoId || null]
    );

    if (conversacionExistente.rows.length > 0) {
      return res.json({
        success: true,
        conversacion: conversacionExistente.rows[0],
        nueva: false
      });
    }

    // Crear nueva conversación
    const nuevaConversacion = await pool.query(
      `INSERT INTO conversaciones (usuario1_id, usuario2_id, producto_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuarioId, otroUsuarioId, productoId || null]
    );

    res.json({
      success: true,
      conversacion: nuevaConversacion.rows[0],
      nueva: true
    });
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear conversación'
    });
  }
};

// Obtener mensajes de una conversación
export const obtenerMensajes = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const conversacionId = req.params.conversacionId;
    const { limit = 50, offset = 0 } = req.query;

    // Verificar que el usuario sea parte de la conversación
    const conversacion = await pool.query(
      `SELECT * FROM conversaciones 
       WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)`,
      [conversacionId, usuarioId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a esta conversación'
      });
    }

    // Marcar mensajes como leídos
    await pool.query(
      `UPDATE mensajes 
       SET leido = TRUE 
       WHERE conversacion_id = $1 
       AND remitente_id != $2 
       AND leido = FALSE`,
      [conversacionId, usuarioId]
    );

    // Obtener mensajes
    const mensajes = await pool.query(
      `SELECT 
        m.id,
        m.mensaje,
        m.leido,
        m.created_at,
        m.remitente_id,
        u.nombre as remitente_nombre
      FROM mensajes m
      JOIN usuarios u ON m.remitente_id = u.id
      WHERE m.conversacion_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3`,
      [conversacionId, limit, offset]
    );

    res.json({
      success: true,
      mensajes: mensajes.rows.reverse()
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensajes'
    });
  }
};

// Enviar mensaje
export const enviarMensaje = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const conversacionId = req.params.conversacionId;
    const { mensaje } = req.body;

    // Verificar que el usuario sea parte de la conversación
    const conversacion = await pool.query(
      `SELECT * FROM conversaciones 
       WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)`,
      [conversacionId, usuarioId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a esta conversación'
      });
    }

    // Insertar mensaje
    const nuevoMensaje = await pool.query(
      `INSERT INTO mensajes (conversacion_id, remitente_id, mensaje)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversacionId, usuarioId, mensaje]
    );

    // Obtener datos del remitente
    const mensajeCompleto = await pool.query(
      `SELECT 
        m.id,
        m.mensaje,
        m.leido,
        m.created_at,
        m.remitente_id,
        u.nombre as remitente_nombre
      FROM mensajes m
      JOIN usuarios u ON m.remitente_id = u.id
      WHERE m.id = $1`,
      [nuevoMensaje.rows[0].id]
    );

    res.json({
      success: true,
      mensaje: mensajeCompleto.rows[0]
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar mensaje'
    });
  }
};
