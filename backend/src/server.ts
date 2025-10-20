import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbHealthcheck } from './utils/healthcheck';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req: Request, res: Response) => {
  try {
    const now = await dbHealthcheck();
    res.json({ status: 'ok', db_time: now });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = Number(process.env['PORT']) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
