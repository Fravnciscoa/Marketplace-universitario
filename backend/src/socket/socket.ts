import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface UsuarioSocket {
  usuarioId: number;
  socketId: string;
}

const usuariosConectados: Map<number, string> = new Map();

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*', // En producción, especifica tu dominio
      methods: ['GET', 'POST']
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.usuario = decoded;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const usuarioId = socket.data.usuario.id;
    usuariosConectados.set(usuarioId, socket.id);
    
    console.log(`✅ Usuario ${usuarioId} conectado via WebSocket`);

    // Usuario se une a sus conversaciones
    socket.on('join_conversacion', (conversacionId: number) => {
      socket.join(`conversacion_${conversacionId}`);
      console.log(`Usuario ${usuarioId} se unió a conversación ${conversacionId}`);
    });

    // Enviar mensaje en tiempo real
    socket.on('enviar_mensaje', (data: { conversacionId: number; mensaje: string }) => {
      // Emitir a todos en la conversación excepto al emisor
      socket.to(`conversacion_${data.conversacionId}`).emit('nuevo_mensaje', {
        conversacionId: data.conversacionId,
        mensaje: data.mensaje,
        remitenteId: usuarioId,
        timestamp: new Date()
      });
    });

    // Usuario saliendo de conversación
    socket.on('leave_conversacion', (conversacionId: number) => {
      socket.leave(`conversacion_${conversacionId}`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      usuariosConectados.delete(usuarioId);
      console.log(`❌ Usuario ${usuarioId} desconectado`);
    });
  });

  return io;
};

export const getIO = () => {
  // Esta función se puede usar para emitir eventos desde otros controladores
  return global.io;
};
