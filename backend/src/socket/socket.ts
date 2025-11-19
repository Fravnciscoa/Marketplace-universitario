// socket.ts - VERSIÓN DEFINITIVA + NOTIFICACIONES DE MENSAJES
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

// ====================================================
//  INICIALIZACIÓN DEL SOCKET.IO
// ====================================================
export const initializeSocket = (httpServer: HTTPServer) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:8100'
  ];

  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Asignar socket global
  global.io = io;

  // ====================================================
  //  MIDDLEWARE DE AUTENTICACIÓN POR TOKEN
  // ====================================================
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

  // ====================================================
  //  MANEJO DE CONEXIONES
  // ====================================================
  io.on('connection', (socket) => {
    const usuarioId = socket.data.usuario.id;

    // Registrar usuario conectado
    usuariosConectados.set(usuarioId, socket.id);
    socket.join(`user_${usuarioId}`);

    console.log(`⚡ Usuario ${usuarioId} conectado - SocketID: ${socket.id}`);

    // ----------------------------------------------------
    //  EVENTO PERSONAL PARA NOTIFICACIONES
    //  El Frontend lo llama justo al iniciar la app:
    //
    //  socket.emit("registrar_usuario", user.id)
    // ----------------------------------------------------
    socket.on("registrar_usuario", (id: number) => {
      socket.join(`user_${id}`);
      console.log(`📌 Usuario ${id} registrado para notificaciones.`);
    });

    // ----------------------------------------------------
    //  SALAS DE CONVERSACIÓN
    // ----------------------------------------------------
    socket.on('join_conversacion', (conversacionId: number) => {
      socket.join(`conversacion_${conversacionId}`);
      console.log(`📌 Usuario ${usuarioId} se unió a conversacion_${conversacionId}`);
    });

    socket.on('leave_conversacion', (conversacionId: number) => {
      socket.leave(`conversacion_${conversacionId}`);
      console.log(`📤 Usuario ${usuarioId} salió de conversacion_${conversacionId}`);
    });

    // ----------------------------------------------------
    //  INDICADOR "ESTÁ ESCRIBIENDO"
    // ----------------------------------------------------
    socket.on('typing', (data: { conversacionId: number; isTyping: boolean }) => {
      socket.to(`conversacion_${data.conversacionId}`).emit('user_typing', {
        usuarioId,
        isTyping: data.isTyping
      });
    });

    // ----------------------------------------------------
    //  MARCAR MENSAJE COMO LEÍDO
    // ----------------------------------------------------
    socket.on('mensaje_leido', (data: { conversacionId: number; mensajeId: number }) => {
      socket.to(`conversacion_${data.conversacionId}`).emit('mensaje_marcado_leido', {
        mensajeId: data.mensajeId,
        conversacionId: data.conversacionId
      });
    });

    // ----------------------------------------------------
    //  DESCONEXIÓN
    // ----------------------------------------------------
    socket.on('disconnect', () => {
      usuariosConectados.delete(usuarioId);
      console.log(`❌ Usuario ${usuarioId} desconectado`);
    });
  });

  return io;
};

// ====================================================
//   HELPERS PARA EMITIR NOTIFICACIONES
// ====================================================

export const getIO = () => global.io;

export const isUserOnline = (usuarioId: number): boolean => {
  return usuariosConectados.has(usuarioId);
};

export const emitToUser = (usuarioId: number, event: string, data: any) => {
  const io = getIO();
  if (!io) return;
  io.to(`user_${usuarioId}`).emit(event, data);
};

// Helper principal: notificación a un usuario (toast + badge)
export const emitirNotificacionMensaje = (
  receptorId: number,
  payload: any
) => {
  const io = getIO();
  if (!io) return;

  io.to(`user_${receptorId}`).emit("notificacion_mensaje", {
    ...payload,
    timestamp: payload.created_at || new Date().toISOString(),
  });

  console.log(`🔔 Notificación enviada a user_${receptorId}`, payload);
};
