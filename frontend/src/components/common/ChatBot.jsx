import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Badge,
  Tooltip,
  Typography,
  Avatar,
  Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { aiAPI } from '../../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: "What's my position?", message: 'What is my position in the queue?' },
    { label: 'How long to wait?', message: 'How much time left?' },
    { label: 'Queue status', message: 'What is the queue status?' },
    { label: 'Help', message: 'Help' },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          content: "Hello! 👋 I'm your QEase AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.chatbot({ message: input });

      if (response.data.success) {
        const botMessage = {
          role: 'bot',
          content: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (message) => {
    setInput(message);
    setTimeout(() => handleSend(), 100);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  if (!isOpen) {
    return (
      <Tooltip title="Chat with AI Assistant">
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'primary.main',
            color: 'white',
            width: 64,
            height: 64,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
            },
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon sx={{ fontSize: 32 }} />
          </Badge>
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 400,
        maxWidth: 'calc(100vw - 48px)',
        height: 600,
        maxHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6">QEase AI Assistant</Typography>
        </Box>
        <IconButton onClick={handleToggle} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                maxWidth: '80%',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main',
                }}
              >
                {msg.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <Box sx={{ p: 1, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Quick questions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="small"
                variant="outlined"
                onClick={() => handleQuickAction(action.message)}
                sx={{ borderRadius: 5 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <IconButton
          onClick={handleSend}
          disabled={loading || !input.trim()}
          color="primary"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBot;
