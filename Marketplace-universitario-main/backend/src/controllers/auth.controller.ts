import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmailOrUsername, findUserByEmail } from '../models/user.model';
import { User } from '../models/user.model';
import { pool } from '../db/pool';

dotenv.config();

export const register = async (req: Request, res: Response) => {
  try {
    console.log('BODY RECIBIDO >>>', req.body); // 👈 agregamos esto

    const { nombre, correo, usuario, contrasena } = req.body;

    if (!nombre || !correo || !usuario || !contrasena) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const existingUser = await findUserByEmailOrUsername(correo, usuario);
    if (existingUser) {
      return res.status(409).json({ message: 'Correo o usuario ya registrados' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const newUser = await createUser(nombre, correo, usuario, hashedPassword);

    const token = jwt.sign({ id: newUser.id, usuario: newUser.usuario }, process.env.JWT_SECRET!, {
      expiresIn: '3h',
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: newUser,
      token,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error en el registro', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario existe
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, correo: user.correo },
      process.env.JWT_SECRET as string,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        usuario: user.usuario,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};