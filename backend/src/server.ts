import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/producto.routes';

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
    error: 'Demasiados intentos de inicio de sesión, intente en 15 minutos'
  },
  skipSuccessfulRequests: true // Solo cuenta requests fallidos
});

// 4. CORS Seguro con validación
const allowedOrigins = [
  'http://localhost:8100',
  'http://localhost:4200',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman/Thunder Client) en desarrollo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 5. Body parsing con límite de tamaño (protección contra payloads grandes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== RUTAS =====

// Aplicar rate limiting general a todas las rutas
app.use(limiter);

// Ruta de prueba (health check)
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API Marketplace PUCV funcionando',
    version: '2.0',
    timestamp: new Date().toISOString(),
    security: {
      helmet: 'activo',
      rateLimit: '100 req/15min general, 5 req/15min auth',
      cors: 'orígenes permitidos configurados'
    },
    endpoints: {
      auth: '/api/auth/register, /api/auth/login, /api/auth/verify',
      productos: '/api/productos (GET, POST, PUT, DELETE)'
    }
  });
});

// Rutas con rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/productos', productosRoutes);

// ===== MANEJO DE ERRORES =====

// Error 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error capturado:', err.message);
  
  // Error específico de CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Acceso denegado por política CORS',
      origin: req.headers.origin || 'desconocido'
    });
  }
  
  // Error específico de rate limit
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Demasiadas peticiones',
      message: err.message
    });
  }
  
  // Errores generales
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔒 Seguridad EF 3:`);
  console.log(`   - Helmet: Headers HTTP seguros`);
  console.log(`   - Rate Limiting: 100 req/15min (general)`);
  console.log(`   - Auth Rate Limiting: 5 intentos/15min`);
  console.log(`   - CORS: ${allowedOrigins.length} orígenes permitidos`);
  console.log(`   - Body limit: 10MB máximo`);
  console.log(`${'='.repeat(50)}\n`);
});
