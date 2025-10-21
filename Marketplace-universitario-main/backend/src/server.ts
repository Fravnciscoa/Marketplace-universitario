import dotenv from 'dotenv';
dotenv.config({ path: './.env', override: true }); // 👈 carga .env primero, antes que nada


import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbHealthcheck } from './utils/healthcheck';
const authRoutes = require('./routes/auth.routes');

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', async (req: Request, res: Response) => {
  try {
    const now = await dbHealthcheck();
    res.json({ status: 'ok', db_time: now });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
