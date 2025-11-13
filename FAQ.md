# FAQ - Câu hỏi thường gặp

## 🔧 Cài đặt & Cấu hình

### Q: Làm sao để cài đặt PostgreSQL?
**A:** 
- **Windows:** Download từ postgresql.org
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

### Q: Làm sao để cài đặt Redis?
**A:**
- **Windows:** Download từ github.com/microsoftarchive/redis
- **Mac:** `brew install redis`
- **Linux:** `sudo apt-get install redis-server`

### Q: Port 3000 hoặc 3001 đã được sử dụng?
**A:**
```bash
# Tìm process đang dùng port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Q: Làm sao để thay đổi port?
**A:**
- **Backend:** Sửa `PORT` trong `backend/.env`
- **Frontend:** Sửa trong `package.json` script: `"start": "PORT=3002 react-scripts start"`

---

## 🔐 Authentication

### Q: Tại sao phải dùng email thay vì username để login?
**A:** Backend API được thiết kế sử dụng email làm unique identifier cho authentication. Email đảm bảo tính duy nhất tốt hơn username.

### Q: Token hết hạn sau bao lâu?
**A:** Mặc định là 7 ngày (cấu hình trong `JWT_EXPIRE` ở backend/.env)

### Q: Làm sao để đổi mật khẩu?
**A:** Hiện tại chưa có UI, nhưng có API endpoint:
```javascript
PUT /api/auth/password
Body: { currentPassword, newPassword }
```

### Q: Quên mật khẩu thì làm sao?
**A:** Tính năng reset password chưa được implement. Có thể reset trực tiếp trong database hoặc tạo tài khoản mới.

---

## 🎥 Streaming

### Q: Tại sao video không phát?
**A:** Kiểm tra:
1. ✅ OBS đã start streaming chưa?
2. ✅ Stream key đúng chưa?
3. ✅ RTMP server đang chạy chưa?
4. ✅ Room đã được tạo chưa?

### Q: Làm sao để setup RTMP server?
**A:** Có 2 options:

**Option 1: nginx-rtmp**
```bash
# Install nginx with rtmp module
# Config file:
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            hls on;
            hls_path /tmp/hls;
        }
    }
}
```

**Option 2: node-media-server**
```bash
npm install node-media-server
# Tạo file server.js và config
```

### Q: Video bị lag hoặc buffer?
**A:**
- Giảm bitrate trong OBS (2500-3500 kbps)
- Kiểm tra internet connection
- HLS có độ trễ tự nhiên 5-10 giây

### Q: Làm sao để giảm độ trễ?
**A:**
- Sử dụng WebRTC thay vì HLS (cần implement thêm)
- Giảm HLS segment duration
- Sử dụng Low Latency HLS (LL-HLS)

---

## 💬 Chat

### Q: Chat không hoạt động?
**A:** Kiểm tra:
1. ✅ Đã đăng nhập chưa?
2. ✅ Socket.io connected chưa? (xem console log)
3. ✅ Backend đang chạy chưa?
4. ✅ Token còn hạn chưa?

### Q: Tin nhắn không gửi được?
**A:** Có thể bị rate limit (5 tin nhắn / 10 giây). Đợi một chút rồi thử lại.

### Q: Làm sao để ban user?
**A:** Tính năng ban đã có API nhưng chưa có UI:
```javascript
POST /api/streams/:roomId/ban/:userId
```

### Q: Chat history lưu bao lâu?
**A:** Messages được lưu trong database. Có cleanup job xóa messages cũ hơn 7 ngày.

---

## 🐛 Lỗi thường gặp

### Q: "Database connection failed"
**A:**
```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready

# Kiểm tra database tồn tại
psql -U postgres -l | grep livestream_app

# Tạo database nếu chưa có
createdb livestream_app

# Kiểm tra DATABASE_URL trong .env
```

### Q: "Redis connection failed"
**A:**
```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Khởi động Redis
redis-server

# Kiểm tra REDIS_URL trong .env
```

### Q: "JWT malformed" hoặc "Invalid token"
**A:**
```javascript
// Xóa token cũ
localStorage.clear()
// Đăng nhập lại
```

### Q: "CORS error"
**A:**
- Kiểm tra `CLIENT_URL` trong backend/.env
- Phải là `http://localhost:3001` (không có trailing slash)
- Restart backend sau khi đổi

### Q: "Cannot find module"
**A:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 UI/UX

### Q: Làm sao để thay đổi theme/màu sắc?
**A:** Sửa CSS variables trong `frontend/src/assets/style.css`:
```css
:root {
  --yt-bg: #0f0f0f;
  --yt-surface: #212121;
  --yt-blue: #3ea6ff;
  --yt-red: #ff0000;
}
```

