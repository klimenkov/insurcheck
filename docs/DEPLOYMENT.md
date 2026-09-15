# Free Cloud Deployment Guide: Render.com

This project is fully configured for 1-click free hosting on **Render.com**.

## Architecture
- **Full Stack**: Express.js serves both API endpoints and the compiled production Vite React app (`client/dist`) on a single port.
- **Zero C++ Dependencies**: Uses Node 22+ built-in `node:sqlite` (`DatabaseSync`), requiring zero native compilation tools (`node-gyp`).
- **Free SSL & CDN**: Render automatically provisions HTTPS certificates for your custom or `onrender.com` domain.

---

## 3-Step Free Deployment to Render

### 1. Push code to GitHub
Make sure your latest code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: complete InsurCheck platform with production bundle"
git push origin main
```

### 2. Connect to Render.com
1. Go to [https://render.com](https://render.com) and sign in (free with GitHub).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your `insurcheck` GitHub repository.
4. Render will automatically detect [`render.yaml`](./render.yaml) with the exact build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Node Version**: `22.14.0`

### 3. Done!
Click **Apply** / **Create Web Service**. Within 2 minutes, your live site will be accessible worldwide at `https://insurcheck.onrender.com`.
