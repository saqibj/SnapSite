# 📦 Extension Files Overview

Complete guide to all files in the SnapSite extension.

## 📁 Directory Structure

```
SnapSite/
├── manifest.json          # Extension config
├── popup.html
├── popup.js
├── background.js
├── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── docs/
│   ├── INSTALL.md
│   ├── QUICKSTART.md
│   ├── EXAMPLES.md
│   ├── TROUBLESHOOTING.md
│   └── FILE_STRUCTURE.md   # This file
├── package.json
├── .gitignore
├── LICENSE
├── CHANGELOG.md           # Release history / versioning
└── README.md
```

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

**Included in the repo**—no generation needed.

---

## 📚 Documentation Files (in `docs/`)

### `README.md` (project root)
**Purpose:** Main documentation  
**Contains:** Feature overview, installation, usage, settings, troubleshooting, technical details.

**For:** Understanding how to use the extension.

---

### `docs/QUICKSTART.md`
**Purpose:** Fast installation guide  
**Contains:** 3-step installation, common issues, file structure reference.

**For:** Getting started quickly.

---

### `docs/INSTALL.md`
**Purpose:** Step-by-step installation checklist  
**Contains:** File verification, load steps, folder structure.

**For:** First-time setup.

---

### `docs/EXAMPLES.md`
**Purpose:** Configuration examples  
**Contains:** 10+ real-world use cases, recommended settings, exclude patterns, performance tips.

**For:** Learning best practices.

---

### `docs/TROUBLESHOOTING.md`
**Purpose:** Problem solving  
**Contains:** Installation issues, screenshot issues, debugging, reset steps.

**For:** When something goes wrong.

---

### `docs/FILE_STRUCTURE.md` (this file)
**Purpose:** File-by-file reference  
**Contains:** All files explained, dependency tree, checklist.

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

### `CHANGELOG.md`
**Purpose:** Release history and versioning  
**Type:** Markdown  
**Contains:** Versioned list of added/changed/fixed/removed items. Version number is defined in `manifest.json` and kept in sync in `package.json`.

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

- [ ] `icons/` folder present with icon16.png, icon32.png, icon48.png, icon128.png (included in repo)
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

1. ✅ Load extension in Chrome (icons are included)
2. ✅ Read [QUICKSTART.md](QUICKSTART.md) for first use
3. ✅ Check [EXAMPLES.md](EXAMPLES.md) for configuration ideas
4. ✅ Start crawling!

---

**Questions?** Check the [README.md](../README.md) in the project root for detailed documentation.
