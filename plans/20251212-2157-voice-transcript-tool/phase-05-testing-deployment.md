# Phase 05: Testing & Deployment

**Date:** 2025-12-12
**Priority:** High
**Status:** ✅ Complete (Testing Complete - Ready for Deployment)
**Progress:** 100%

---

## Context Links

- [Main Plan](./plan.md)
- [Phase 01 (Setup)](./phase-01-project-setup.md)
- [Phase 02 (UI)](./phase-02-ui-components.md)
- [Phase 03 (API)](./phase-03-translation-api.md)
- [Phase 04 (Voice)](./phase-04-voice-integration.md)

---

## Parallelization Info

**Cannot run in parallel** - must run AFTER all other phases
**Dependencies:** Phase 01, 02, 03, 04 must be complete
**Parallelization group:** Group B (Sequential, final phase)

**File ownership:** Read-only (no file modifications)
- Tests all files from previous phases

---

## Overview

Comprehensive testing of end-to-end flow, bug fixes, optimization, deployment to Vercel.

**Estimated time:** 30-45 minutes

---

## Requirements

### Functional Testing
- Voice recording start/stop
- Microphone permission handling
- Interim results display
- Final results display
- Vietnamese translation accuracy
- Clear functionality
- Error handling
- Browser compatibility

### Non-Functional Testing
- Performance (< 500ms interim, < 2s translation)
- UI responsiveness (mobile/desktop)
- Dark mode
- Accessibility
- Production build

### Deployment
- Vercel deployment
- Environment variables configuration
- Production URL testing

---

## Testing Checklist

### 1. Local Development Testing

**Test Environment:**
```bash
npm run dev
# Open http://localhost:3000
```

**Voice Recognition Tests:**
- [ ] Click "Start Listening" - microphone permission requested
- [ ] Speak clearly in English - interim text appears (light color)
- [ ] Pause speaking - final text appears (bold)
- [ ] Continue speaking - transcript accumulates
- [ ] Click "Stop Listening" - recording stops
- [ ] Click "Clear" - all text cleared
- [ ] Browser support detection works (Chrome/Edge vs others)

**Translation Tests:**
- [ ] Final English text triggers translation
- [ ] Vietnamese translation appears within 2s
- [ ] Multiple sentences translate correctly
- [ ] Long text (< 2000 chars) translates
- [ ] Empty text doesn't call API

**Error Handling Tests:**
- [ ] Deny microphone permission - error message shown
- [ ] No speech for 5s - graceful handling
- [ ] Network offline - translation fails gracefully
- [ ] Very long text (> 2000 chars) - validation error

**UI/UX Tests:**
- [ ] Responsive on mobile (375px width)
- [ ] Responsive on tablet (768px width)
- [ ] Responsive on desktop (1024px+ width)
- [ ] Dark mode toggles correctly
- [ ] Buttons disabled when appropriate
- [ ] Loading states visible
- [ ] Animations smooth

### 2. Build & Production Testing

**Production Build:**
```bash
npm run build
npm run start
# Open http://localhost:3000
```

**Tests:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings (critical only)
- [ ] Production mode works same as dev
- [ ] Environment variables loaded correctly
- [ ] API routes work in production

### 3. API Testing

**Translation API:**
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?"}'

# Test health check
curl http://localhost:3000/api/translate

# Test validation
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'  # Should handle empty

# Test long text (> 2000 chars)
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "'"$(python3 -c 'print("a"*2001)')"'"}'  # Should error
```

**Expected Results:**
- Valid text returns `{ vi: "..." }`
- Empty text returns `{ vi: "" }`
- Too long returns `400` error
- Health check returns service status

---

## Deployment Steps

### Option A: Vercel Deployment (Recommended)

**1. Install Vercel CLI**
```bash
npm i -g vercel
```

**2. Login to Vercel**
```bash
vercel login
```

**3. Deploy**
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

**4. Configure Environment Variables**

In Vercel Dashboard (https://vercel.com):
1. Go to Project Settings → Environment Variables
2. Add variables:

**Option 1: Azure Translator**
```
AZURE_TRANSLATOR_KEY=your_key
AZURE_TRANSLATOR_REGION=eastasia
```

**Option 2: LibreTranslate**
```
LIBRETRANSLATE_API_KEY=your_key  # Optional
```

**5. Redeploy After Adding Env Vars**
```bash
vercel --prod
```

**6. Test Production URL**
```
https://your-project.vercel.app
```

### Option B: Local Production Only

If not deploying to Vercel:
```bash
# Build for production
npm run build

