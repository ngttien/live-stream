# ⚡ Fix Redis Error NGAY - 5 phút

## Lỗi: "Reached the max retries per request limit"

### ✅ Giải pháp nhanh nhất

#### Bước 1: Lấy REST API credentials từ Upstash (2 phút)

1. Vào: https://console.upstash.com
2. Click vào Redis database của bạn
3. Scroll xuống **REST API** section
4. Copy 2 values:
   ```
   UPSTASH_REDIS_REST_URL=https://apn1-xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
   ```

#### Bước 2: Update Environment Variables trên Render (2 phút)

1. Vào: https://dashboard.render.com
2. Click vào **Backend service**
3. Click **Environment** (menu bên trái)
4. Click **Add Environment Variable**
5. Thêm 2 variables:
   ```
   Key: UPSTASH_REDIS_REST_URL
   Value: https://apn1-xxx.upstash.io
   
   Key: UPSTASH_REDIS_REST_TOKEN
   Value: AXXXxxx...
   ```
6. Click **Save Changes**

#### Bước 3: Đợi deploy (1 phút)

Render sẽ tự động restart service. Đợi ~1 phút.

#### Bước 4: Test

```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/health

# Hoặc mở browser
https://your-backend.onrender.com/api/health
```

Nếu thấy `{"status":"ok"}` → ✅ Fixed!

---

## 🔍 Tại sao lỗi?

Render free tier có thể block Redis port 6379. REST API (HTTPS) luôn hoạt động.

---

## 📝 Đã update code

Code đã được update để tự động dùng REST API nếu có:
- ✅ `backend/src/config/redis.js` - Support REST API
- ✅ `backend/package.json` - Added @upstash/redis

Bạn chỉ cần:
1. Install dependencies: `npm install` (Render tự động làm)
2. Add environment variables (làm ở Bước 2)
3. Deploy (Render tự động làm)

---

## 🆘 Vẫn lỗi?

### Check 1: Verify credentials đúng
```bash
# Test REST API từ máy local
curl https://apn1-xxx.upstash.io/get/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Nếu thấy response → Credentials đúng ✅

### Check 2: Verify đã install @upstash/redis

1. Vào Render Dashboard
2. Click Backend service
3. Vào **Logs**
4. Tìm dòng: `✅ Using Upstash Redis REST API`

Nếu thấy → Đang dùng REST API ✅

### Check 3: Verify environment variables

1. Render Dashboard → Backend → Environment
2. Check có 2 variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 💡 Alternative: Disable Redis tạm thời

Nếu cần app chạy ngay, có thể tạm disable Redis:

**Render Dashboard → Backend → Environment:**

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_URL=
```

Leave empty → Backend sẽ skip Redis.

**Lưu ý:** Một số features sẽ không hoạt động (rate limiting, caching).

---

## 📚 Chi tiết hơn

Đọc file `TROUBLESHOOT_REDIS.md` để hiểu rõ hơn.

---

**Fix trong 5 phút! 🚀**
