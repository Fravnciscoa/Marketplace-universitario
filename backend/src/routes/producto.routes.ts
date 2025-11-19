import { Router } from 'express';
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  getProductosAdmin
} from '../controllers/producto.controller';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware';

const router = Router();

// 🔹 RUTAS ADMIN (siempre antes que '/:id')
router.get('/admin', verificarToken, verificarAdmin, getProductosAdmin);

// Ver detalle de un producto como admin
router.get('/admin/:id', verificarToken, verificarAdmin, getProductoById);

// Editar producto como admin
router.put('/admin/:id', verificarToken, verificarAdmin, updateProducto);

// Eliminar producto como admin
router.delete('/admin/:id', verificarToken, verificarAdmin, deleteProducto);

// 🔹 RUTAS PÚBLICAS / USUARIO NORMAL
router.get('/', getProductos);
router.get('/:id', getProductoById);

// 🔹 RUTAS PROTEGIDAS (usuario autenticado)
router.post('/', verificarToken, createProducto);
router.put('/:id', verificarToken, updateProducto);
router.delete('/:id', verificarToken, deleteProducto);

export default router;
