import { Router } from 'express';
import {
  crearReserva,
  aceptarReserva,
  rechazarReserva,
  obtenerMisReservas,
  obtenerReservasPendientes,
  cancelarReserva
} from '../controllers/reservas.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear reserva (comprador)
router.post('/', crearReserva);

// Obtener mis reservas (comprador)
router.get('/mis-reservas', obtenerMisReservas);

// Obtener reservas pendientes (vendedor)
router.get('/pendientes', obtenerReservasPendientes);

// Aceptar reserva (vendedor)
router.put('/:id/aceptar', aceptarReserva);

// Rechazar reserva (vendedor)
router.put('/:id/rechazar', rechazarReserva);

// Cancelar reserva (comprador)
router.delete('/:id', cancelarReserva);

export default router;
