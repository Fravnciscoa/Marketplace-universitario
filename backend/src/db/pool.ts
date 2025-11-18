import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST || "IngWeb",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Panxo85808134",
  database: process.env.DB_DATABASE || "marketplace",
  port: Number(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_HOST?.includes('azure') 
    ? { rejectUnauthorized: false } 
    : false
});
