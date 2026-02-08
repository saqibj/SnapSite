# 🚀 Quick Start Guide

## Installation in 2 Steps

Icons are **included** in the repo—no need to generate them.

### Step 1: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `SnapSite` folder
5. Extension should appear with the SnapSite icon

---

### Step 2: Start Using

1. Click the extension icon in Chrome toolbar
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Start Crawling"
4. Screenshots save to `Downloads/screenshots/`

---

## First-Time Configuration

### Recommended Settings for Testing

- **Max Pages:** 10 (for quick test)
- **Delay:** 2000ms
- **Wait for Load:** 3000ms

### For Production Use

- **Small Sites:** Max 50 pages, 2s delay
- **Medium Sites:** Max 100 pages, 3s delay
- **Large Sites:** Max 200 pages, 4s delay

---

## Common Issues

### "Extension could not be loaded"
- Make sure all files are in the correct folder
- Verify `manifest.json` exists
- Check that `icons/` contains icon16.png, icon32.png, icon48.png, icon128.png (included in repo)

### "No screenshots appearing"
- Check your Downloads folder
- Look in `Downloads/screenshots/`
- May need to grant download permissions

### "Pages not loading"
- Increase "Wait for Load" time to 4000-5000ms
- Some sites have slow JavaScript

---

## File Structure

Your extension folder should look like this:

```
SnapSite/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── styles.css
├── docs/
│   ├── INSTALL.md
│   ├── QUICKSTART.md      ← This file
│   ├── EXAMPLES.md
│   ├── TROUBLESHOOTING.md
│   └── FILE_STRUCTURE.md
├── README.md
└── icons/                 ← Icons included in repo
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Need Help?

1. Read the full [README.md](../README.md) in the project root
2. Check Chrome's extension console: `chrome://extensions/` → Details → "Inspect views"
3. Look for errors in browser console (F12)

---

**That's it! You're ready to crawl! 📸**
