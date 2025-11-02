import { Pool } from 'pg';

console.log('🔥 USANDO POOL HARDCODEADO 🔥');

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'IngWeb',     // 🔥 Hardcodeado
  user: 'postgres',        // 🔥 Hardcodeado
  password: '1234',        // 🔥 Hardcodeado
  ssl: false
});

console.log('Pool configurado para base de datos: IngWeb');
