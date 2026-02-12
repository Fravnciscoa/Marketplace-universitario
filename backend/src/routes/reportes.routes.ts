import { Router } from 'express';
import { 
  crearReporte, 
  obtenerReportes, 
  actualizarEstadoReporte 
} from '../controllers/reportes.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// POST /api/reportes - Crear un nuevo reporte (requiere autenticación)
router.post('/', verifyToken, crearReporte);

// GET /api/reportes - Obtener todos los reportes (solo admin, por ahora todos los autenticados)
router.get('/', verifyToken, obtenerReportes);

// PUT /api/reportes/:id - Actualizar estado de un reporte (solo admin)
router.put('/:id', verifyToken, actualizarEstadoReporte);

export default router;
