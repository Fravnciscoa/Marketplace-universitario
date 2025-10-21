import { pool } from '../db/pool';

export async function dbHealthcheck() {
  const { rows } = await pool.query('SELECT NOW() AS now');
  return rows[0].now;
}
