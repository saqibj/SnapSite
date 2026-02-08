# 📦 Extension Files Overview

Complete guide to all files in the SnapSite extension.

## 📁 Core Extension Files (Required)

### `manifest.json` ⭐ REQUIRED
**Purpose:** Extension configuration and permissions  
**Type:** JSON configuration  
**Contains:**
- Extension metadata (name, version, description)
- Required permissions (debugger, tabs, downloads, etc.)
- Icon references
- Background script configuration

**Do not modify** unless you know what you're doing.

---

### `popup.html` ⭐ REQUIRED
**Purpose:** User interface for the extension popup  
**Type:** HTML  
**Contains:**
- URL input field
- Settings panel (collapsible)
- Control buttons (Start, Pause, Stop)
- Status display
- Recent pages list

**Customize:** You can modify styling or layout if desired.

---

### `popup.js` ⭐ REQUIRED
**Purpose:** UI logic and user interaction handling  
**Type:** JavaScript  
**Functions:**
- Handles button clicks
- Saves/loads settings
- Communicates with background script
- Updates UI based on crawl status

**Customize:** Modify to add new UI features.

---

### `background.js` ⭐ REQUIRED
**Purpose:** Core crawling engine and screenshot logic  
**Type:** JavaScript (Service Worker)  
**Functions:**
- Manages crawl state
- Opens tabs and navigates to URLs
- Captures full-page screenshots
- Extracts links from pages
- Downloads screenshots
- Handles pause/resume/stop

**Customize:** Modify crawling logic, add new features.

---

### `styles.css` ⭐ REQUIRED
**Purpose:** Styling for the popup interface  
**Type:** CSS  
**Contains:**
- Modern gradient design
- Responsive layout
- Button styles
- Progress bar animations
- Scrollbar customization

**Customize:** Change colors, fonts, layouts freely.

---

### `icons/` folder ⭐ REQUIRED
**Purpose:** Extension icons displayed in Chrome  
**Files needed:**
- `icon16.png` - 16x16 pixels (toolbar)
- `icon32.png` - 32x32 pixels (extension page)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

**Must exist** before loading extension. Use one of the generators.

---

## 📚 Documentation Files (Recommended)

### `README.md`
**Purpose:** Complete documentation  
**Contains:**
- Feature overview
- Installation instructions
- Usage guide
- Settings explanation
- Troubleshooting
- Technical details

**For:** Understanding how to use the extension.

---

### `QUICKSTART.md`
**Purpose:** Fast installation guide  
**Contains:**
- 3-step installation
- Common issues
- File structure reference

**For:** Getting started quickly.

---

### `EXAMPLES.md`
**Purpose:** Configuration examples  
**Contains:**
- 10+ real-world use cases
- Recommended settings for different site types
- Exclude pattern examples
- Performance tips

**For:** Learning best practices.

---

## 🛠️ Icon Generation Files (Choose One)

### `icon-generator.html` ⭐ EASIEST
**Purpose:** Browser-based icon generator  
**Type:** Standalone HTML file  
**Usage:**
1. Open in any browser
2. Click "Generate All Icons"
3. Download all 4 icons
4. Place in `icons/` folder

**No installation required!**

---

### `generate-icons.py`
**Purpose:** Python icon generator  
**Type:** Python script  
**Requirements:** Python 3 + Pillow  
**Usage:**
```bash
pip install pillow
python generate-icons.py
```

**For:** Python developers.

---

### `generate-icons.js`
**Purpose:** Node.js icon generator  
**Type:** JavaScript (Node.js)  
**Usage:**
```bash
node generate-icons.js
# Then convert SVG to PNG
```

**For:** Node.js developers (generates SVG).

---

## 🗂️ Project Files (Optional)

### `package.json`
**Purpose:** Node.js package configuration  
**Type:** JSON  
**For:** If using npm/Node.js tools.

---

### `.gitignore`
**Purpose:** Git version control exclusions  
**Type:** Git configuration  
**For:** If using Git for version control.

---

### `LICENSE`
**Purpose:** MIT license text  
**Type:** Text  
**For:** Legal open-source distribution.

---

## 📊 File Dependency Tree

```
Extension Loading
├── manifest.json (defines everything)
│   ├── icons/*.png (must exist)
│   ├── popup.html (UI)
│   │   ├── popup.js (UI logic)
│   │   └── styles.css (styling)
│   └── background.js (crawling engine)
```

## ✅ Minimum Required Files

To load the extension, you MUST have:

1. ✅ `manifest.json`
2. ✅ `popup.html`
3. ✅ `popup.js`
4. ✅ `background.js`
5. ✅ `styles.css`
6. ✅ `icons/icon16.png`
7. ✅ `icons/icon32.png`
8. ✅ `icons/icon48.png`
9. ✅ `icons/icon128.png`

**Total: 9 files** (5 code files + 4 icon files)

---

## 🎯 Quick Checklist

Before loading extension:

- [ ] Created `icons/` folder
- [ ] Generated all 4 icon PNG files
- [ ] All 5 code files present (manifest, popup.html/js, background.js, styles.css)
- [ ] Folder structure matches the tree above
- [ ] Developer mode enabled in Chrome
- [ ] Ready to load unpacked

---

## 📝 File Sizes (Approximate)

| File | Size | Type |
|------|------|------|
| manifest.json | 1 KB | Config |
| popup.html | 4 KB | HTML |
| popup.js | 8 KB | JavaScript |
| background.js | 12 KB | JavaScript |
| styles.css | 6 KB | CSS |
| icon16.png | 1 KB | Image |
| icon32.png | 2 KB | Image |
| icon48.png | 3 KB | Image |
| icon128.png | 8 KB | Image |
| **Total** | ~45 KB | - |

---

## 🔄 Updating the Extension

After modifying any file:

1. Go to `chrome://extensions/`
2. Find "SnapSite"
3. Click the refresh icon 🔄
4. Extension will reload with changes

---

## 🚀 Next Steps

1. ✅ Generate icons using `icon-generator.html`
2. ✅ Load extension in Chrome
3. ✅ Read `QUICKSTART.md` for first use
4. ✅ Check `EXAMPLES.md` for configuration ideas
5. ✅ Start crawling!

---

**Questions?** Check the README.md for detailed documentation.
