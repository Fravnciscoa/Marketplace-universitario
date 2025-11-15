import { Router } from 'express';
import { register, login, verifyUser, getProfile } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { validateRegister, validateLogin } from '../middlewares/validators';
import * as authController from '../controllers/auth.controller';
const router = Router();

// Rutas públicas CON validaciones de seguridad (EF 3)
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Ruta protegida (solo requiere JWT)
router.get('/verify', verifyToken, verifyUser);
router.get('/profile', verifyToken, authController.getProfile);


export default router;