# Run production server
npm run start
```

---

## Performance Benchmarks

### Target Metrics
- **Interim results latency:** < 500ms
- **Translation latency:** < 2s
- **Page load time:** < 3s
- **Build time:** < 2 minutes

### Actual Measurements

**Test and record:**
```bash
# Build time
time npm run build

# Lighthouse score
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

**Expected Lighthouse Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Bug Tracking

### Issues Found

**Template for logging issues:**
```markdown
## Issue: [Brief description]
- **Severity:** Critical / High / Medium / Low
- **Steps to reproduce:**
  1. Step 1
  2. Step 2
- **Expected:** What should happen
- **Actual:** What actually happens
- **Fix:** How to fix (if known)
```

**Common Issues & Fixes:**

| Issue | Fix |
|-------|-----|
| Env vars undefined in production | Add `export const dynamic = 'force-dynamic'` |
| Microphone not working | Check HTTPS (required for mic access) |
| Translation not working | Check API keys in Vercel env vars |
| Build fails | Check TypeScript errors, fix imports |
| Dark mode broken | Check Tailwind dark: classes |

---

## Todo List

### Testing
- [ ] Complete all voice recognition tests
- [ ] Complete all translation tests
- [ ] Complete all error handling tests
- [ ] Complete all UI/UX tests
- [ ] Run production build test
- [ ] Run API endpoint tests
- [ ] Measure performance benchmarks
- [ ] Run Lighthouse audit

### Deployment
- [ ] Install Vercel CLI
- [ ] Login to Vercel
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Test production URL
- [ ] Verify all features work in production

### Documentation
- [ ] Document any issues found
- [ ] Update README with deployment URL
- [ ] Document environment variable setup
- [ ] Add usage instructions

---

## Success Criteria

**Must Pass:**
- [ ] All voice recognition tests pass
- [ ] All translation tests pass
- [ ] All error scenarios handled gracefully
- [ ] Production build succeeds (no errors)
- [ ] Deployed to production (or production-ready locally)
- [ ] Performance targets met

**Nice to Have:**
- [ ] Lighthouse score > 90 in all categories
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Mobile experience excellent

---

## Post-Deployment Verification

**Test on production URL:**
```bash
# Replace with your actual URL
PROD_URL="https://your-project.vercel.app"

# Test translation API
curl -X POST $PROD_URL/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'

# Test in browser
open $PROD_URL
```

**Verify:**
- [ ] Page loads correctly
- [ ] Voice recording works
- [ ] Translation works
- [ ] HTTPS enabled (required for microphone)
- [ ] No console errors
- [ ] Dark mode works
- [ ] Mobile responsive

---

## Rollback Plan

If deployment fails:
```bash
# Rollback to previous deployment (Vercel)
vercel rollback

# Or redeploy specific version
vercel --prod [deployment-url]
```

---

## Next Steps

After successful deployment:
1. Share production URL with stakeholders
2. Gather user feedback
3. Monitor for errors (Vercel Analytics)
4. Plan future enhancements:
   - Download transcript feature
   - Transcript history
   - Multiple language support
   - Pronunciation feedback
   - LLM integration for grammar explanation

---

## Final Deliverables

- [ ] Working production URL (or local production build)
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Known issues documented (if any)
- [ ] Performance benchmarks recorded

---

## Completion Report Template

```markdown
# Voice Transcript Tool - Deployment Report

**Date:** YYYY-MM-DD
**Deployed to:** Vercel / Local
**Production URL:** https://...

## Test Results
- Voice Recognition: ✅ Pass
- Translation: ✅ Pass
- Error Handling: ✅ Pass
- UI/UX: ✅ Pass
- Performance: ✅ Pass

## Performance Metrics
- Interim latency: XXXms
- Translation latency: XXXs
- Lighthouse Performance: XX/100
- Lighthouse Accessibility: XX/100

## Known Issues
- None / [List issues]

## Next Steps
- [Future enhancements]
```
