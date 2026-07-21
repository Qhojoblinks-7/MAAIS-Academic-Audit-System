# MAAIS - Production Deployment Guide

## Overview
- **Frontend**: Vercel (React + Vite PWA)
- **Backend**: Render (NestJS + Neon PostgreSQL)
- **Database**: Neon PostgreSQL (serverless)

---

## Prerequisites
1. Vercel account
2. Render account
3. Neon PostgreSQL database
4. Domain name (optional but recommended)

---

## Step 1: Database Setup (Neon)

1. Create a new Neon PostgreSQL project
2. Create a database named `maais`
3. Copy the connection string (format: `postgresql://user:password@ep-xxxx.neon.tech/maais?sslmode=require`)
4. You need both `DATABASE_URL` and `DIRECT_URL`

---

## Step 2: Backend Deployment (Render)

### Option A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. In Render dashboard, click **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` in `maais-backend/`
5. Configure environment variables:
   - `DATABASE_URL` (from Neon)
   - `DIRECT_URL` (from Neon)
   - `JWT_ACCESS_SECRET` (generate a strong random string)
   - `JWT_REFRESH_SECRET` (generate another strong random string)
   - `SMTP_USER`, `SMTP_PASS` (for emails)
   - Other optional services (Twilio, Supabase, etc.)
6. Deploy

### Option B: Manual Setup
1. In Render dashboard, click **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `maais-backend`
   - **Root Directory**: `maais-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add environment variables from `.env.example`
5. Deploy

### After Deployment
- Note your backend URL: `https://maais-backend.onrender.com`
- Test health endpoint: `https://maais-backend.onrender.com/api/v1/health`

---

## Step 3: Frontend Deployment (Vercel)

1. In Vercel dashboard, click **New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `front-end`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
4. Add environment variables:
   - `VITE_API_BASE_URL` = `https://maais-backend.onrender.com/api/v1`
   - `VITE_APP_URL` = `https://your-app.vercel.app`
5. Deploy

### After Deployment
- Note your frontend URL: `https://maais.vercel.app`
- Update backend CORS if needed

---

## Step 4: Post-Deployment Configuration

### Backend CORS
Update `maais-backend/src/main.ts` to allow your Vercel domain:

```typescript
app.enableCors({
  origin: [
    'https://your-app.vercel.app',
    'https://maais.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
});
```

### Frontend API URL
Ensure `VITE_API_BASE_URL` in Vercel points to your Render backend.

### Database Migrations
After first deployment, run migrations:
```bash
# Local
cd maais-backend
npx prisma migrate deploy

# Or via Render shell
render shell maais-backend
npx prisma migrate deploy
```

---

## Step 5: Verify Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/api/v1/health
```

### Frontend PWA Check
1. Open Chrome DevTools → Application
2. Check Manifest tab
3. Check Service Worker tab
4. Test offline mode in Network tab

### Create Admin User
```bash
# Via Render shell or local
cd maais-backend
npx ts-node prisma/seed.ts
```

---

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` | Yes |
| `VITE_APP_URL` | `https://your-app.vercel.app` | Yes |

### Backend (Render)
| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Auto-set |
| `PORT` | `10000` | Auto-set |
| `APP_URL` | `https://your-backend.onrender.com` | Yes |
| `DATABASE_URL` | Neon connection string | Yes |
| `DIRECT_URL` | Neon direct connection | Yes |
| `JWT_ACCESS_SECRET` | Random 32+ char string | Yes |
| `JWT_REFRESH_SECRET` | Random 32+ char string | Yes |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | No |
| `REDIS_URL` | Upstash Redis URL | No |
| `SMTP_HOST` | `smtp.gmail.com` | Yes (for emails) |
| `SMTP_PORT` | `587` | Yes |
| `SMTP_USER` | Your email | Yes |
| `SMTP_PASS` | App password | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio SID | No (for SMS) |
| `TWILIO_AUTH_TOKEN` | Twilio token | No |
| `TWILIO_PHONE_NUMBER` | Twilio number | No |
| `STORAGE_BUCKET_URL` | Supabase/S3 URL | No |
| `STORAGE_SECRET` | Storage secret | No |
| `QR_BASE_URL` | Verification URL | No |

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Monitoring & Maintenance

### Render
- Check logs in Render dashboard
- Set up health check alerts
- Monitor database usage in Neon

### Vercel
- Check deployment logs
- Monitor bandwidth usage
- Set up Vercel Analytics if needed

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify `DATABASE_URL` is correct
- Ensure Prisma migrations ran

### Frontend can't connect to backend
- Check `VITE_API_BASE_URL` in Vercel
- Verify CORS settings in backend
- Check network tab for CORS errors

### PWA not installing
- Ensure HTTPS is enabled
- Check manifest.webmanifest is accessible
- Verify service worker is registered
- Icons must be 192x192 and 512x512 PNGs

### Database connection issues
- Neon free tier may sleep after inactivity
- Check connection string format
- Verify SSL mode is `require`

---

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] JWT secrets are strong random strings (32+ chars)
- [ ] CORS is restricted to your domain only
- [ ] HTTPS is enforced
- [ ] Database credentials are rotated
- [ ] Service worker cache is properly configured
- [ ] Rate limiting is enabled on backend
- [ ] Input validation is active

---

## Cost Estimate

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel (Frontend) | Hobby (free) | $20/month |
| Render (Backend) | Free (with limitations) | $7/month (Starter) |
| Neon PostgreSQL | Free (0.5GB) | $19/month (1GB) |
| Upstash Redis | Free (10K commands) | $0.20/100K |
| **Total** | **$0/month** | **~$46/month** |

---

## Next Steps
1. Set up CI/CD with GitHub Actions (optional)
2. Add monitoring (Sentry, LogRocket)
3. Set up automated backups for database
4. Configure CDN for static assets
5. Add rate limiting and DDoS protection
