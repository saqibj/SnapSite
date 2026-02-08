# 🔧 Troubleshooting Guide

Common issues and solutions for the SnapSite extension.

---

## 🚫 Installation Issues

### ❌ "Failed to load extension"

**Symptoms:**
- Extension won't load in Chrome
- Error message when clicking "Load unpacked"

**Solutions:**

1. **Check manifest.json**
   ```bash
   # Verify file exists
   ls manifest.json
   
   # Check for syntax errors (use JSON validator)
   ```

2. **Verify all required files exist:**
   ```
   ✓ manifest.json
   ✓ popup.html
   ✓ popup.js
   ✓ background.js
   ✓ styles.css
   ✓ icons/icon16.png
   ✓ icons/icon32.png
   ✓ icons/icon48.png
   ✓ icons/icon128.png
   ```

3. **Check file permissions:**
   - Ensure files are readable
   - On Linux/Mac: `chmod 644 *.js *.html *.css *.json`

---

### ❌ "Icons not found"

**Symptoms:**
- Extension loads but has no icon
- Default puzzle piece icon appears

**Solutions:**

1. **Icons are included in the repo.** If missing:
   - Re-clone the repo, or
   - Ensure `icons/` has icon16.png, icon32.png, icon48.png, icon128.png

2. **Verify icon folder structure:**
   ```
   SnapSite/
   └── icons/
       ├── icon16.png
       ├── icon32.png
       ├── icon48.png
       └── icon128.png
   ```

3. **Check icon file sizes:**
   - icon16.png: exactly 16x16 pixels
   - icon32.png: exactly 32x32 pixels
   - icon48.png: exactly 48x48 pixels
   - icon128.png: exactly 128x128 pixels

---

## 🖼️ Screenshot Issues

### ❌ Red X in Recent Pages (screenshot failed for that URL)

**Symptoms:**
- Some URLs show a red X in the Recent Pages list
- No screenshot file for those pages in `Downloads/screenshots/`

**Causes and solutions:**

1. **Page still loading or heavy JavaScript**
   - Increase **Wait for load** in Settings (e.g. 4000–6000 ms)
   - The extension retries once automatically; giving the page more time often fixes this

2. **Very tall or wide page**
   - SnapSite caps very large pages so the capture doesn’t exceed Chrome’s limits; the top portion is still captured
   - If you see a console warning about “Page very large”, that’s expected

3. **Chrome does not capture inactive (background) tabs** — Chrome only renders the active tab; screenshots of background tabs return no data. SnapSite activates each tab briefly before capture so it can be painted (you may see tabs switching during a crawl). If you still get no data, try increasing **Wait for load** (e.g. 4000–5000 ms).

4. **Check the background console for the real error**
   - Go to `chrome://extensions/` → SnapSite → **Inspect views: service worker**
   - In the Console, look for “Screenshot error:” and the message (e.g. target closed, protocol error)
   - Use that to decide if you need longer wait, fewer tabs open, or to exclude that path

### ❌ Screenshots are blank or white

**Causes:**
- Page didn't fully load
- JavaScript not executed

**Solutions:**

1. **Increase wait time:**
   - Settings → Wait for load: 5000ms or higher
   - Test with one page first

2. **Check page in browser:**
   - Visit URL manually
   - Verify it loads correctly
   - Check for login requirements

3. **Look at debugger console:**
   - `chrome://extensions/` → Details → Inspect views (background)
   - Check for errors

---

### ❌ Screenshots missing content

**Symptoms:**
- Images not loaded
- Dynamic content missing
- Only partial page captured

**Solutions:**

1. **Increase wait time:**
   ```
   Wait for load: 6000-8000ms
   ```

2. **For lazy-loaded images:**
   - Some sites load images as you scroll
   - Extension captures from top - may miss lazy content

3. **For infinite scroll:**
   - These pages don't work well with full-page screenshots
   - Consider excluding them

---

### ❌ Screenshot quality is poor

**Solutions:**

1. **Check original page:**
   - Visit in browser
   - May be low-resolution by design

2. **Screenshots are PNG format:**
   - Always full quality
   - No compression artifacts

3. **For high-DPI displays:**
   - Screenshots capture at actual pixel size
   - May appear smaller on retina displays

---

## 🔄 Crawling Issues

### ❌ Crawl stops after 1-2 pages

**Causes:**
- Hit max pages limit
- No more links found
- Links are external

**Solutions:**

1. **Check max pages setting:**
   - Settings → Max pages: increase to 50+

2. **Check max depth:**
   - Settings → Max depth: increase to 10+

3. **Verify links are same-domain:**
   - Extension only follows links to same domain
   - Enable "Include subdomains" if needed

4. **Look at console:**
   ```
   chrome://extensions/ → Details → Inspect views
   Check for errors
   ```

---

### ❌ Same page being crawled multiple times

**Should not happen** - this is a bug.

**Temporary fix:**
- Enable "Ignore query parameters"
- This treats `page.html?a=1` and `page.html?a=2` as same page

**Report as bug** if this persists.

---

### ❌ Crawl is very slow

**Expected behavior:**
- 2-3 seconds per page is normal
- 50 pages = 2-5 minutes

**To speed up:**

1. **Reduce delays (carefully):**
   ```
   Delay: 1000ms (minimum recommended)
   Wait for load: 2000ms
   ```

2. **Reduce max pages:**
   ```
   Max pages: 20-30 for testing
   ```

3. **Use exclude patterns:**
   ```
   Exclude: /tag/, /category/, /author/
   ```

---

## 💾 Download Issues

### ❌ Screenshots not downloading

