# 🚀 START HERE - Hướng dẫn Deploy

## Bạn muốn làm gì?

### 1️⃣ Chạy Local (Development)
👉 Đọc file: `README.md` → Phần "Quick Start"

```bash
# Quick start
docker-compose up postgres redis
cd backend && npm run dev
cd frontend && npm start
cd rtmp-server && npm start
```

---

### 2️⃣ Deploy lên Server Free
👉 **Bắt đầu từ đây!**

#### Bước 1: Check readiness
```bash
node scripts/deploy-check.js
```

#### Bước 2: Chọn hướng dẫn phù hợp

**Nếu bạn muốn deploy NHANH (30 phút):**
📄 Đọc file: `QUICK_DEPLOY.md`

**Nếu bạn muốn hướng dẫn CHI TIẾT:**
📄 Đọc file: `DEPLOY_GUIDE.md`

**Nếu bạn muốn checklist đầy đủ:**
📄 Đọc file: `DEPLOY_CHECKLIST.md`

**Nếu bạn muốn so sánh các platform:**
📄 Đọc file: `DEPLOY_FREE.md`

#### Bước 3: Deploy
Follow hướng dẫn trong file bạn chọn ở Bước 2

#### Bước 4: Test production
```bash
node scripts/test-production.js https://your-backend.onrender.com
```

---

### 3️⃣ Hiểu về Local vs Production
👉 Đọc file: `LOCAL_VS_PRODUCTION.md`

Giải thích:
- Sự khác biệt giữa Local và Production
- Khi nào dùng Local, khi nào dùng Production
- Workflow khuyến nghị
- Tips & tricks

---

## 📚 Tất cả các file hướng dẫn

### Deploy
- `QUICK_DEPLOY.md` - Deploy nhanh 30 phút ⚡
- `DEPLOY_GUIDE.md` - Hướng dẫn chi tiết 📖
- `DEPLOY_CHECKLIST.md` - Checklist đầy đủ ✅
- `DEPLOY_FREE.md` - So sánh platforms 🆓
- `DEPLOY_RENDER_SIMPLE.md` - Render đơn giản 🎯

### Development
- `README.md` - Tổng quan project
- `ARCHITECTURE.md` - Kiến trúc hệ thống
- `FAQ.md` - Câu hỏi thường gặp
- `LOCAL_VS_PRODUCTION.md` - Local vs Production

### Scripts
- `scripts/deploy-check.js` - Check readiness
- `scripts/test-production.js` - Test production
- `scripts/start-local.bat` - Start local (Windows)

---

## 🎯 Roadmap Deploy

```
1. Check readiness
   ↓
2. Setup Database (Supabase)
   ↓
3. Setup Redis (Upstash)
   ↓
4. Deploy Backend (Render)
   ↓
5. Deploy Frontend (Render)
   ↓
6. Update CORS
   ↓
7. Setup RTMP (Ngrok)
   ↓
8. Test Production
   ↓
9. Done! 🎉
```

---

## ⚡ Quick Commands

### Check readiness
```bash
node scripts/deploy-check.js
```

### Test production
```bash
node scripts/test-production.js https://your-backend.onrender.com
```

### Start local (Windows)
```bash
scripts\start-local.bat
```

### Start local (Manual)
```bash
# Terminal 1
docker-compose up postgres redis

# Terminal 2
cd backend && npm run dev

# Terminal 3
cd frontend && npm start

# Terminal 4
cd rtmp-server && npm start
```

---

## 🆘 Cần giúp đỡ?

### Lỗi khi chạy local
👉 Đọc: `FAQ.md`

### Lỗi khi deploy
👉 Đọc: `DEPLOY_GUIDE.md` → Phần "Troubleshooting"

### Không biết bắt đầu từ đâu
👉 Đọc: `QUICK_DEPLOY.md` (đơn giản nhất)

### Muốn hiểu sâu hơn
👉 Đọc: `ARCHITECTURE.md`

---

## 📊 Tổng quan Platform

| Platform | Mục đích | Chi phí | Link |
|----------|----------|---------|------|
| **Supabase** | Database | Free 500MB | https://supabase.com |
| **Upstash** | Redis | Free 10K/day | https://upstash.com |
| **Render** | Backend + Frontend | Free | https://render.com |
| **Ngrok** | RTMP tunnel | Free | https://ngrok.com |

**Tổng chi phí: $0/tháng** 🎉

---

## ✅ Checklist nhanh

Trước khi deploy:
- [ ] Code chạy ổn trên local
- [ ] Đã commit và push lên GitHub
- [ ] Đã đọc QUICK_DEPLOY.md hoặc DEPLOY_GUIDE.md
- [ ] Đã chạy `node scripts/deploy-check.js`

Sau khi deploy:
- [ ] Backend health check OK
- [ ] Frontend load được
- [ ] Đăng ký user mới thành công
- [ ] Chat hoạt động
- [ ] Streaming hoạt động (nếu setup RTMP)

---

## 🎓 Learning Path

### Beginner
1. Chạy local theo README.md
2. Hiểu cách app hoạt động
3. Deploy theo QUICK_DEPLOY.md
4. Test production

### Intermediate
1. Đọc ARCHITECTURE.md
2. Hiểu Local vs Production
3. Customize features
4. Deploy changes

### Advanced
1. Optimize performance
2. Add new features
3. Scale infrastructure
4. Monitor production

---

## 🚀 Next Steps

Sau khi deploy thành công:

1. **Share với bạn bè**
   - Gửi production URL
   - Invite họ test

2. **Monitor**
   - Bookmark Render dashboard
   - Bookmark Supabase dashboard
   - Setup cron-job.org (keep backend awake)

3. **Improve**
   - Add new features
   - Fix bugs
   - Optimize performance

4. **Scale** (khi cần)
   - Upgrade Render plan ($7/month)
   - Upgrade Supabase plan
   - Use dedicated RTMP server

---

## 💡 Pro Tips

1. **Develop trên Local, Deploy lên Production**
   - Không develop trực tiếp trên production
   - Test kỹ trên local trước khi push

2. **Commit thường xuyên**
   - Commit sau mỗi feature
   - Push khi code stable

3. **Backup data**
   - Supabase có auto backup
   - Download backup định kỳ

4. **Monitor logs**
   - Check Render logs thường xuyên
   - Fix errors ngay khi phát hiện

5. **Keep dependencies updated**
   - Update npm packages định kỳ
   - Test sau khi update

---

## 🎉 Kết luận

**Bạn đã sẵn sàng!**

1. Chọn hướng dẫn phù hợp (QUICK_DEPLOY.md hoặc DEPLOY_GUIDE.md)
2. Follow từng bước
3. Deploy thành công
4. Enjoy! 🚀

**Chúc bạn deploy thành công!**

---

<div align="center">

**Questions?** Đọc FAQ.md

**Issues?** Check DEPLOY_GUIDE.md → Troubleshooting

**Ready?** Start with QUICK_DEPLOY.md

</div>
