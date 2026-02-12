import { pool } from "./pool";

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error conectando a Azure:", err);
  } else {
    console.log("🔥 Conexión exitosa a Azure:", res.rows);
  }
  pool.end();
});
