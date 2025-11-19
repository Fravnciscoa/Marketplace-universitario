//auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmailOrUsername, findUserByEmail } from '../models/user.model';
import { User } from '../models/user.model';
import { pool } from '../db/pool';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiala_en_produccion';
const JWT_EXPIRES_IN = '24h';

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, usuario, contrasena, rut, region, comuna, terminos_aceptados } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !correo || !usuario || !contrasena || !rut || !region || !comuna) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (!terminos_aceptados) {
      return res.status(400).json({ error: 'Debes aceptar los términos y condiciones' });
    }
    
    // Validar formato de correo PUCV
    const correoPUCV = correo.toLowerCase();
    if (!correoPUCV.includes('@pucv.cl') && !correoPUCV.includes('@mail.pucv.cl')) {
      return res.status(400).json({ error: 'Debes usar un correo institucional PUCV' });
    }
    
    // Verificar si el correo ya existe
    const correoExiste = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (correoExiste.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    
    // Verificar si el usuario ya existe
    const usuarioExiste = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (usuarioExiste.rows.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }
    
    // Hashear contraseña con bcrypt (10 salt rounds)
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    
    // Insertar usuario en la base de datos
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, usuario, contrasena, rut, region, comuna, terminos_aceptados) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, nombre, correo, usuario, rut, region, comuna, fecha_creacion`,
      [nombre, correo, usuario, contrasenaHash, rut, region, comuna, terminos_aceptados]
    );
    
    const nuevoUsuario = result.rows[0];
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuario.id, 
        correo: nuevoUsuario.correo,
        usuario: nuevoUsuario.usuario
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Retornar token y datos del usuario (SIN contraseña)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        usuario: nuevoUsuario.usuario,
        rut: nuevoUsuario.rut,
        region: nuevoUsuario.region,
        comuna: nuevoUsuario.comuna
      }
    });
    
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, contrasena } = req.body;
    
    // Validar campos requeridos
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }
    
    // Buscar usuario por correo
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const usuario = result.rows[0];
    
    // Comparar contraseña con bcrypt
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo,
        usuario: usuario.usuario
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Retornar token y datos del usuario (SIN contraseña)
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        usuario: usuario.usuario,
        rut: usuario.rut,
        region: usuario.region,
        comuna: usuario.comuna
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    // El userId viene del middleware verifyToken
    const userId = (req as any).userId;
    
    const result = await pool.query(
      'SELECT id, nombre, correo, usuario, rut, region, comuna, fecha_creacion FROM usuarios WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en verifyUser:', error);
    res.status(500).json({ error: 'Error al verificar usuario' });
  }
};
// Agregar al final de auth.controller.ts, justo antes del export final

// GET /api/auth/usuarios/buscar - Buscar usuarios por nombre, usuario o correo
// Agregar esta función al final de auth.controller.ts (antes del último export o al final del archivo)

// GET /api/auth/usuarios/buscar - Buscar usuarios por nombre, usuario o correo
export const buscarUsuarios = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Usuario autenticado
    const { q } = req.query; // Término de búsqueda

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Validar que el término de búsqueda tenga al menos 3 caracteres
    if (!q || typeof q !== 'string' || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'El término de búsqueda debe tener al menos 3 caracteres',
        usuarios: []
      });
    }

    const termino = q.trim().toLowerCase();

    // Buscar usuarios que coincidan con el término (nombre, usuario o correo)
    // Excluir al usuario actual de los resultados
    const result = await pool.query(
      `SELECT 
        id, 
        nombre, 
        usuario, 
        correo
      FROM usuarios 
      WHERE id != $1 
        AND (
          LOWER(nombre) LIKE $2 
          OR LOWER(usuario) LIKE $2 
          OR LOWER(correo) LIKE $2
        )
      ORDER BY 
        CASE 
          WHEN LOWER(usuario) = $3 THEN 1
          WHEN LOWER(nombre) = $3 THEN 2
          WHEN LOWER(usuario) LIKE $4 THEN 3
          WHEN LOWER(nombre) LIKE $4 THEN 4
          ELSE 5
        END,
        nombre ASC
      LIMIT 10`,
      [
        userId, 
        `%${termino}%`, // Para búsqueda con LIKE
        termino,        // Para coincidencia exacta (mayor prioridad)
        `${termino}%`   // Para coincidencia al inicio (segunda prioridad)
      ]
    );

    res.json({
      success: true,
      usuarios: result.rows,
      total: result.rows.length
    });

  } catch (error: any) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar usuarios',
      details: error.message,
      usuarios: []
    });
  }
};

// GET /auth/profile
// GET /api/auth/profile - Obtener perfil del usuario autenticado
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const result = await pool.query(
      `SELECT 
        id, 
        nombre, 
        correo, 
        usuario, 
        rut, 
        region, 
        comuna,
        genero,
        fecha_nacimiento,
        telefono1,
        telefono2,
        direccion,
        fecha_creacion
      FROM usuarios 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil del usuario',
      details: error.message
    });
  }
};


// PUT /api/auth/profile - Actualizar perfil del usuario
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const {
      nombre,
      rut,
      region,
      comuna,
      genero,
      fecha_nacimiento,
      telefono1,
      telefono2,
      direccion
    } = req.body;

    // Validar que al menos un campo venga para actualizar
    if (!nombre && !rut && !region && !comuna && !genero && !fecha_nacimiento && !telefono1 && !telefono2 && !direccion) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar al menos un campo para actualizar'
      });
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (nombre) {
      updates.push(`nombre = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }

    if (rut) {
      updates.push(`rut = $${paramIndex}`);
      values.push(rut);
      paramIndex++;
    }

    if (region) {
      updates.push(`region = $${paramIndex}`);
      values.push(region);
      paramIndex++;
    }

    if (comuna) {
      updates.push(`comuna = $${paramIndex}`);
      values.push(comuna);
      paramIndex++;
    }

    if (genero) {
      updates.push(`genero = $${paramIndex}`);
      values.push(genero);
      paramIndex++;
    }

    if (fecha_nacimiento) {
      updates.push(`fecha_nacimiento = $${paramIndex}`);
      values.push(fecha_nacimiento);
      paramIndex++;
    }

    if (telefono1) {
      updates.push(`telefono1 = $${paramIndex}`);
      values.push(telefono1);
      paramIndex++;
    }

    if (telefono2) {
      updates.push(`telefono2 = $${paramIndex}`);
      values.push(telefono2);
      paramIndex++;
    }

    if (direccion) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
    }

    // Agregar userId al final
    values.push(userId);

    const query = `
      UPDATE usuarios 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nombre, correo, usuario, rut, region, comuna, genero, fecha_nacimiento, telefono1, telefono2, direccion, fecha_creacion
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil',
      details: error.message
    });
  }
};



