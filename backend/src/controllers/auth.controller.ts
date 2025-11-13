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