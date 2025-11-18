import { Router } from 'express';
import { 
  crearPedido, 
  obtenerMisPedidos, 
  obtenerDetallePedido 
} from '../controllers/pedidos.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Todas las rutas requieren autenticación
router.post('/', verifyToken, crearPedido);
router.get('/', verifyToken, obtenerMisPedidos);
router.get('/:id', verifyToken, obtenerDetallePedido);
router.post('/', verifyToken, crearPedido);
router.get('/', verifyToken, obtenerMisPedidos);
export default router;
