// socket.ts - VERSIÓN MEJORADA
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

// === TIPOS ===
declare global {
  // eslint-disable-next-line no-var
  var io: SocketServer | null;
}

interface JwtPayload {
  id: number;
  usuario: string;
}

// Map de usuarios conectados: usuarioId -> socketId
const usuariosConectados: Map<number, string> = new Map();

export const initializeSocket = (httpServer: HTTPServer) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8100'];
  
  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Priorizar WebSocket
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Asignar socket global para controladores
  global.io = io;

  // === MIDDLEWARE DE AUTENTICACIÓN ===
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.data.usuario = decoded;
      next();
    } catch (error) {
      next(new Error('Token inválido o expirado'));
    }
  });

  // === EVENTOS DE CONEXIÓN ===
  io.on('connection', (socket) => {
    const usuarioId = socket.data.usuario.id;
    usuariosConectados.set(usuarioId, socket.id);
    
    console.log(`⚡ Usuario ${usuarioId} conectado - SocketID: ${socket.id}`);

    // Unirse a sala personal (para notificaciones directas)
    socket.join(`user_${usuarioId}`);

    // Cliente se une a una conversación específica
    socket.on('join_conversacion', (conversacionId: number) => {
      socket.join(`conversacion_${conversacionId}`);
      console.log(`📌 Usuario ${usuarioId} se unió a conversacion_${conversacionId}`);
    });

    // Salir de conversación
    socket.on('leave_conversacion', (conversacionId: number) => {
      socket.leave(`conversacion_${conversacionId}`);
      console.log(`📤 Usuario ${usuarioId} salió de conversacion_${conversacionId}`);
    });

    // Usuario está escribiendo
    socket.on('typing', (data: { conversacionId: number, isTyping: boolean }) => {
      socket.to(`conversacion_${data.conversacionId}`).emit('user_typing', {
        usuarioId,
        isTyping: data.isTyping
      });
    });

    // Marcar mensaje como leído desde el cliente
    socket.on('mensaje_leido', (data: { conversacionId: number, mensajeId: number }) => {
      socket.to(`conversacion_${data.conversacionId}`).emit('mensaje_marcado_leido', {
        mensajeId: data.mensajeId,
        conversacionId: data.conversacionId
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      usuariosConectados.delete(usuarioId);
      console.log(`❌ Usuario ${usuarioId} desconectado`);
    });
  });

  return io;
};

// Obtener instancia global de Socket.IO
export const getIO = () => global.io;

// Helper: Verificar si un usuario está conectado
export const isUserOnline = (usuarioId: number): boolean => {
  return usuariosConectados.has(usuarioId);
};

// Helper: Emitir evento a un usuario específico
export const emitToUser = (usuarioId: number, event: string, data: any) => {
  const io = getIO();
  if (io) {
    io.to(`user_${usuarioId}`).emit(event, data);
  }
};
