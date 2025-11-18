import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiala_en_produccion';

interface JwtPayload {
  id: number;
  correo: string;
  usuario: string;
}

// ✅ Extender la interfaz Request para TypeScript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        correo: string;
        usuario: string;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // El formato esperado es: "Bearer TOKEN_AQUI"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // ✅ CAMBIO CRÍTICO: Usar req.user en lugar de req.userId
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      usuario: decoded.usuario
    };

    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    console.error('Error en verifyToken:', error);
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};