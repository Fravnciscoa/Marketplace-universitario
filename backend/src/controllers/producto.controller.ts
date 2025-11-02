import { Request, Response } from 'express';
import { pool } from '../db/pool';

// GET todos los productos
export const getProductos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// GET producto por ID
export const getProductoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
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

// POST crear producto
export const createProducto = async (req: Request, res: Response) => {
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;
  const user_id = (req as any).user?.id;
  try {
    const result = await pool.query(
      'INSERT INTO productos (titulo, precio, imagen, descripcion, categoria, campus, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [titulo, precio, imagen, descripcion, categoria, campus, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT actualizar producto
export const updateProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;
  const user_id = (req as any).user?.id;
  try {
    const checkResult = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto' });
    }
    const result = await pool.query(
      'UPDATE productos SET titulo=$1, precio=$2, imagen=$3, descripcion=$4, categoria=$5, campus=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [titulo, precio, imagen, descripcion, categoria, campus, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE eliminar producto
export const deleteProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = (req as any).user?.id;
  try {
    const checkResult = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
    }
    await pool.query('DELETE FROM productos WHERE id=$1', [id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
