# 🚀 Hướng dẫn Deploy lên Server Free (Render + Supabase)

## Tổng quan
Deploy app **HOÀN TOÀN MIỄN PHÍ** trong 30 phút, local vẫn chạy bình thường.

**Chiến lược:**
- Local: Dùng PostgreSQL + Redis local (như hiện tại)
- Production: Dùng Supabase (PostgreSQL) + Upstash (Redis) - cả 2 đều FREE

---

## 📋 Checklist trước khi bắt đầu

- [ ] Code đã push lên GitHub
- [ ] Local đang chạy ổn
- [ ] Có tài khoản GitHub
- [ ] Có email để đăng ký các dịch vụ

---

## Bước 1: Setup Database (Supabase - FREE)

### 1.1. Tạo tài khoản Supabase
1. Truy cập: https://supabase.com
2. Click **Start your project** → Đăng nhập bằng GitHub
3. Click **New Project**

### 1.2. Tạo Database
- **Name**: `livestream-production`
- **Database Password**: Tạo password mạnh (VD: `MyStr0ngP@ss2024`)
- **Region**: Singapore (gần Việt Nam nhất)
- **Plan**: Free (500MB, đủ dùng)

### 1.3. Lấy Connection String
1. Vào **Settings** → **Database**
2. Tìm **Connection string** → **URI**
3. Copy và lưu lại:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### 1.4. Chạy Migration
```bash
# Từ thư mục gốc của project
cd backend
node scripts/migrate-remote.js "postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

✅ Database production đã sẵn sàng!

---

## Bước 2: Setup Redis (Upstash - FREE)

### 2.1. Tạo tài khoản Upstash
1. Truy cập: https://upstash.com
2. Đăng nhập bằng GitHub
3. Click **Create Database**

### 2.2. Tạo Redis Database
- **Name**: `livestream-redis`
- **Type**: Regional
- **Region**: Singapore
- **Plan**: Free (10,000 commands/day)

### 2.3. Lấy Redis REST API Credentials (Khuyến nghị)
1. Click vào database vừa tạo
2. Scroll xuống **REST API** section
3. Copy 2 values:
   - **UPSTASH_REDIS_REST_URL**: `https://apn1-xxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXXXxxx...`

**Lưu ý:** REST API hoạt động tốt hơn trên Render free tier so với Redis protocol.

✅ Redis production đã sẵn sàng!

---

## Bước 3: Deploy Backend (Render.com - FREE)

### 3.1. Tạo tài khoản Render
1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub
3. Click **New** → **Web Service**

### 3.2. Connect Repository
1. Click **Connect account** → Authorize GitHub
2. Chọn repository của bạn
3. Click **Connect**

### 3.3. Cấu hình Backend Service
- **Name**: `livestream-backend`
- **Region**: Singapore
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 3.4. Thêm Environment Variables
Click **Add Environment Variable** và thêm:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
UPSTASH_REDIS_REST_URL=https://apn1-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
CLIENT_URL=https://livestream-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
LOG_LEVEL=info
```

**Lưu ý quan trọng:**
- Dùng **UPSTASH_REDIS_REST_URL** và **UPSTASH_REDIS_REST_TOKEN** (REST API)
- REST API hoạt động tốt hơn trên Render free tier
- Nếu gặp lỗi Redis, xem file `TROUBLESHOOT_REDIS.md`

### 3.5. Deploy
1. Click **Create Web Service**
2. Đợi 5-10 phút để build và deploy
3. Lưu lại URL backend: `https://livestream-backend.onrender.com`

✅ Backend đã live!

---

## Bước 4: Deploy Frontend (Render.com - FREE)

### 4.1. Tạo Static Site
1. Vào Render Dashboard
2. Click **New** → **Static Site**
3. Chọn cùng repository

### 4.2. Cấu hình Frontend
- **Name**: `livestream-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 4.3. Thêm Environment Variables
```
REACT_APP_API_URL=https://livestream-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://livestream-backend.onrender.com
REACT_APP_HLS_BASE_URL=http://localhost:8000
```

### 4.4. Deploy
1. Click **Create Static Site**
2. Đợi 5-10 phút
3. Lưu lại URL: `https://livestream-frontend.onrender.com`

✅ Frontend đã live!

---

## Bước 5: Cập nhật CORS Backend

