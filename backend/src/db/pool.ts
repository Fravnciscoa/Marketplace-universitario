import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || 'IngWeb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Akira1712',
  ssl: false
});

console.log(`✅ Pool configurado - Base de datos: ${process.env.DB_DATABASE || 'IngWeb'}`);
