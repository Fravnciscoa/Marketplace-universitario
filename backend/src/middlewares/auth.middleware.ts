// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiala_en_produccion';

// Extendemos JwtPayload para decirle a TS qué campos esperamos
export interface JwtUserPayload extends JwtPayload {
  id: number;
  correo: string;
  usuario: string;
  rol: string;
}

// Middleware para verificar el token y adjuntar user al request
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Esperamos formato: "Bearer <token>"
    const parts = authHeader.split(' ');
if (parts.length !== 2 || parts[0] !== 'Bearer') {
  return res.status(400).json({ error: 'Formato de token inválido' });
}

// Forzamos a TS a que se quede tranquilo
const token: string | undefined = parts[1];

if (!token) {
  return res.status(400).json({ error: 'Token no encontrado en cabecera' });
}

const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;


    // 2) Puede venir un string o un objeto; nosotros queremos el objeto
    if (typeof decoded === 'string') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // 3) Ahora lo tratamos como nuestro payload
    const payload = decoded as JwtUserPayload;

    if (!payload.id || !payload.rol) {
      return res.status(401).json({ error: 'Token sin datos de usuario válidos' });
    }

    // Guardamos el usuario en el request
    (req as any).user = {
      id: payload.id,
      correo: payload.correo,
      usuario: payload.usuario,
      rol: payload.rol,
    };

    next();
  } catch (error) {
    console.error('Error en verifyToken:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para validar si el usuario es admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }

  next();
};
