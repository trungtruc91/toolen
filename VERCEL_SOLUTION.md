# Solution: Use Vercel Dashboard (Recommended)

**Problem:** GitHub Actions có lỗi với `.vercel` directory

---

## ✅ Giải pháp đơn giản nhất: Vercel Dashboard

### Bước 1: Remove GitHub Actions workflow

```bash
git rm .github/workflows/deploy-vercel.yml
git commit -m "ci: remove github actions, use vercel dashboard"
git push origin main
```

### Bước 2: Setup Vercel Dashboard (5 phút)

1. **Mở Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Login** với GitHub account

3. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository
   - Click "Import"

4. **Configure** (auto-detected)
   ```
   Framework: Next.js ✅
   Build Command: pnpm build ✅
   Install Command: pnpm install ✅
   ```

5. **Add Environment Variables** (Optional - for translation)
   - Click "Environment Variables" tab
   - Add:
     - `AZURE_TRANSLATOR_KEY` = your key
     - `AZURE_TRANSLATOR_REGION` = `eastasia`
   - Select "Production" & "Preview"

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - ✅ Done!

### Bước 3: Test Auto-Deploy

```bash
# Make a change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify vercel auto-deploy"
git push origin main

# Vercel sẽ tự động detect và deploy!
```

### Check deployment:
- Dashboard: https://vercel.com/dashboard
- Your site: https://your-project.vercel.app

---

## 🎯 Tại sao dùng Vercel Dashboard?

✅ **No secrets needed** - Tự động sync với GitHub  
✅ **Faster setup** - 5 phút vs 20 phút  
✅ **Better UX** - Preview deployments cho PRs  
✅ **Simpler** - Không cần config GitHub Actions  
✅ **Built-in analytics** - Free với Vercel  

GitHub Actions chỉ cần khi:
- Custom build steps
- Multi-environment deploys
- Advanced CI/CD pipelines

**Cho dự án này: Vercel Dashboard là perfect!** 🎯

---

## 📝 After Setup - Workflow

```
Developer workflow:
  git add .
  git commit -m "feat: new feature"
  git push origin main
      ↓
Vercel detects push (via GitHub webhook)
      ↓
Builds: pnpm install → pnpm build
      ↓
Deploys to: https://your-project.vercel.app
      ↓
Notification: Deploy success ✅
```

**Zero config needed after initial setup!** 🚀

---

## 🎉 Summary

1. **Delete** GitHub Actions workflow
2. **Import** repo in Vercel Dashboard
3. **Deploy** once
4. Future pushes **auto-deploy** ✅

**Time:** 5 minutes total

**Ready?** Let's do it! 🔥
