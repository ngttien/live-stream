# 🚀 Setup Nhanh - Streemly

## Yêu cầu

- Node.js >= 18
- PostgreSQL >= 14
- Redis

## Cài đặt nhanh (5 phút)

### 1. Clone & Install

```bash
git clone <repo-url>
cd livestream-app

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../rtmp-server && npm install
```

### 2. Setup Database

```bash
# Tạo database
createdb livestream_app

# Chạy migration
cd backend
psql -U postgres -d livestream_app -f db/schema.sql
```

### 3. Cấu hình Environment

**backend/.env:**

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password123@localhost:5432/livestream_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3001
```

**frontend/.env:**

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_FLV_BASE_URL=http://localhost:8000
```

### 4. Chạy Services

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

**Terminal 3 - RTMP Server:**

```bash
cd rtmp-server
npm start
```

### 5. Truy cập

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- RTMP: rtmp://localhost:1935/live

## Đăng ký & Stream

1. Vào http://localhost:3001
2. Đăng ký tài khoản
3. Tạo phòng stream
4. Copy stream key
5. Cấu hình OBS:
   - Server: `rtmp://localhost:1935/live`
   - Stream Key: (paste từ dashboard)
6. Start streaming!

## Troubleshooting

### Port đã được sử dụng?

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Database connection failed?

```bash
# Kiểm tra PostgreSQL
pg_isready

# Kiểm tra database
psql -U postgres -l | grep livestream_app
```

### Redis connection failed?

```bash
# Kiểm tra Redis
redis-cli ping

# Khởi động Redis
redis-server
```

## Tính năng chính

✅ Đăng ký/Đăng nhập với JWT
✅ Tạo & quản lý phòng stream
✅ Stream video với độ trễ thấp (FLV)
✅ Chat realtime với Socket.io
✅ Đếm viewer realtime
✅ Tìm kiếm streams
✅ Dark/Light theme
✅ Responsive mobile

## Rate Limits

- API requests: 300/15 phút
- Login attempts: 10/15 phút
- Tạo phòng: 10/giờ

## Docs

- [README.md](README.md) - Tổng quan
- [ARCHITECTURE.md](ARCHITECTURE.md) - Kiến trúc
- [FAQ.md](FAQ.md) - Câu hỏi thường gặp
