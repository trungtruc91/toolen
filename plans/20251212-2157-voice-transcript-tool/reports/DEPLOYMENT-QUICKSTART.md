# Quick Deployment Guide

**Status:** ✅ Ready for Deployment
**Date:** 2025-12-12

---

## One-Command Deployment

```bash
# 1. Install Vercel CLI (one time)
pnpm add -g vercel

# 2. Login (one time)
vercel login

# 3. Deploy to production
cd /Users/tructt/Public/toolen
vercel --prod
```

---

## Required Environment Variables

Add in Vercel Dashboard (Settings → Environment Variables):

**Option 1: Azure Translator (Recommended)**
```
AZURE_TRANSLATOR_KEY=your_key_here
AZURE_TRANSLATOR_REGION=eastasia
```

**Option 2: LibreTranslate (Free)**
```
LIBRETRANSLATE_API_KEY=your_key_here  # Optional, works without key
```

---

## Post-Deployment Test

```bash
# Replace with your actual URL
PROD_URL="https://your-project.vercel.app"

# Test translation
curl -X POST $PROD_URL/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'

# Expected response (with keys):
# {"vi": "Xin chào thế giới"}

# Test in browser
open $PROD_URL
```

---

## Quick Checks

After deployment, verify:

- [ ] Page loads (HTTPS enabled)
- [ ] Click "Start Listening" (mic permission)
- [ ] Speak English (text appears)
- [ ] Translation appears (if keys configured)
- [ ] No console errors (F12)
- [ ] Mobile responsive

---

## If Something Goes Wrong

```bash
# View deployment logs
vercel logs

# Rollback to previous version
vercel rollback

# Redeploy
vercel --prod
```

---

## Support

**Test Reports:**
- Full test results: `tester-251212-phase05-testing.md`
- Deployment checklist: `deployment-checklist-251212.md`
- Executive summary: `tester-251212-summary.md`

**All reports in:**
`/Users/tructt/Public/toolen/plans/20251212-2157-voice-transcript-tool/reports/`

---

## Status: READY ✅

All tests passed. Zero blockers. Deploy when ready.
