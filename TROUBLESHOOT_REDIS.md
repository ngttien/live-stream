# 🔧 Fix Redis Error trên Production

## Lỗi: "Reached the max retries per request limit"

Lỗi này xảy ra khi backend không thể connect tới Redis (Upstash).

---

## ✅ Giải pháp

### Option 1: Sử dụng Upstash REST API (Khuyến nghị)

Upstash có 2 cách connect:
- **Redis Protocol** (port 6379) - Có thể bị block
- **REST API** (HTTPS) - Luôn hoạt động ✅

#### Bước 1: Lấy REST URL từ Upstash

1. Vào Upstash Dashboard: https://console.upstash.com
2. Click vào Redis database của bạn
3. Tìm **REST API** section
4. Copy **UPSTASH_REDIS_REST_URL**:
   ```
   https://apn1-xxx.upstash.io
   ```
5. Copy **UPSTASH_REDIS_REST_TOKEN**:
   ```
   AXXXxxx...
   ```

#### Bước 2: Update Backend Code

Cần update backend để dùng REST API thay vì Redis protocol.

**File: `backend/src/config/redis.js`**

Thêm support cho REST API:

```javascript
const Redis = require('ioredis');

let redisClient;

// Check if using REST API
const isRestAPI = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (isRestAPI) {
  // Use Upstash REST API
  const { Redis: UpstashRedis } = require('@upstash/redis');
  
  redisClient = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  console.log('✅ Connected to Upstash Redis (REST API)');
} else {
  // Use standard Redis protocol
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
  
  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
  
  redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
}

module.exports = redisClient;
```

#### Bước 3: Install Upstash SDK

```bash
cd backend
npm install @upstash/redis
```

#### Bước 4: Update Environment Variables trên Render

1. Vào Render Dashboard
2. Click vào Backend service
3. Vào **Environment**
4. Thêm 2 variables mới:
   ```
   UPSTASH_REDIS_REST_URL=https://apn1-xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
   ```
5. **Giữ nguyên** `REDIS_URL` (cho local)
6. Click **Save Changes**

#### Bước 5: Deploy

```bash
git add .
git commit -m "Add Upstash REST API support"
git push origin main
```

Render sẽ tự động deploy lại.

---

### Option 2: Fix Redis Connection String (Nếu muốn dùng Redis protocol)

#### Kiểm tra Connection String

Redis URL phải đúng format:

```
redis://default:PASSWORD@HOST:PORT
```

**Lưu ý:**
- Phải có `default:` trước password
- Port thường là `6379` hoặc `6380`
- Không có khoảng trắng
- Password không có ký tự đặc biệt (hoặc phải encode)

#### Update trên Render

1. Vào Upstash Dashboard
2. Copy **Redis URL** (không phải REST URL)
3. Vào Render → Backend → Environment
4. Update `REDIS_URL`:
   ```
   redis://default:YOUR_PASSWORD@apn1-xxx.upstash.io:6379
   ```
5. Save Changes

---

### Option 3: Tạm thời disable Redis (Quick fix)

Nếu cần app chạy ngay, có thể tạm disable Redis:

**File: `backend/src/config/redis.js`**

```javascript
// Fallback to mock Redis if connection fails
let redisClient;

try {
  const Redis = require('ioredis');
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });
  
  // Test connection
  redisClient.connect().catch(() => {
    console.warn('⚠️  Redis unavailable, using mock');
    redisClient = createMockRedis();
  });
  
} catch (error) {
  console.warn('⚠️  Redis unavailable, using mock');
  redisClient = createMockRedis();
}

function createMockRedis() {
  const cache = new Map();
  return {
    get: async (key) => cache.get(key) || null,
    set: async (key, value, ...args) => cache.set(key, value),
    del: async (key) => cache.delete(key),
    setex: async (key, ttl, value) => cache.set(key, value),
    // Add other methods as needed
  };
}

module.exports = redisClient;
```

**Lưu ý:** Đây chỉ là giải pháp tạm thời. Redis mock không có persistence và không work với multiple instances.

---

## 🔍 Debug Steps

### 1. Check Upstash Dashboard

1. Vào https://console.upstash.com
2. Verify database đang **Active**
3. Check **Metrics** → Có requests không?
4. Check **Logs** → Có errors không?

### 2. Check Render Logs

1. Vào Render Dashboard
2. Click Backend service
3. Vào **Logs**
4. Tìm Redis errors:
   ```
   ❌ Redis connection error
   Reached the max retries
   ECONNREFUSED
   ```

### 3. Test Connection Local

Test Upstash connection từ máy local:

```bash
# Test Redis protocol
redis-cli -u redis://default:PASSWORD@HOST:6379 ping

# Test REST API
curl https://apn1-xxx.upstash.io/get/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 So sánh Options

| Option | Pros | Cons | Khuyến nghị |
|--------|------|------|-------------|
| **REST API** | ✅ Luôn hoạt động<br>✅ Không bị firewall | ⚠️ Cần update code | ⭐⭐⭐⭐⭐ |
| **Redis Protocol** | ✅ Không cần update code | ❌ Có thể bị block | ⭐⭐⭐ |
| **Mock Redis** | ✅ Quick fix | ❌ Không có persistence | ⭐⭐ (temporary) |

---

## ✅ Khuyến nghị: Dùng REST API

**Tại sao?**
- Render free tier có thể block Redis port 6379
- REST API (HTTPS) luôn hoạt động
- Upstash REST API rất nhanh
- Dễ debug hơn

**Steps:**
1. Update `backend/src/config/redis.js` (code ở trên)
2. Install `@upstash/redis`
3. Add REST URL + Token vào Render
4. Deploy

---

## 🆘 Vẫn không work?

### Check list:
- [ ] Upstash database đang active
- [ ] REST URL đúng format
- [ ] REST Token đúng
- [ ] Đã install @upstash/redis
- [ ] Đã commit và push code
- [ ] Render đã deploy xong
- [ ] Check logs không có errors

### Alternative: Dùng Redis local + Ngrok

Nếu Upstash vẫn không work, có thể dùng Redis local:

```bash
# Terminal 1: Redis local
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: Ngrok
ngrok tcp 6379

# Copy ngrok URL và update REDIS_URL trên Render
redis://default:@0.tcp.ngrok.io:12345
```

**Lưu ý:** Ngrok free có giới hạn và URL thay đổi mỗi lần restart.

---

## 💡 Best Practice

### Production
- ✅ Dùng Upstash REST API
- ✅ Set timeout hợp lý
- ✅ Handle Redis errors gracefully
- ✅ Monitor Redis metrics

### Local
- ✅ Dùng Redis Docker
- ✅ Dùng Redis protocol (nhanh hơn)
- ✅ Không cần REST API

---

**Khuyến nghị: Follow Option 1 (REST API) để fix lâu dài!** 🚀
