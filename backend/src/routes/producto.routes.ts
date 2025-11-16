import { Router } from 'express';
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  uploadImagen  // ← NUEVO
} from '../controllers/producto.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { upload } from '../config/cloudinary';  // ← NUEVO

const router = Router();

// Rutas públicas
router.get('/', getProductos);
router.get('/:id', getProductoById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, createProducto);
router.put('/:id', verifyToken, updateProducto);
router.delete('/:id', verifyToken, deleteProducto);

// NUEVA RUTA: Upload de imagen (EF5)
router.post('/upload/imagen', verifyToken, upload.single('imagen'), uploadImagen);

export default router;
