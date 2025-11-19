import { Router } from 'express';
import {
  crearPedido,
  obtenerMisPedidos,
  obtenerDetallePedido,
  cancelarPedido,
  confirmarPedido
} from '../controllers/pedidos.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear pedido
router.post('/', crearPedido);

// Obtener mis pedidos
router.get('/', obtenerMisPedidos);

// Detalle de pedido
router.get('/:id', obtenerDetallePedido);

// Cancelar pedido
router.put('/:id/cancelar', cancelarPedido);

// Confirmar pedido (vendedor)
router.put('/:id/confirmar', confirmarPedido);

export default router;