**Symptoms:**
- Crawl completes but no files
- Can't find screenshots

**Solutions:**

1. **Check Downloads folder:**
   ```
   Look in: Downloads/screenshots/
   ```

2. **Grant download permissions:**
   - Chrome may block automatic downloads
   - Check chrome://settings/content/automaticDownloads
   - Allow for chrome-extension://

3. **Check disk space:**
   - Each screenshot: 500KB - 5MB
   - 50 pages ≈ 25-250 MB

4. **Check Chrome downloads:**
   - Ctrl+J or Cmd+J to open downloads
   - Look for recent PNG files

---

### ❌ Downloads go to wrong folder

**Solutions:**

1. **Chrome downloads location:**
   - chrome://settings → Downloads
   - Check default download location
   - Screenshots go to: `[Downloads]/screenshots/`

2. **Create screenshots folder manually:**
   ```bash
   mkdir ~/Downloads/screenshots
   ```

---

## ⚙️ Configuration Issues

### ❌ Settings not saving

**Symptoms:**
- Changes reset when reopening popup
- Settings don't persist

**Solutions:**

1. **Check Chrome storage permission:**
   - Should be enabled automatically
   - Verify in manifest.json

2. **Clear extension storage:**
   ```
   chrome://extensions/ → Details → Clear storage
   Re-enter settings
   ```

---

### ❌ Exclude patterns not working

**Common mistakes:**

1. **Using wildcards wrong:**
   ```
   ❌ Wrong: *.pdf
   ✅ Right: .pdf
   
   ❌ Wrong: /blog/*
   ✅ Right: /blog/
   ```

2. **Comma-separated list:**
   ```
   ✅ Right: /admin/, /api/, .pdf
   ❌ Wrong: /admin/ /api/ .pdf
   ```

3. **Case sensitivity:**
   - Patterns are case-sensitive
   - `/Blog/` won't match `/blog/`

---

## 🌐 Website-Specific Issues

### ❌ Single Page Applications (SPAs)

**Symptoms:**
- React/Vue/Angular sites
- URL changes but page doesn't reload
- Only screenshots homepage

**Limitations:**
- Extension follows actual `<a>` links
- Hash-based routing (`#/page`) won't work
- Some SPAs won't crawl fully

**Workaround:**
- Manually list important URLs
- Run crawler on each separately

---

### ❌ Sites requiring login

**Limitation:**
- Extension can't log in automatically
- Can't crawl protected content

**Workaround:**
1. Log in manually in Chrome
2. Run extension (uses your session)
3. May need to increase delays

---

### ❌ Sites with anti-bot protection

**Symptoms:**
- Cloudflare challenge pages
- reCAPTCHA screenshots
- Access denied errors

**Solutions:**

1. **Increase delays:**
   ```
   Delay: 5000ms
   ```

2. **Reduce concurrent load:**
   - Extension already opens one page at a time
   - Use higher delays

3. **May not be crawlable:**
   - Some sites actively block automated access
   - Respect their robots.txt

---

## 🐛 Extension Errors

### ❌ "Debugger failed to attach"

**Cause:**
- Another debugger is attached to the tab
- Chrome DevTools is open on that tab

**Solution:**
1. Close Chrome DevTools (F12)
2. Restart the crawl

---

### ❌ "Extension context invalidated"

**Cause:**
- Extension was reloaded during crawl

**Solution:**
1. Don't reload extension while crawling
2. Restart the crawl

---

### ❌ Memory errors / Chrome crashes

**Cause:**
- Too many pages or too fast
- Large pages with many images

**Solutions:**

1. **Reduce max pages:**
   ```
   Max pages: 20-30
   ```

2. **Increase delays:**
   ```
   Delay: 3000ms
   Wait for load: 4000ms
   ```

3. **Close other tabs:**
   - Free up memory

4. **Restart Chrome:**
   - Fresh start

---

## 📊 Debugging Tools

### Check Extension Console

1. Go to `chrome://extensions/`
2. Find "SnapSite"
3. Click "Details"
4. Click "Inspect views: background"
5. Check Console tab for errors

### Check Popup Console

1. Open extension popup
2. Right-click anywhere → Inspect
3. Check Console tab

### Enable Verbose Logging

Add to background.js:
```javascript
// At top of file
const DEBUG = true;

// Throughout code
if (DEBUG) console.log('Current URL:', url);
```

---

## 🆘 Getting Help

### Before asking for help:

1. ✅ Check this troubleshooting guide
2. ✅ Check the main [README.md](../README.md)
3. ✅ Check browser console for errors
4. ✅ Try with different website
5. ✅ Try with default settings

### Information to provide:

- Chrome version
- Operating system
- Extension version
- Website URL (if public)
- Error messages from console
- Screenshots of the issue
- Settings used

---

## 🔄 Reset Extension

If all else fails:

1. **Remove extension:**
   - chrome://extensions/
   - Remove "SnapSite"

2. **Clear extension data:**
   ```
   Delete extension folder
   Re-download fresh copy
   ```

3. **Reload:**
   - Re-clone or ensure `icons/` is present with all 4 PNGs
   - Load unpacked
   - Try default settings

---

## ⚡ Quick Fixes Checklist

Before digging deeper, try these:

- [ ] Refresh extension (🔄 icon)
- [ ] Close and reopen popup
- [ ] Restart Chrome
- [ ] Try different website
- [ ] Use default settings
- [ ] Check internet connection
- [ ] Clear Chrome cache
- [ ] Disable other extensions temporarily

---

**Still stuck?** Check the extension console for specific error messages and search for those errors.
