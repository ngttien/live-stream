# ✅ Checklist Deploy Production

## Trước khi deploy

- [ ] Code đã test kỹ trên local
- [ ] Đã commit và push lên GitHub
- [ ] Đã đọc file DEPLOY_GUIDE.md
- [ ] Có tài khoản GitHub

---

## Setup Database (Supabase)

- [ ] Đã tạo tài khoản Supabase
- [ ] Đã tạo project mới
- [ ] Đã lưu Database Password
- [ ] Đã copy Connection String
- [ ] Đã chạy migration: `node scripts/migrate-remote.js "CONNECTION_STRING"`
- [ ] Đã verify tables được tạo (vào Supabase → Table Editor)

---

## Setup Redis (Upstash)

- [ ] Đã tạo tài khoản Upstash
- [ ] Đã tạo Redis database
- [ ] Đã copy Redis URL
- [ ] Đã test connection (optional)

---

## Deploy Backend (Render)

- [ ] Đã tạo tài khoản Render
- [ ] Đã connect GitHub repository
- [ ] Đã tạo Web Service
- [ ] Đã set Root Directory = `backend`
- [ ] Đã thêm tất cả Environment Variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=3000
  - [ ] DATABASE_URL (từ Supabase)
  - [ ] REDIS_URL (từ Upstash)
  - [ ] JWT_SECRET (tạo mới, mạnh)
  - [ ] JWT_EXPIRE=7d
  - [ ] CLIENT_URL (sẽ update sau)
  - [ ] RATE_LIMIT_WINDOW_MS=900000
  - [ ] RATE_LIMIT_MAX_REQUESTS=100
  - [ ] MAX_FILE_SIZE=5242880
  - [ ] LOG_LEVEL=info
- [ ] Deploy thành công
- [ ] Đã lưu Backend URL
- [ ] Test health endpoint: `curl https://YOUR-BACKEND.onrender.com/api/health`

---

## Deploy Frontend (Render)

- [ ] Đã tạo Static Site
- [ ] Đã set Root Directory = `frontend`
- [ ] Đã set Build Command = `npm install && npm run build`
- [ ] Đã set Publish Directory = `build`
- [ ] Đã thêm Environment Variables:
  - [ ] REACT_APP_API_URL (Backend URL + /api)
  - [ ] REACT_APP_SOCKET_URL (Backend URL)
  - [ ] REACT_APP_HLS_BASE_URL=http://localhost:8000
- [ ] Deploy thành công
- [ ] Đã lưu Frontend URL
- [ ] Test mở website

---

## Update CORS

- [ ] Quay lại Backend service
- [ ] Update CLIENT_URL với Frontend URL
- [ ] Save và đợi restart
- [ ] Test lại frontend có connect được backend không

---

## Setup RTMP (Local + Ngrok)

- [ ] Đã cài đặt Ngrok
- [ ] Đã đăng ký tài khoản Ngrok
- [ ] Đã setup authtoken
- [ ] RTMP server chạy local: `cd rtmp-server && npm start`
- [ ] Ngrok expose port 1935: `ngrok tcp 1935`
- [ ] Đã lưu Ngrok URL
- [ ] Đã cấu hình OBS với Ngrok URL

---

## Testing Production

### Backend
- [ ] Health check OK: `/api/health`
- [ ] Register user mới
- [ ] Login thành công
- [ ] Get user profile

### Frontend
- [ ] Website load được
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Tạo phòng stream
- [ ] Chat hoạt động

### Streaming
- [ ] OBS connect được RTMP
- [ ] Start streaming thành công
- [ ] Video hiển thị trên website
- [ ] Viewer count cập nhật
- [ ] Chat realtime hoạt động

---

## Verify Local vẫn chạy

- [ ] Local database vẫn hoạt động
- [ ] Local Redis vẫn hoạt động
- [ ] Backend local chạy: `cd backend && npm run dev`
- [ ] Frontend local chạy: `cd frontend && npm start`
- [ ] RTMP local chạy: `cd rtmp-server && npm start`
- [ ] Test full flow trên local

---

## Documentation

- [ ] Đã lưu tất cả URLs vào file riêng
- [ ] Đã lưu credentials an toàn
- [ ] Đã update README với production URLs (nếu cần)
- [ ] Đã note lại các giới hạn free tier

---

## Monitoring

- [ ] Setup Render notifications (email)
- [ ] Bookmark Render dashboard
- [ ] Bookmark Supabase dashboard
- [ ] Bookmark Upstash dashboard
- [ ] Setup cron-job.org để ping backend (tránh sleep)

---

## Optional: Keep Backend Awake

Render free tier sleep sau 15 phút. Để tránh:

- [ ] Đăng ký cron-job.org
- [ ] Tạo cron job ping `/api/health` mỗi 10 phút
- [ ] Verify backend không sleep

---

## Troubleshooting

Nếu gặp lỗi:

1. **Backend không start**
   - [ ] Check logs trên Render
   - [ ] Verify DATABASE_URL format
   - [ ] Test connection string local

2. **Frontend không connect**
   - [ ] Check CORS settings
   - [ ] Verify API URL đúng
   - [ ] Check browser console

3. **Database error**
   - [ ] Verify Supabase project active
   - [ ] Check connection string
   - [ ] Verify tables đã được tạo

4. **RTMP không stream**
   - [ ] Verify ngrok đang chạy
   - [ ] Check OBS settings
   - [ ] Test local RTMP trước

---

## 🎉 Hoàn thành!

Khi tất cả checkbox đã tick:
- ✅ Production đang chạy
- ✅ Local vẫn hoạt động bình thường
- ✅ Có thể switch giữa local và production dễ dàng

**URLs của bạn:**
- Production Frontend: `https://_____.onrender.com`
- Production Backend: `https://_____.onrender.com`
- Local Frontend: `http://localhost:3001`
- Local Backend: `http://localhost:3000`

---

**Lưu ý:** Ghi lại tất cả URLs và credentials vào file riêng, KHÔNG commit lên GitHub!
