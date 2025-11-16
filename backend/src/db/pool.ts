import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: "marketplace-universitario.postgres.database.azure.com",
  user: "postgres",
  password: "Panxo85808134",
  database: "marketplace",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
});
