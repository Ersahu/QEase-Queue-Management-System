import { io } from 'socket.io-client';

const getSocketURL = () => {
  const configuredUrl =
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  if (typeof window !== 'undefined') {
    const isVercelApp =
      window.location.hostname === 'q-ease-queue-management-system.vercel.app';
    const isLocalApp =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isVercelApp || isLocalApp) {
      return window.location.origin;
    }
  }

  return configuredUrl.replace(/\/+$/, '');
};

const SOCKET_URL = getSocketURL();

let socket = null;

/**
 * Initialize socket connection
 */
export const initializeSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join queue room
 */
export const joinQueueRoom = (queueId) => {
  const sock = getSocket();
  sock.emit('joinQueue', { queueId });
};

/**
 * Join user room
 */
export const joinUserRoom = (userId) => {
  const sock = getSocket();
  sock.emit('joinUserRoom', { userId });
};

/**
 * Leave queue room
 */
export const leaveQueueRoom = (queueId) => {
  const sock = getSocket();
  sock.emit('leaveQueue', { queueId });
};

/**
 * Listen for queue updates
 */
export const onQueueUpdated = (callback) => {
  const sock = getSocket();
  sock.on('queueUpdated', callback);
  return () => sock.off('queueUpdated', callback);
};

/**
 * Listen for customer called event
 */
export const onCustomerCalled = (callback) => {
  const sock = getSocket();
  sock.on('customerCalled', callback);
  return () => sock.off('customerCalled', callback);
};

/**
 * Listen for queue paused event
 */
export const onQueuePaused = (callback) => {
  const sock = getSocket();
  sock.on('queuePaused', callback);
  return () => sock.off('queuePaused', callback);
};

/**
 * Listen for queue resumed event
 */
export const onQueueResumed = (callback) => {
  const sock = getSocket();
  sock.on('queueResumed', callback);
  return () => sock.off('queueResumed', callback);
};

/**
 * Listen for customer check-in event (admin QR scan)
 */
export const onCustomerCheckin = (callback) => {
  const sock = getSocket();
  sock.on('customer:checkin', callback);
  return () => sock.off('customer:checkin', callback);
};

export const onNearTurn = (callback) => {
  const sock = getSocket();
  sock.on('queue:near-turn', callback);
  return () => sock.off('queue:near-turn', callback);
};

export const onPositionUpdated = (callback) => {
  const sock = getSocket();
  sock.on('queue:position-updated', callback);
  return () => sock.off('queue:position-updated', callback);
};

export const onQueuePausedForUser = (callback) => {
  const sock = getSocket();
  sock.on('queue:paused', callback);
  return () => sock.off('queue:paused', callback);
};

export const onQueueResumedForUser = (callback) => {
  const sock = getSocket();
  sock.on('queue:resumed', callback);
  return () => sock.off('queue:resumed', callback);
};
