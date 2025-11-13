import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useChat = (roomId, isStreamer = false) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const socketRef = useRef(null);

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);

      if (isStreamer) {
        socket.emit('create-room', { roomId }, (response) => {
          if (response.error) {
            console.error('Create room error:', response.error);
          } else {
            console.log('Room created successfully');
          }
        });
      } else {
        socket.emit('join-room', { roomId }, (response) => {
          if (response.error) {
            console.error('Join room error:', response.error);
          } else {
            console.log('Joined room successfully');
            if (response.room?.chatHistory) {
              setMessages(response.room.chatHistory);
            }
            if (response.room?.viewerCount) {
              setViewerCount(response.room.viewerCount);
            }
          }
        });
      }
    });

    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('viewer-joined', (data) => {
      setViewerCount(data.viewerCount);
    });

    socket.on('viewer-left', (data) => {
      setViewerCount(data.viewerCount);
    });

    socket.on('stream-ended', (data) => {
      console.log('Stream ended:', data.reason);
      setConnected(false);
    });

    socket.on('message-deleted', (data) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    });

    socket.on('chat-cleared', () => {
      setMessages([]);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave-room', () => {
          console.log('Left room');
        });
      }
      socket.disconnect();
    };
  }, [roomId, isStreamer, SOCKET_URL]);

  const sendMessage = (message) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('chat-message', { message }, (response) => {
        if (response.error) {
          console.error('Send message error:', response.error);
          alert(response.error);
        }
      });
    }
  };

  const deleteMessage = (messageId) => {
    if (socketRef.current && connected && isStreamer) {
      socketRef.current.emit('delete-message', { messageId }, (response) => {
        if (response.error) {
          console.error('Delete message error:', response.error);
        }
      });
    }
  };

  const clearChat = () => {
    if (socketRef.current && connected && isStreamer) {
      socketRef.current.emit('clear-chat', (response) => {
        if (response.error) {
          console.error('Clear chat error:', response.error);
        }
      });
    }
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    clearChat,
    connected,
    viewerCount
  };
};