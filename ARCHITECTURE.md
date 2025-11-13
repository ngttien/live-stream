# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React - Port 3001)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │    Hooks     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ - Login      │  │ - Navbar     │  │ - useAuth    │     │
│  │ - Register   │  │ - ChatBox    │  │ - useChat    │     │
│  │ - Welcome    │  │ - HlsPlayer  │  └──────────────┘     │
│  │ - Streamer   │  │ - Protected  │                        │
│  │ - Viewer     │  └──────────────┘                        │
│  └──────────────┘                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Services (api.js)                    │      │
│  │  - authAPI  - roomsAPI  - usersAPI  - streamsAPI │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
└──────────────────┬──────────────────┬────────────────────────┘
                   │                  │
                   │ HTTP/REST        │ WebSocket
                   │ (JWT Auth)       │ (Socket.io)
                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                  (Node.js/Express - Port 3000)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │ Controllers  │  │  Middleware  │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ /api/auth    │  │ authCtrl     │  │ - auth       │     │
│  │ /api/rooms   │  │ roomCtrl     │  │ - validation │     │
│  │ /api/users   │  │ userCtrl     │  │ - rateLimit  │     │
│  │ /api/streams │  │ streamCtrl   │  │ - error      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Socket.io Manager                    │      │
│  │  - roomHandlers  - chatHandlers  - webrtcHandlers│      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │    Config    │  │    Utils     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ - User       │  │ - database   │  │ - logger     │     │
│  │ - Room       │  │ - redis      │  │ - helpers    │     │
│  │ - Message    │  │ - mediasoup  │  │ - constants  │     │
│  │ - Follow     │  └──────────────┘  └──────────────┘     │
│  └──────────────┘                                           │
│                                                              │
└──────────────┬──────────────────┬──────────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌──────────────────────┐
│    PostgreSQL        │  │       Redis          │
│    (Port 5432)       │  │    (Port 6379)       │
├──────────────────────┤  ├──────────────────────┤
│ Tables:              │  │ Cache:               │
│ - users              │  │ - online_users       │
│ - rooms              │  │ - live_rooms         │
│ - messages           │  │ - room_stats         │
│ - follows            │  │ - rate_limits        │
│ - bans               │  └──────────────────────┘
└──────────────────────┘
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User Input (email, password)
    ↓
Frontend (useAuth)
    ↓
POST /api/auth/login
    ↓
Backend (authController)
    ↓
Database (User.findByEmail)
    ↓
JWT Token Generation
    ↓
Response (token + user)
    ↓
Frontend (localStorage)
    ↓
Authenticated State
```

### 2. Room Creation Flow
```
Streamer Input (title, description, category)
    ↓
Frontend (StreamerDashboard)
    ↓
POST /api/rooms
    ↓
Backend (roomController)
    ↓
Database (Room.create)
    ↓
Redis (cache live_rooms)
    ↓
Response (room data)
    ↓
Frontend (display room info)
    ↓
Socket.io (create-room event)
    ↓
Room initialized in memory
```

### 3. Chat Flow
```
User types message
    ↓
Frontend (ChatBox)
    ↓
Socket.io emit (chat-message)
    ↓
Backend (chatHandlers)
    ↓
Validation & Rate Limiting
    ↓
Database (Message.create)
    ↓
Socket.io broadcast (new-message)
    ↓
All clients in room receive
    ↓
Frontend updates chat UI
```

### 4. Video Streaming Flow
```
OBS → RTMP Server (Port 1935)
    ↓
Transcoding to HLS
    ↓
HLS Segments (.m3u8, .ts files)
    ↓
Frontend (HlsPlayer)
    ↓
hls.js loads segments
    ↓
Video playback
```

## 🔐 Security Layers

### 1. Authentication
- JWT tokens with expiration
- Password hashing (bcrypt)
- Token validation middleware

### 2. Authorization
- Protected routes
- Room ownership verification
- Streamer-only actions

### 3. Rate Limiting
- API rate limits (100 req/15min)
- Chat rate limits (5 msg/10sec)
- Socket connection limits (10/min per IP)

### 4. Input Validation
- Joi schema validation
- XSS prevention
- SQL injection prevention (parameterized queries)

### 5. CORS
- Whitelist CLIENT_URL
- Credentials support
- Specific methods allowed

## 📊 Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  stream_key VARCHAR(255) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  is_streaming BOOLEAN,
  follower_count INTEGER,
  created_at TIMESTAMP,
  last_login TIMESTAMP
)
```

