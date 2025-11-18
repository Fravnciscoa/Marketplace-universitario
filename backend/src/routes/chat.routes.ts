import { Router } from 'express';
import {
  obtenerConversaciones,
  obtenerOCrearConversacion,
  obtenerMensajes,
  enviarMensaje,
  obtenerMensajesPaginados,
  buscarConversaciones,
  eliminarConversacion
} from '../controllers/chat.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

// Rutas de conversaciones
router.get('/conversaciones', obtenerConversaciones);
router.get('/conversaciones/buscar', buscarConversaciones); // ← NUEVO
router.post('/conversaciones', obtenerOCrearConversacion);
router.delete('/:conversacionId', eliminarConversacion); // ← NUEVO

// Rutas de mensajes
router.get('/:conversacionId/mensajes', obtenerMensajes);
router.get('/:conversacionId/mensajes/paginados', obtenerMensajesPaginados);
router.post('/:conversacionId/mensajes', enviarMensaje);

export default router;
