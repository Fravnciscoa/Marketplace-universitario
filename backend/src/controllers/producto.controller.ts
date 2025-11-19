import { Request, Response } from 'express';
import { pool } from '../db/pool';

// GET todos los productos CON PAGINACIÓN Y FILTROS (EF 4)
export const getProductos = async (req: Request, res: Response) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Filtros opcionales
    const campus = req.query.campus as string;
    const precioMin = req.query.precioMin ? parseInt(req.query.precioMin as string) : null;
    const precioMax = req.query.precioMax ? parseInt(req.query.precioMax as string) : null;
    
    let categoria = req.query.categoria
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/,+$/, '');

    if (categoria && categoria.includes(',')) {
      categoria = categoria.split(',')[0]; // tomar la primera
    }

    // Query optimizado (SELECT específico + JOIN con usuarios)
    let query = `
      SELECT 
        p.id, 
        p.titulo, 
        p.precio, 
        p.imagen, 
        p.descripcion, 
        p.categoria, 
        p.campus,
        p.user_id,
        p.created_at,
        u.nombre as vendedor_nombre
      FROM productos p
      LEFT JOIN usuarios u ON p.user_id = u.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramIndex = 1;

    // Aplicar filtros dinámicos
    if (categoria) {
      query += ` AND p.categoria = $${paramIndex}`;
      values.push(categoria);
      paramIndex++;
    }

    if (campus) {
      query += ` AND p.campus = $${paramIndex}`;
      values.push(campus);
      paramIndex++;
    }

    if (precioMin !== null) {
      query += ` AND p.precio >= $${paramIndex}`;
      values.push(precioMin);
      paramIndex++;
    }

    if (precioMax !== null) {
      query += ` AND p.precio <= $${paramIndex}`;
      values.push(precioMax);
      paramIndex++;
    }

    // Ordenar por más reciente
    query += ` ORDER BY p.created_at DESC`;

    // Aplicar paginación
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    // Ejecutar query principal
    const result = await pool.query(query, values);

    // Contar total de registros (para calcular páginas)
    let countQuery = 'SELECT COUNT(*) FROM productos WHERE 1=1';
    const countValues: any[] = [];
    let countIndex = 1;

    if (categoria) {
      countQuery += ` AND categoria = $${countIndex}`;
      countValues.push(categoria);
      countIndex++;
    }

    if (campus) {
      countQuery += ` AND campus = $${countIndex}`;
      countValues.push(campus);
      countIndex++;
    }

    if (precioMin !== null) {
      countQuery += ` AND precio >= $${countIndex}`;
      countValues.push(precioMin);
      countIndex++;
    }

    if (precioMax !== null) {
      countQuery += ` AND precio <= $${countIndex}`;
      countValues.push(precioMax);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Respuesta con metadata de paginación
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// GET producto por ID OPTIMIZADO (SELECT específico + JOIN)
export const getProductoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        p.id, 
        p.titulo, 
        p.precio, 
        p.imagen, 
        p.descripcion, 
        p.categoria, 
        p.campus,
        p.user_id,
        p.created_at,
        u.nombre as vendedor_nombre,
        u.correo as vendedor_correo
      FROM productos p
      LEFT JOIN usuarios u ON p.user_id = u.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// POST crear producto (SELECT específico en RETURNING)
export const createProducto = async (req: Request, res: Response) => {
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;
  const user_id = (req as any).user?.id;
  try {
    const result = await pool.query(
      `INSERT INTO productos (titulo, precio, imagen, descripcion, categoria, campus, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, titulo, precio, imagen, descripcion, categoria, campus, user_id, created_at`,
      [titulo, precio, imagen, descripcion, categoria, campus, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT actualizar producto (SELECT específico optimizado)
export const updateProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;

  const user = (req as any).user; // viene del middleware verificarToken
  const user_id = user?.id;
  const rol = user?.rol;

  try {
    // Verificar ownership (SELECT solo lo necesario)
    const checkResult = await pool.query(
      'SELECT user_id FROM productos WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const ownerId = checkResult.rows[0].user_id;
    const esDueno = ownerId === user_id;
    const esAdmin = rol === 'admin';

    // ✅ Ahora permitimos dueño O admin
    if (!esDueno && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto' });
    }

    const result = await pool.query(
      `UPDATE productos 
       SET titulo=$1, precio=$2, imagen=$3, descripcion=$4, categoria=$5, campus=$6, updated_at=CURRENT_TIMESTAMP 
       WHERE id=$7 
       RETURNING id, titulo, precio, imagen, descripcion, categoria, campus, updated_at`,
      [titulo, precio, imagen, descripcion, categoria, campus, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE eliminar producto (SELECT optimizado)
// DELETE eliminar producto (SELECT optimizado)
export const deleteProducto = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = (req as any).user; // viene del middleware verificarToken
  const user_id = user?.id;
  const rol = user?.rol;

  try {
    // Verificar ownership (SELECT solo user_id)
    const checkResult = await pool.query(
      'SELECT user_id FROM productos WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const ownerId = checkResult.rows[0].user_id;
    const esDueno = ownerId === user_id;
    const esAdmin = rol === 'admin';

    // ✅ Permitimos dueño O admin
    if (!esDueno && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
    }

    await pool.query('DELETE FROM productos WHERE id=$1', [id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// 🆕 GET todos los productos para ADMIN (sin paginación, con vendedor)
// 🆕 GET productos para ADMIN con filtros + paginación
export const getProductosAdmin = async (req: Request, res: Response) => {
  try {
    console.log("🔹 Entró a getProductosAdmin");

    // Parámetros de filtros
    const categoria = req.query.categoria as string;
    const campus = req.query.campus as string;

    // Parámetros de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT
        p.id,
        p.titulo,
        p.precio,
        p.imagen,
        p.descripcion,
        p.categoria,
        p.campus,
        p.user_id,
        p.created_at,
        u.nombre AS vendedor_nombre,
        u.correo AS vendedor_correo
      FROM productos p
      LEFT JOIN usuarios u ON p.user_id = u.id
      WHERE 1 = 1
    `;

    const values: any[] = [];
    let index = 1;

    // Aplicar filtros dinámicos
    if (categoria) {
      query += ` AND p.categoria = $${index}`;
      values.push(categoria);
      index++;
    }

    if (campus) {
      query += ` AND p.campus = $${index}`;
      values.push(campus);
      index++;
    }

    // Ordenar por fecha creación DESC
    query += ` ORDER BY p.created_at DESC`;

    // Agregar paginación
    query += ` LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);

    // Ejecutar consulta
    const result = await pool.query(query, values);

    // ----- Obtener total de productos (para paginación) -----
    let countQuery = `SELECT COUNT(*) FROM productos WHERE 1 = 1`;
    const countValues: any[] = [];
    let cIndex = 1;

    if (categoria) {
      countQuery += ` AND categoria = $${cIndex}`;
      countValues.push(categoria);
      cIndex++;
    }

    if (campus) {
      countQuery += ` AND campus = $${cIndex}`;
      countValues.push(campus);
      cIndex++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error al obtener productos para admin:", error);
    return res.status(500).json({ error: "Error al obtener productos para admin" });
  }
};


