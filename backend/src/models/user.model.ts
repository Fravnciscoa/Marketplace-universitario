import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export const createUser = async (nombre: string, correo: string, usuario: string, contrasenaHasheada: string) => {
  const query = `
    INSERT INTO usuarios (nombre, correo, usuario, contrasena)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, correo, usuario, fecha_creacion;
  `;
  const values = [nombre, correo, usuario, contrasenaHasheada];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmailOrUsername = async (correo: string, usuario: string) => {
  const query = `SELECT * FROM usuarios WHERE correo = $1 OR usuario = $2`;
  const result = await pool.query(query, [correo, usuario]);
  return result.rows[0];
};

export const findUserByEmail = async (correo: string) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
  return result.rows[0];
};

export interface User {
  id: string;
  email: string;
  password?: string;
}

export const users: User[] = []; // placeholder in-memory store

export const UserModel = {
  findOne: (query: Partial<User>) => Promise.resolve(users.find(u => u.email === query.email) ?? null),
  create: (data: Partial<User>) => {
    const u: User = { id: Date.now().toString(), email: data.email || '' };
    users.push(u);
    return Promise.resolve(u);
  }
};