### 5.1. Update Environment Variable
Quay lại Backend service trên Render:
1. Vào **Environment**
2. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://livestream-frontend.onrender.com
   ```
3. Click **Save Changes** (service sẽ tự động restart)

---

## Bước 6: Setup RTMP Server (Local + Ngrok)

**Lưu ý:** Render free tier không hỗ trợ RTMP tốt. Giải pháp tốt nhất là chạy RTMP local + ngrok.

### 6.1. Cài đặt Ngrok
1. Tải ngrok: https://ngrok.com/download
2. Đăng ký tài khoản free
3. Lấy authtoken và chạy:
   ```bash
   ngrok authtoken YOUR_AUTH_TOKEN
   ```

### 6.2. Chạy RTMP Server Local
```bash
cd rtmp-server
npm install
npm start
```

### 6.3. Expose RTMP qua Ngrok
```bash
# Terminal mới
ngrok tcp 1935
```

Lưu lại URL: `tcp://0.tcp.ngrok.io:12345`

### 6.4. Cấu hình OBS
- **Server**: `rtmp://0.tcp.ngrok.io:12345/live`
- **Stream Key**: Copy từ dashboard

---

## Bước 7: Kiểm tra Production

### 7.1. Test Backend
```bash
curl https://livestream-backend.onrender.com/api/health
```

Kết quả mong đợi:
```json
{"status":"ok","timestamp":"..."}
```

### 7.2. Test Frontend
1. Mở: `https://livestream-frontend.onrender.com`
2. Đăng ký tài khoản mới
3. Tạo phòng stream
4. Test chat

### 7.3. Test Streaming
1. Cấu hình OBS với ngrok URL
2. Start streaming
3. Xem stream trên production site

---

## Bước 8: Giữ Local chạy ổn

### 8.1. Tạo file .env.local (không commit)
```bash
cd backend
cp .env .env.local
```

### 8.2. Update .gitignore
Đảm bảo `.env.local` không bị commit:
```
.env.local
.env.production
```

### 8.3. Chạy Local
```bash
# Terminal 1: PostgreSQL + Redis (nếu dùng Docker)
docker-compose up postgres redis

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm start

# Terminal 4: RTMP
cd rtmp-server
npm start
```

Local vẫn dùng:
- Database: `postgresql://postgres:password123@localhost:5432/livestream_app`
- Redis: `redis://localhost:6379`
- Frontend: `http://localhost:3001`

---

## 🎯 Tổng kết

### URLs Production
- **Frontend**: `https://livestream-frontend.onrender.com`
- **Backend**: `https://livestream-backend.onrender.com`
- **RTMP**: `rtmp://0.tcp.ngrok.io:12345/live` (ngrok)

### URLs Local
- **Frontend**: `http://localhost:3001`
- **Backend**: `http://localhost:3000`
- **RTMP**: `rtmp://localhost:1935/live`

### Lưu ý quan trọng
1. **Render Free Tier**: Service sleep sau 15 phút không dùng, khởi động lại mất ~30s
2. **Ngrok Free**: URL thay đổi mỗi lần restart, cần update OBS
3. **Database**: Supabase free có giới hạn 500MB
4. **Redis**: Upstash free có 10,000 commands/day

---

## 🔧 Troubleshooting

### Backend không start
1. Check logs trên Render Dashboard
2. Verify DATABASE_URL đúng format
3. Test connection string local trước

### Frontend không connect backend
1. Check CORS settings
2. Verify REACT_APP_API_URL đúng
3. Check browser console

### RTMP không stream được
1. Verify ngrok đang chạy
2. Check OBS settings
3. Test với local RTMP trước

### Database connection error
1. Verify password không có ký tự đặc biệt
2. Check Supabase project đang active
3. Test connection với psql

---

## 📊 Chi phí

| Service | Plan | Giới hạn | Chi phí |
|---------|------|----------|---------|
| Render Backend | Free | Sleep sau 15 phút | $0 |
| Render Frontend | Free | 100GB bandwidth | $0 |
| Supabase | Free | 500MB storage | $0 |
| Upstash Redis | Free | 10K commands/day | $0 |
| Ngrok | Free | 1 tunnel, URL thay đổi | $0 |
| **TỔNG** | | | **$0/tháng** |

---

## 🚀 Nâng cấp sau này

Khi có traffic cao hơn, xem xét:
1. **Render Paid**: $7/tháng - không sleep, nhiều resource hơn
2. **Railway**: $5/tháng credit - tốt cho RTMP
3. **Fly.io**: Free tier tốt hơn - 3 VMs
4. **Dedicated RTMP**: VPS riêng cho streaming

---

**Chúc bạn deploy thành công! 🎉**
