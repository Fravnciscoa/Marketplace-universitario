import { Router } from 'express';
import {
  obtenerConversaciones,
  obtenerOCrearConversacion,
  obtenerMensajes,
  enviarMensaje
} from '../controllers/chat.controller';

const router = Router();

// ⬇️ MOCK TEMPORAL - Simula usuario ID 1 autenticado
router.use((req, res, next) => {
  req.user = {
    id: 1,  // Usuario Test 1
    correo: 'test1@mail.pucv.cl',
    usuario: 'testuser1'
  };
  next();
});

// Rutas
router.get('/conversaciones', obtenerConversaciones);
router.post('/conversaciones', obtenerOCrearConversacion);
router.get('/:conversacionId/mensajes', obtenerMensajes);
router.post('/:conversacionId/mensajes', enviarMensaje);

export default router;
