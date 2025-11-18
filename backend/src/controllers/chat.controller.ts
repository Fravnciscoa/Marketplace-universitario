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
    const { conversacionId } = req.params;
    const { mensaje } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede estar vacío'
      });
    }

    // Verificar que el usuario participa en la conversación
    const conversacion = await pool.query(
      'SELECT * FROM conversaciones WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)',
      [conversacionId, usuarioId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para enviar mensajes en esta conversación'
      });
    }

    // Insertar mensaje
    const result = await pool.query(
      `INSERT INTO mensajes (conversacion_id, remitente_id, mensaje, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [conversacionId, usuarioId, mensaje]
    );

    // Actualizar timestamp de la conversación
    await pool.query(
      'UPDATE conversaciones SET updated_at = NOW() WHERE id = $1',
      [conversacionId]
    );

    // Obtener datos del remitente
    const usuario = await pool.query(
      'SELECT nombre FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    const mensajeCreado = {
      ...result.rows[0],
      remitente_nombre: usuario.rows[0].nombre
    };

    // 🔥 EMITIR EVENTO WEBSOCKET
    const io = (global as any).io;
    if (io) {
      io.to(`conversacion_${conversacionId}`).emit('nuevo_mensaje', mensajeCreado);
      console.log(`📨 Mensaje emitido via WebSocket a conversación ${conversacionId}`);
    }

    res.status(201).json({
      success: true,
      mensaje: mensajeCreado
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar mensaje'
    });
  }
};

export const obtenerMensajesPaginados = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const { conversacionId } = req.params;
    const { pagina = '1', limite = '50' } = req.query;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario participa en la conversación
    const conversacion = await pool.query(
      'SELECT * FROM conversaciones WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)',
      [conversacionId, usuarioId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver esta conversación'
      });
    }

    // Calcular offset
    const paginaNum = parseInt(pagina as string);
    const limiteNum = parseInt(limite as string);
    const offset = (paginaNum - 1) * limiteNum;

    // Obtener total de mensajes
    const totalResult = await pool.query(
      'SELECT COUNT(*) FROM mensajes WHERE conversacion_id = $1',
      [conversacionId]
    );
    const total = parseInt(totalResult.rows[0].count);

    // Obtener mensajes con paginación
    const result = await pool.query(
      `SELECT 
        m.id,
        m.mensaje,
        m.leido,
        m.created_at,
        m.remitente_id,
        u.nombre as remitente_nombre
      FROM mensajes m
      LEFT JOIN usuarios u ON m.remitente_id = u.id
      WHERE m.conversacion_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3`,
      [conversacionId, limiteNum, offset]
    );

    res.json({
      success: true,
      mensajes: result.rows.reverse(),
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total: total,
        totalPaginas: Math.ceil(total / limiteNum),
        tieneSiguiente: paginaNum < Math.ceil(total / limiteNum),
        tieneAnterior: paginaNum > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensajes'
    });
  }
};


// Buscar conversaciones
export const buscarConversaciones = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const { q } = req.query;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!q || (q as string).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar un término de búsqueda'
      });
    }

    const searchTerm = `%${q}%`;

    const result = await pool.query(
      `SELECT DISTINCT
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
        (SELECT mensaje FROM mensajes WHERE conversacion_id = c.id ORDER BY created_at DESC LIMIT 1) as ultimo_mensaje
      FROM conversaciones c
      LEFT JOIN usuarios u1 ON c.usuario1_id = u1.id
      LEFT JOIN usuarios u2 ON c.usuario2_id = u2.id
      LEFT JOIN mensajes m ON c.id = m.conversacion_id
      WHERE (c.usuario1_id = $1 OR c.usuario2_id = $1)
      AND (
        u1.nombre ILIKE $2 OR
        u2.nombre ILIKE $2 OR
        u1.usuario ILIKE $2 OR
        u2.usuario ILIKE $2 OR
        m.mensaje ILIKE $2
      )
      ORDER BY c.updated_at DESC`,
      [usuarioId, searchTerm]
    );

    res.json({
      success: true,
      resultados: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al buscar conversaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar conversaciones'
    });
  }
};

// Eliminar conversación
export const eliminarConversacion = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const { conversacionId } = req.params;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario participa en la conversación
    const conversacion = await pool.query(
      'SELECT * FROM conversaciones WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)',
      [conversacionId, usuarioId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta conversación'
      });
    }

    // Eliminar conversación (CASCADE eliminará los mensajes)
    await pool.query(
      'DELETE FROM conversaciones WHERE id = $1',
      [conversacionId]
    );

    res.json({
      success: true,
      mensaje: 'Conversación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar conversación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar conversación'
    });
  }
};

