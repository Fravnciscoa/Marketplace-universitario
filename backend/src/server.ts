import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
import productosRoutes from './routes/producto.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:4200'],
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API Marketplace PUCV funcionando',
    endpoints: {
      auth: '/api/auth/register, /api/auth/login',
      productos: '/api/productos'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
