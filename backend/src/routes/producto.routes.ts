import { Router } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/producto.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Rutas públicas
router.get('/api/productos', getProductos);
router.get('/api/productos/:id', getProductoById);

// Rutas protegidas
router.post('/api/productos', verifyToken, createProducto);
router.put('/api/productos/:id', verifyToken, updateProducto);
router.delete('/api/productos/:id', verifyToken, deleteProducto);

export default router;
