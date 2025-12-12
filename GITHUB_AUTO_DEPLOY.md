# GitHub Auto-Deploy to Vercel - Setup Guide

**Date:** 2025-12-12

---

## 🎯 Two Methods Available

### Method 1: GitHub Actions (Automated CI/CD) ⚡
- Deploys on every push
- Full control via GitHub
- Requires secrets setup

### Method 2: Vercel Dashboard (Easiest) 🚀
- One-click setup
- Auto-detects on push
- No coding needed

---

## 🔧 Method 1: GitHub Actions Setup

### Step 1: Get Vercel Credentials

1. **Install Vercel CLI locally** (one time)
   ```bash
   pnpm setup
   source ~/.zshrc
   pnpm add -g vercel
   ```

2. **Login and link project**
   ```bash
   vercel login
   cd /path/to/toolen
   vercel link
   ```

3. **Get credentials**
   ```bash
   # Get Vercel Token
   # Go to: https://vercel.com/account/tokens
   # Create new token, copy it
   
   # Get ORG_ID and PROJECT_ID
   cat .vercel/project.json
   ```
   
   You'll see:
   ```json
   {
     "orgId": "team_xxxxx",
     "projectId": "prj_xxxxx"
   }
   ```

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository settings
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these 3 secrets:

| Name | Value | Where to get |
|------|-------|--------------|
| `VERCEL_TOKEN` | `xxx...` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `team_xxx` | `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `prj_xxx` | `.vercel/project.json` |

### Step 3: Also Add Environment Variables (Optional)

If you want translation to work, add to GitHub Secrets:

| Name | Value |
|------|-------|
| `AZURE_TRANSLATOR_KEY` | Your Azure key |
| `AZURE_TRANSLATOR_REGION` | `eastasia` |
| `LIBRETRANSLATE_API_KEY` | Your Libre key (optional) |

### Step 4: Push Workflow

```bash
git add .github/workflows/deploy-vercel.yml
git commit -m "ci: add vercel auto-deploy workflow"
git push origin main

# GitHub Actions will auto-deploy!
```

### Step 5: Verify

1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. See "Deploy to Vercel" workflow running
3. Wait ~2-3 minutes
4. Check deployment at Vercel dashboard

---

## 🚀 Method 2: Vercel Dashboard (Recommended for Speed)

**Much simpler - No GitHub Actions needed!**

### Setup (5 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com/dashboard
   - Login with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository
   - Vercel auto-detects Next.js

3. **Configure** (auto-filled from vercel.json)
   - Build: `pnpm build` ✅
   - Install: `pnpm install` ✅
   - Framework: Next.js ✅

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `AZURE_TRANSLATOR_KEY`
     - `AZURE_TRANSLATOR_REGION`
   - For: Production + Preview

5. **Deploy**
   - Click "Deploy"
   - Wait 2 minutes
   - Done!

### How It Works After Setup

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel auto-detects push via GitHub webhook
# → Builds and deploys automatically
# → No GitHub Actions needed
```

**Vercel has built-in GitHub integration!** 🎉

---

## 📊 Comparison

| Feature | GitHub Actions | Vercel Dashboard |
|---------|----------------|------------------|
| Setup time | 10-15 min | 5 min |
| Complexity | Medium | Easy |
| Secrets needed | 3 (manual) | 0 (auto) |
| Build logs | GitHub Actions | Vercel Dashboard |
| Preview deploys | Need extra config | Auto (for PRs) |
| Recommended for | Advanced users | Everyone |

---

## 🎯 Recommended Path

**For your case: Use Vercel Dashboard**

Why?
- ✅ Faster setup (5 min vs 15 min)
- ✅ No secrets to manage
- ✅ Better preview deployments
- ✅ Integrated analytics
- ✅ One less thing to maintain

**GitHub Actions is useful if:**
- You need custom build steps
- You want full control
- You're already using GitHub Actions

---

## ✅ Quick Start (Right Now!)

### Option A: Vercel Dashboard (Fastest)

```bash
# 1. Open browser
open https://vercel.com/dashboard

# 2. Login → Import → Select your repository
# 3. Add env vars → Deploy
# 4. Done! Future pushes auto-deploy
```

### Option B: GitHub Actions (Advanced)

```bash
# 1. Setup Vercel CLI
pnpm setup && source ~/.zshrc
pnpm add -g vercel

# 2. Link project
vercel link

# 3. Get IDs
cat .vercel/project.json

# 4. Add to GitHub Secrets (manual in browser)
# 5. Push workflow
git add .github/workflows/deploy-vercel.yml
git commit -m "ci: add auto-deploy"
git push

# 6. Check: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

---

## 🐛 Troubleshooting

### GitHub Actions fails?

**Check:**
1. All 3 secrets added correctly
2. Vercel token is valid
3. Project linked (`.vercel/project.json` exists)

**Fix:**
```bash
# Re-link project
vercel link
cat .vercel/project.json  # Copy IDs
# Update GitHub Secrets
```

### Vercel Dashboard not detecting pushes?

**Check:**
1. GitHub integration connected
2. Repository permissions granted
3. Main branch protected?

**Fix:**
- Vercel Settings → Git → Check integration
- Reconnect GitHub if needed

---

## 📝 After Setup

**Workflow:**
```
Developer: git push origin main
    ↓
GitHub: Push detected
    ↓
Method 1: GitHub Actions triggers → Vercel deploy
Method 2: Vercel webhook triggers → Auto deploy
    ↓
Deployment: https://your-project.vercel.app updated
    ↓
Notification: Deployment success/fail
```

**Zero manual steps after initial setup!** 🎊

---

## 🎉 Final Recommendation

**Start with Vercel Dashboard:**
```
1. vercel.com/dashboard
2. Import repo
3. Deploy
4. Done in 5 minutes
```

**Switch to GitHub Actions later if needed.**

Most projects don't need GitHub Actions for Vercel - the built-in integration is excellent! 🚀

---

**Next:** Choose your method and deploy! 🔥
