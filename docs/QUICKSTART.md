# 🚀 Quick Start Guide

## Installation in 3 Steps

### Step 1: Generate Icons

Choose ONE method:

**Option A: Browser-Based (Easiest - No Installation Required)**
1. Open `icon-generator.html` in your browser
2. Click "Generate All Icons"
3. Download all 4 icon files
4. Create an `icons` folder in the extension directory
5. Move all downloaded PNG files into the `icons` folder

**Option B: Python Script**
```bash
pip install pillow
python generate-icons.py
```

**Option C: Node.js Script**
```bash
node generate-icons.js
# Then convert SVG to PNG using online tool
```

**Option D: Manual Creation**
- Create 4 PNG images: 16x16, 32x32, 48x48, 128x128 pixels
- Use any image editor (Photoshop, GIMP, Paint.NET, etc.)
- Save as: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Place in `icons/` folder

---

### Step 2: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `SnapSite` folder
5. Extension should appear with a camera icon

---

### Step 3: Start Using

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
- Check that icons folder has all 4 PNG files

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
├── README.md
├── QUICKSTART.md
├── icon-generator.html
├── generate-icons.py
├── generate-icons.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Need Help?

1. Read the full [README.md](README.md)
2. Check Chrome's extension console: `chrome://extensions/` → Details → "Inspect views"
3. Look for errors in browser console (F12)

---

**That's it! You're ready to crawl! 📸**
