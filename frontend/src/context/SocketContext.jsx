import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initializeSocket,
  disconnectSocket,
  getSocket,
} from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket when user is authenticated
    if (user) {
      const sock = initializeSocket();
      setSocket(sock);
      setConnected(sock.connected);

      // Join user-specific room
      sock.emit('joinUserRoom', { userId: user._id });

      // Listen for connection events
      sock.on('connect', () => {
        setConnected(true);
        console.log('Socket connected');
      });

      sock.on('disconnect', () => {
        setConnected(false);
        console.log('Socket disconnected');
      });

      return () => {
        // Don't disconnect on unmount, keep socket alive
      };
    } else {
      // Disconnect when user logs out
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