### Rooms Table
```sql
rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) UNIQUE,
  streamer_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  is_live BOOLEAN,
  viewer_count INTEGER,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
)
```

### Messages Table
```sql
messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id),
  user_id INTEGER REFERENCES users(id),
  username VARCHAR(50),
  content TEXT,
  is_deleted BOOLEAN,
  created_at TIMESTAMP
)
```

### Follows Table
```sql
follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id),
  following_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  UNIQUE(follower_id, following_id)
)
```

## 🔌 Socket.io Events

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `create-room` | `{ roomId }` | Streamer tạo phòng |
| `join-room` | `{ roomId }` | Viewer tham gia |
| `leave-room` | - | Rời phòng |
| `chat-message` | `{ message }` | Gửi tin nhắn |
| `delete-message` | `{ messageId }` | Xóa tin nhắn |
| `clear-chat` | - | Xóa toàn bộ chat |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `new-message` | `{ id, userId, username, message, timestamp }` | Tin nhắn mới |
| `viewer-joined` | `{ userId, username, viewerCount }` | Viewer mới |
| `viewer-left` | `{ userId, username, viewerCount }` | Viewer rời |
| `stream-ended` | `{ reason }` | Stream kết thúc |
| `message-deleted` | `{ messageId }` | Tin nhắn bị xóa |
| `chat-cleared` | - | Chat bị xóa |

## 🚀 Performance Optimizations

### Frontend
- React.memo for components
- useCallback for event handlers
- Lazy loading for routes
- HLS low latency mode
- Debounced search

### Backend
- Redis caching for live rooms
- Connection pooling (PostgreSQL)
- Compression middleware
- Rate limiting
- Efficient database queries

### Database
- Indexes on frequently queried columns
- Soft deletes for messages
- Cleanup jobs for old data

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Redis for shared state
- Socket.io with Redis adapter
- Load balancer ready

### Vertical Scaling
- Connection pooling
- Query optimization
- Caching strategy
- CDN for static assets

## 🔍 Monitoring & Logging

### Winston Logger
- Info, warn, error levels
- File rotation
- Console output (dev)
- Structured logging

### Health Checks
- `/health` endpoint
- Database connection status
- Redis connection status
- Uptime tracking

## 🛠️ Development Tools

### Backend
- nodemon (auto-restart)
- winston (logging)
- joi (validation)
- helmet (security)

### Frontend
- React DevTools
- Redux DevTools (if needed)
- Browser console
- Network inspector

## 📦 Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)         │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼───┐
│ App 1  │      │ App 2  │  (Multiple instances)
└───┬────┘      └────┬───┘
    │                │
    └────────┬───────┘
             │
    ┌────────▼────────┐
    │  Redis Cluster  │  (Shared state)
    └─────────────────┘
             │
    ┌────────▼────────┐
    │   PostgreSQL    │  (Primary + Replicas)
    └─────────────────┘
```

---

**Architecture Type:** Monolithic with microservices-ready structure
**Communication:** REST API + WebSocket (Socket.io)
**Database:** PostgreSQL (Relational)
**Cache:** Redis (In-memory)
**Real-time:** Socket.io
**Video:** HLS (HTTP Live Streaming)

---

Kiến trúc này đảm bảo:
✅ Scalability
✅ Real-time performance
✅ Security
✅ Maintainability
✅ Extensibility


## Roadmap

### v1.1 (Coming soon)
- [ ] Follow/Unfollow users
- [ ] User profiles
- [ ] Stream thumbnails
- [ ] Notifications
- [ ] Emojis/Reactions

### v1.2
- [ ] WebRTC support (lower latency)
- [ ] Mobile app
- [ ] Stream recording
- [ ] Analytics dashboard

### v2.0
- [ ] Multi-streaming
- [ ] Monetization
- [ ] Subscriptions
- [ ] Donations