// server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/producto.routes';
import chatRoutes from './routes/chat.routes';

import { initializeSocket } from './socket/socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Servidor HTTP base
const httpServer = http.createServer(app);

// Inicializar WebSockets (con Fallback automático)
try {
  initializeSocket(httpServer);
  console.log("🔌 WebSocket: Socket.IO inicializado");
} catch (err) {
  console.warn("⚠ No se pudo inicializar Socket.IO, continuando sin WebSocket");
  global.io = null;
}

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(compression());

// Rutas API REST
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/chat', chatRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, websocket: global.io ? true : false });
});

// Iniciar servidor HTTP
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor REST corriendo en http://localhost:${PORT}`);
});
