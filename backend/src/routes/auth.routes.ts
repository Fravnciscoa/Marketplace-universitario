import { Router } from 'express';
import { pool } from '../db/pool';  // 🔥 Importa el pool correcto

const router = Router();

// GET todos los productos
router.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST crear producto
router.post('/api/productos', async (req, res) => {
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (titulo, precio, imagen, descripcion, categoria, campus) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, precio, imagen, descripcion, categoria, campus]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT actualizar producto
router.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, precio, imagen, descripcion, categoria, campus } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET titulo=$1, precio=$2, imagen=$3, descripcion=$4, categoria=$5, campus=$6 WHERE id=$7 RETURNING *',
      [titulo, precio, imagen, descripcion, categoria, campus, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE eliminar producto
router.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