### Q: Responsive trên mobile chưa?
**A:** Đã có basic responsive nhưng chưa optimize hoàn toàn. Có thể cải thiện thêm.

### Q: Làm sao để thêm emoji vào chat?
**A:** Hiện tại chưa có emoji picker. Có thể:
1. Copy/paste emoji từ bàn phím
2. Implement emoji picker library (emoji-mart)

---

## 🔍 Development

### Q: Làm sao để debug?
**A:**
- **Frontend:** Browser DevTools (F12) → Console & Network tabs
- **Backend:** Check terminal logs
- **Database:** `psql -U postgres -d livestream_app`
- **Redis:** `redis-cli monitor`

### Q: Làm sao để test API?
**A:**
```bash
# Sử dụng curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Hoặc dùng Postman/Insomnia
```

### Q: Làm sao để xem database?
**A:**
```bash
# psql
psql -U postgres -d livestream_app

# Xem tables
\dt

# Query
SELECT * FROM users;

# Hoặc dùng pgAdmin, DBeaver
```

### Q: Làm sao để reset database?
**A:**
```bash
# Drop và tạo lại
dropdb livestream_app
createdb livestream_app

# Chạy lại migration
cd backend
npm run migrate
npm run seed  # optional
```

---

## 🚀 Deployment

### Q: Làm sao để deploy lên production?
**A:**
1. Build frontend: `npm run build`
2. Setup production database
3. Setup production Redis
4. Configure environment variables
5. Use PM2 or Docker
6. Setup nginx reverse proxy
7. Enable HTTPS

### Q: Cần thay đổi gì cho production?
**A:**
- Đổi `JWT_SECRET` thành random string mạnh
- Đổi `NODE_ENV=production`
- Setup proper CORS
- Enable HTTPS
- Setup CDN cho static files
- Configure proper logging
- Setup monitoring (PM2, New Relic)

### Q: Làm sao để scale?
**A:**
- Horizontal: Multiple app instances + Load balancer
- Redis cluster cho shared state
- PostgreSQL replication
- CDN cho video segments
- Separate RTMP servers

---

## 📊 Performance

### Q: Làm sao để tăng performance?
**A:**
- Enable Redis caching
- Optimize database queries (indexes)
- Use CDN
- Enable compression
- Lazy load components
- Optimize images

### Q: Bao nhiêu concurrent users có thể handle?
**A:** Phụ thuộc vào:
- Server resources
- Database connections
- Redis capacity
- Network bandwidth

Với setup mặc định: ~100-500 concurrent users

---

## 🔒 Security

### Q: Ứng dụng có an toàn không?
**A:** Đã implement:
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS prevention

Nhưng cần thêm cho production:
- HTTPS
- CSRF protection
- Security headers
- Regular security audits

### Q: Làm sao để bảo vệ stream key?
**A:**
- Không share stream key
- Regenerate nếu bị lộ
- Chỉ hiển thị cho owner
- Có thể thêm IP whitelist

---

## 📚 Learning Resources

### Q: Tài liệu về Socket.io?
**A:** https://socket.io/docs/

### Q: Tài liệu về HLS?
**A:** https://developer.apple.com/streaming/

### Q: Tài liệu về React?
**A:** https://react.dev/

### Q: Tài liệu về Express?
**A:** https://expressjs.com/

---

## 💡 Tips & Tricks

### Tip 1: Sử dụng React DevTools
Install extension để debug React components

### Tip 2: Sử dụng Redux DevTools
Nếu thêm Redux, dùng DevTools để track state

### Tip 3: Monitor logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs
Browser Console (F12)
```

### Tip 4: Database backup
```bash
# Backup
pg_dump -U postgres livestream_app > backup.sql

# Restore
psql -U postgres livestream_app < backup.sql
```

### Tip 5: Test với nhiều browsers
Test trên Chrome, Firefox, Safari để đảm bảo compatibility

---

## 🆘 Vẫn gặp vấn đề?

1. **Check logs:** Backend terminal + Browser console
2. **Read docs:** SETUP.md, HUONG_DAN_CHAY.md
3. **Check GitHub Issues:** Có thể ai đó đã gặp vấn đề tương tự
4. **Google error message:** Thường có solution trên StackOverflow
5. **Ask community:** Reddit, Discord, Stack Overflow

---

**Cập nhật lần cuối:** 2024
**Version:** 1.0.0

Chúc bạn thành công! 🚀
