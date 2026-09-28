import { Router } from 'express';
import { getMisCreditos, claimCreditos } from '../controllers/credito.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Rutas protegidas (requieren autenticación)
router.get('/api/creditos', verifyToken, getMisCreditos);
router.post('/api/creditos/claim', verifyToken, claimCreditos);

export default router;
