//auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


// Middleware para verificar token JWT
export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    // Extraer token
    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key_aqui';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      correo: string;    // ← CAMBIADO
      usuario: string;  
      rol: string; // ← CAMBIADO
    };

    // Agregar usuario al request (con los campos correctos)
    (req as any).user = {
      id: decoded.id,
      correo: decoded.correo,      // ← CAMBIADO
      usuario: decoded.usuario,
      rol: decoded.rol   // ← CAMBIADO
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al verificar token'
    });
  }
};

// Middleware opcional para verificar rol de admin
export const verificarAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }
  if (user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: se requiere rol de administrador'
    });
  }

  next();
};
