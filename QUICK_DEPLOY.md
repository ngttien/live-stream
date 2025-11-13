# ⚡ Quick Deploy - 30 phút

Hướng dẫn deploy nhanh nhất có thể.

---

## Bước 1: Database (5 phút)

1. **Supabase**: https://supabase.com
   - New Project → Name: `livestream-production`
   - Password: Tạo mạnh, lưu lại
   - Region: Singapore
   
2. **Lấy Connection String**:
   - Settings → Database → Connection string → URI
   - Copy: `postgresql://postgres.xxxxx:PASSWORD@...`

3. **Chạy Migration**:
   ```bash
   cd backend
   node scripts/migrate-remote.js "PASTE_CONNECTION_STRING_HERE"
   ```

✅ Done!

---

## Bước 2: Redis (3 phút)

1. **Upstash**: https://upstash.com
   - Create Database
   - Name: `livestream-redis`
   - Region: Singapore
   
2. **Copy URL**: `redis://default:PASSWORD@...`

✅ Done!

---

## Bước 3: Backend (10 phút)

1. **Render**: https://render.com
   - New → Web Service
   - Connect GitHub repo
   
2. **Config**:
   - Name: `livestream-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   
3. **Environment Variables** (copy-paste):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=YOUR_SUPABASE_URL
   REDIS_URL=YOUR_UPSTASH_URL
   JWT_SECRET=change_this_to_random_string_12345
   JWT_EXPIRE=7d
   CLIENT_URL=https://livestream-frontend.onrender.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=5242880
   LOG_LEVEL=info
   ```

4. **Create Web Service** → Đợi deploy

5. **Lưu URL**: `https://livestream-backend-xxxx.onrender.com`

✅ Done!

---

## Bước 4: Frontend (10 phút)

1. **Render**: New → Static Site
   - Same repo
   
2. **Config**:
   - Name: `livestream-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `build`
   
3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   REACT_APP_SOCKET_URL=https://YOUR-BACKEND-URL.onrender.com
   REACT_APP_HLS_BASE_URL=http://localhost:8000
   ```

4. **Create Static Site** → Đợi deploy

5. **Lưu URL**: `https://livestream-frontend-xxxx.onrender.com`

✅ Done!

---

## Bước 5: Update CORS (2 phút)

1. Quay lại Backend service
2. Environment → Edit `CLIENT_URL`
3. Paste Frontend URL
4. Save Changes

✅ Done!

---

## Bước 6: Test (5 phút)

1. **Mở Frontend URL**
2. **Đăng ký tài khoản mới**
3. **Đăng nhập**
4. **Tạo phòng stream**
5. **Test chat**

✅ Production đã live!

---

## Bước 7: RTMP (Optional)

**Cách nhanh nhất**: Chạy local + Ngrok

```bash
# Terminal 1: RTMP
cd rtmp-server
npm start

# Terminal 2: Ngrok
ngrok tcp 1935
```

Copy ngrok URL → Paste vào OBS

✅ Done!

---

## 🎯 Kết quả

**Production:**
- Frontend: `https://livestream-frontend-xxxx.onrender.com`
- Backend: `https://livestream-backend-xxxx.onrender.com`

**Local vẫn chạy:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start

# Terminal 3
cd rtmp-server && npm start
```

---

## ⚠️ Lưu ý

1. **Render Free**: Sleep sau 15 phút → Dùng cron-job.org để ping
2. **Ngrok Free**: URL thay đổi mỗi lần restart
3. **Supabase**: 500MB limit
4. **Upstash**: 10K commands/day

---

## 🆘 Lỗi thường gặp

**Backend không start:**
- Check DATABASE_URL format
- Verify password không có ký tự đặc biệt

**Frontend không connect:**
- Check CORS (CLIENT_URL)
- Verify API URL đúng

**Database error:**
- Verify đã chạy migration
- Check Supabase project active

---

**Xong! Chỉ 30 phút! 🚀**
