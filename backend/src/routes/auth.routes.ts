import { Router } from 'express';
import { register, login, verifyUser } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Ruta de registro
router.post('/register', register);

// Ruta de login
router.post('/login', login);

// Ruta para verificar token (protegida)
router.get('/verify', verifyToken, verifyUser);

export default router;
