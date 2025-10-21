const express = require('express');
const { register, login } = require('../controllers/auth.controller'); // 👈 sin .js
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;

import { verifyToken } from '../middlewares/verifyToken';


router.post('/register', register);
router.post('/login', login);

// Ruta protegida — solo accesible con token
router.get('/profile', verifyToken, (req: any, res: { json: (arg0: { message: string; user: any; }) => void; }) => {
  res.json({
    message: 'Perfil del usuario autenticado',
    user: (req as any).user,
  });
});

export default router;

import { pool } from '../db/pool';

router.get('/profile', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, nombre, correo, usuario FROM usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Perfil del usuario',
      usuario: result.rows[0],
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
});
