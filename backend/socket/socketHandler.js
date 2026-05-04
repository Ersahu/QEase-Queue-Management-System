/**
 * Socket.io Handler
 * Manages real-time connections and events for queue updates
 */

const setupSocketIO = (io) => {
  // Store connected users for targeted messaging
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    /**
     * Join a queue room to receive updates
     * Client sends: { queueId }
     */
    socket.on('joinQueue', ({ queueId }) => {
      if (queueId) {
        socket.join(`queue_${queueId}`);
        console.log(`Socket ${socket.id} joined queue_${queueId}`);
      }
    });

    /**
     * Join user-specific room for personal notifications
     * Client sends: { userId }
     */
    socket.on('joinUserRoom', ({ userId }) => {
      if (userId) {
        socket.join(`user_${userId}`);
        connectedUsers.set(userId, socket.id);
        console.log(`Socket ${socket.id} joined user_${userId}`);
      }
    });

    /**
     * Leave a queue room
     * Client sends: { queueId }
     */
    socket.on('leaveQueue', ({ queueId }) => {
      if (queueId) {
        socket.leave(`queue_${queueId}`);
        console.log(`Socket ${socket.id} left queue_${queueId}`);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove from connected users map
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });

    /**
     * Error handling
     */
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  /**
   * Helper function to emit events to specific rooms
   */
  const emitToQueue = (queueId, event, data) => {
    io.to(`queue_${queueId}`).emit(event, data);
  };

  const emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  return {
    emitToQueue,
    emitToUser,
    connectedUsers,
  };
};

module.exports = { setupSocketIO };
