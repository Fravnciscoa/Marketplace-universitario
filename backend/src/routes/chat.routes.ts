
//--chat.routes.ts--//
import { Router } from 'express';

import {
  obtenerConversaciones,
  obtenerOCrearConversacion,
  obtenerMensajes,
  enviarMensaje,
  obtenerMensajesPaginados,
  buscarConversaciones,
  eliminarConversacion,
  obtenerContadorNoLeidos,      // ← NUEVO
  marcarConversacionLeida        // ← NUEVO
} from '../controllers/chat.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de conversaciones
router.get('/conversaciones', obtenerConversaciones);
router.get('/conversaciones/buscar', buscarConversaciones);
router.post('/conversaciones', obtenerOCrearConversacion);
router.delete('/conversaciones/:conversacionId', eliminarConversacion);

// Rutas de mensajes
router.get('/no-leidos', obtenerContadorNoLeidos);                    // ← NUEVO
router.get('/:conversacionId/mensajes', obtenerMensajes);
router.get('/:conversacionId/mensajes/paginados', obtenerMensajesPaginados);
router.post('/:conversacionId/mensajes', enviarMensaje);
router.put('/:conversacionId/marcar-leido', marcarConversacionLeida); // ← NUEVO

export default router;
