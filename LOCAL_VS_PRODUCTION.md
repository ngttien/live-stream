# 🔄 Local vs Production - Hướng dẫn Switch

## Tổng quan

Sau khi deploy, bạn sẽ có 2 môi trường:
- **Local**: Chạy trên máy tính của bạn
- **Production**: Chạy trên server (Render + Supabase)

Cả 2 môi trường hoạt động **độc lập** và **không ảnh hưởng** lẫn nhau.

---

## So sánh 2 môi trường

| Thành phần | Local | Production |
|------------|-------|------------|
| **Database** | PostgreSQL local (localhost:5432) | Supabase (cloud) |
| **Redis** | Redis local (localhost:6379) | Upstash (cloud) |
| **Backend** | http://localhost:3000 | https://your-backend.onrender.com |
| **Frontend** | http://localhost:3001 | https://your-frontend.onrender.com |
| **RTMP** | rtmp://localhost:1935/live | rtmp://ngrok-url/live |
| **Data** | Riêng biệt | Riêng biệt |
| **Users** | Riêng biệt | Riêng biệt |
| **Streams** | Riêng biệt | Riêng biệt |

---

## Chạy Local

### Cách 1: Dùng script (Windows)
```bash
# Từ thư mục gốc
scripts\start-local.bat
```

### Cách 2: Manual
```bash
# Terminal 1: Database + Redis
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

### URLs Local
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- RTMP: rtmp://localhost:1935/live

### Environment Variables Local
Backend sử dụng `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/livestream_app
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3001
```

---

## Chạy Production

Production tự động chạy trên Render.com, bạn không cần làm gì!

### URLs Production
- Frontend: https://your-frontend.onrender.com
- Backend: https://your-backend.onrender.com
- RTMP: rtmp://ngrok-url/live (nếu dùng ngrok)

### Environment Variables Production
Đã set trên Render Dashboard:
```env
DATABASE_URL=postgresql://postgres.xxxxx@supabase.com/postgres
REDIS_URL=redis://default:xxx@upstash.io:6379
CLIENT_URL=https://your-frontend.onrender.com
```

---

## Khi nào dùng Local?

✅ **Dùng Local khi:**
- Đang develop tính năng mới
- Đang fix bugs
- Đang test thay đổi
- Không có internet
- Muốn test nhanh

❌ **Không dùng Local khi:**
- Muốn demo cho người khác
- Cần access từ xa
- Cần URL public

---

## Khi nào dùng Production?

✅ **Dùng Production khi:**
- Demo cho người khác
- Cần URL public
- Cần access từ xa
- Muốn test với real users
- Muốn share với bạn bè

❌ **Không dùng Production khi:**
- Đang develop (có thể break production)
- Đang test tính năng mới chưa stable

---

## Workflow khuyến nghị

### 1. Develop Local
```bash
# Chạy local
scripts\start-local.bat

# Code, test, fix bugs
# ...

# Commit changes
git add .
git commit -m "Add new feature"
```

### 2. Test Local
```bash
# Test đầy đủ trên local
# - Đăng ký user
# - Tạo room
# - Test chat
# - Test streaming
```

### 3. Deploy Production
```bash
# Push lên GitHub
git push origin main

# Render tự động deploy
# Đợi 5-10 phút
```

### 4. Test Production
```bash
# Test production
node scripts/test-production.js https://your-backend.onrender.com

# Test manual trên browser
# - Mở frontend URL
# - Test các tính năng
```

---

## Troubleshooting

### Local không chạy

**Database error:**
```bash
# Check PostgreSQL đang chạy
docker ps

# Nếu không chạy
docker-compose up postgres redis
```

**Port already in use:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

**Module not found:**
```bash
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install

cd ../rtmp-server
npm install
```

### Production không chạy

**Backend sleep:**
- Render free tier sleep sau 15 phút
- Đợi 30s để wake up
- Hoặc dùng cron-job.org để ping

**Database connection error:**
- Check Supabase project đang active
- Verify DATABASE_URL đúng
- Check password không có ký tự đặc biệt

**Frontend không connect backend:**
- Check CORS settings (CLIENT_URL)
- Verify REACT_APP_API_URL đúng
- Check browser console

---

## Tips & Tricks

### Tip 1: Dùng 2 browsers
- Chrome: Local development
- Firefox: Production testing

### Tip 2: Bookmark URLs
Tạo bookmarks:
- Local Frontend
- Local Backend Health
- Production Frontend
- Production Backend Health
- Render Dashboard
- Supabase Dashboard

### Tip 3: Separate Git branches
```bash
# Development branch
git checkout -b dev

# Production branch
git checkout main
```

### Tip 4: Environment-specific configs
```bash
# backend/.env.local (local)
DATABASE_URL=postgresql://localhost...

# backend/.env.production (không commit)
DATABASE_URL=postgresql://supabase...
```

### Tip 5: Quick switch
```bash
# Local
npm run dev

# Production
git push origin main
```

---

## Checklist hàng ngày

### Morning (Start work)
- [ ] Pull latest code: `git pull`
- [ ] Start local: `scripts\start-local.bat`
- [ ] Check local working
- [ ] Check production still working

### During work
- [ ] Code on local
- [ ] Test on local
- [ ] Commit frequently
- [ ] Don't push broken code

### Evening (End work)
- [ ] Test everything on local
- [ ] Commit all changes
- [ ] Push to GitHub (if stable)
- [ ] Stop local services
- [ ] Check production auto-deployed

---

## Data Management

### Local Data
```bash
# Reset local database
cd backend
node scripts/migrate.js

# Seed local data
node scripts/seed.js
```

### Production Data
```bash
# Backup production
# Vào Supabase Dashboard → Database → Backups

# Reset production (CAREFUL!)
node scripts/migrate-remote.js "PRODUCTION_URL"
```

**⚠️ Lưu ý:** Local và Production có data riêng biệt!

---

## Security

### Local
- ✅ Dùng password đơn giản OK
- ✅ Dùng JWT_SECRET đơn giản OK
- ✅ Không cần HTTPS

### Production
- ❌ KHÔNG dùng password đơn giản
- ❌ KHÔNG dùng JWT_SECRET đơn giản
- ✅ Phải dùng HTTPS (Render tự động)
- ✅ Phải dùng strong passwords

---

## Kết luận

**Local và Production hoàn toàn độc lập:**
- Khác database
- Khác users
- Khác data
- Không ảnh hưởng lẫn nhau

**Workflow:**
1. Develop trên Local
2. Test trên Local
3. Push lên GitHub
4. Production tự động deploy
5. Test trên Production

**Lợi ích:**
- ✅ Develop an toàn (không break production)
- ✅ Test thoải mái
- ✅ Production luôn stable
- ✅ Có thể rollback dễ dàng

---

**Happy coding! 🚀**
