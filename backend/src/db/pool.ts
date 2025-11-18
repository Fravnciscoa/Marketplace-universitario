import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Usar primero DATABASE_URL SOLO si existe (Heroku, Vercel, Render)
// Si no, usar configuración manual (Azure)
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || "marketplace-universitario.postgres.database.azure.com",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "marketplace",
      port: Number(process.env.DB_PORT) || 5432,
      ssl: process.env.DB_HOST?.includes("azure")
        ? { rejectUnauthorized: false }
        : false
    };

export const pool = new Pool(connectionConfig);

// Logs útiles
pool.on("connect", () => {
  console.log("🚀 Conectado a PostgreSQL (Azure)");
});

pool.on("error", (err) => {
  console.error("❌ Error en la conexión a PostgreSQL:", err);
});

export default pool;
console.log("🔍 POOL CONFIG:", pool.options);
