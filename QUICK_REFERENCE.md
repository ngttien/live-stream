# ⚡ Quick Reference Card

## 🚀 Deploy Commands

```bash
# Check readiness
node scripts/deploy-check.js

# Test production
node scripts/test-production.js https://your-backend.onrender.com

# Start local (Windows)
scripts\start-local.bat
```

---

## 📚 Documentation

| File | Purpose | Time |
|------|---------|------|
| `START_HERE.md` | Entry point | 5 min |
| `QUICK_DEPLOY.md` | Quick deploy | 30 min |
| `DEPLOY_GUIDE.md` | Detailed guide | 60 min |
| `DEPLOY_CHECKLIST.md` | Checklist | - |
| `LOCAL_VS_PRODUCTION.md` | Understand envs | 10 min |

---

## 🌐 URLs

### Local
```
Frontend:  http://localhost:3001
Backend:   http://localhost:3000
RTMP:      rtmp://localhost:1935/live
```

### Production
```
Frontend:  https://your-frontend.onrender.com
Backend:   https://your-backend.onrender.com
RTMP:      rtmp://ngrok-url/live
```

---

## 🔑 Environment Variables

### Local (backend/.env)
```env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/livestream_app
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3001
```

### Production (Render Dashboard)
```env
DATABASE_URL=postgresql://postgres.xxxxx@supabase.com/postgres
REDIS_URL=redis://default:xxx@upstash.io:6379
CLIENT_URL=https://your-frontend.onrender.com
```

---

## 📦 Platform

| Service | URL | Purpose |
|---------|-----|---------|
| Supabase | https://supabase.com | Database |
| Upstash | https://upstash.com | Redis |
| Render | https://render.com | Hosting |
| Ngrok | https://ngrok.com | RTMP |

---

## ✅ Quick Checklist

### Before Deploy
- [ ] Code works locally
- [ ] Run deploy-check.js
- [ ] Push to GitHub

### Deploy Steps
- [ ] Create Supabase database
- [ ] Create Upstash Redis
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Update CORS

### After Deploy
- [ ] Test health endpoint
- [ ] Test frontend
- [ ] Test full flow
- [ ] Verify local still works

---

## 🆘 Quick Fixes

### Backend won't start
```bash
# Check logs on Render
# Verify DATABASE_URL
# Check environment variables
```

### Frontend won't connect
```bash
# Check CORS (CLIENT_URL)
# Verify REACT_APP_API_URL
# Check browser console
```

### Database error
```bash
# Verify Supabase active
# Check connection string
# Run migration again
```

---

## 💡 Pro Tips

1. **Always test local first**
2. **Commit frequently**
3. **Monitor production logs**
4. **Backup data regularly**
5. **Keep dependencies updated**

---

## 🎯 Workflow

```
Local Dev → Test → Commit → Push → Auto Deploy → Test Production
```

---

## 📊 Cost

| Service | Cost |
|---------|------|
| Supabase | $0 |
| Upstash | $0 |
| Render | $0 |
| Ngrok | $0 |
| **TOTAL** | **$0/month** |

---

## 🔗 Quick Links

- [START_HERE.md](START_HERE.md) - Start here
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Quick deploy
- [FAQ.md](FAQ.md) - Common questions
- [README.md](README.md) - Project overview

---

**Print this and keep it handy! 📄**
