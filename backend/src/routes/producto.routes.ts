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

// Rutas públicas (sin autenticación)
router.get('/', getProductos);
router.get('/:id', getProductoById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, createProducto);
router.put('/:id', verifyToken, updateProducto);
router.delete('/:id', verifyToken, deleteProducto);

export default router;
