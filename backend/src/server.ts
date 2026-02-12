import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression'; 
import reportesRoutes from './routes/reportes.routes';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/producto.routes';
import pedidosRoutes from './routes/pedidos.routes'; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SEGURIDAD AVANZADA (EF 3) =====
// 1. Helmet - Protege headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  }
}));

// 2. Rate Limiting General - 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Demasiadas peticiones desde esta IP, intente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Rate Limiting Estricto para Auth - 5 intentos por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Demasiados intentos de autenticación, intente más tarde'
  },
  skipSuccessfulRequests: true,
});

app.use(limiter);

// ===== OPTIMIZACIÓN DE RENDIMIENTO (EF 4) ===== ⬅️ NUEVO
// Compresión gzip/deflate para todas las respuestas
app.use(compression({
  // Comprimir respuestas mayores a 1kb
  threshold: 1024,
  // Nivel de compresión (0-9, default: 6)
  level: 6,
  // Solo comprimir estos tipos de contenido
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// ===== CORS SEGURO (EF 3) =====
const allowedOrigins = [
  'http://localhost:8100',
  'http://localhost:4200',
  'http://localhost:8080',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares básicos
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/reportes', reportesRoutes); 
app.use('/api/pedidos', pedidosRoutes); // ⬅️ AGREGAR ESTA LÍNEA

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error Handler Global
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔒 Seguridad: Helmet, CORS, Rate Limiting activados`);
  console.log(`⚡ Optimización: Compresión gzip activada`); // ⬅️ NUEVO
});
