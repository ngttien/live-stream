module.exports = {
  // Room categories
  CATEGORIES: {
    GAMING: 'gaming',
    MUSIC: 'music',
    TALK: 'talk',
    CREATIVE: 'creative',
    OTHER: 'other'
  },

  // Room limits
  MAX_VIEWERS_PER_ROOM: 100,
  MAX_ROOMS_PER_USER: 1,

  // Chat limits
  MAX_MESSAGE_LENGTH: 500,
  CHAT_RATE_LIMIT: 5, // messages per window
  CHAT_RATE_WINDOW: 10, // seconds

  // User limits
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,

  // Stream quality presets
  STREAM_QUALITY: {
    HIGH: { width: 1280, height: 720, bitrate: 2500 },
    MEDIUM: { width: 854, height: 480, bitrate: 1000 },
    LOW: { width: 640, height: 360, bitrate: 500 }
  },

  // WebRTC configuration
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],

  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    RATE_LIMIT: 'Too many requests',
    SERVER_ERROR: 'Internal server error'
  }
};