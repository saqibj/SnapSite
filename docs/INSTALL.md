# ✅ Installation Checklist

Follow these steps in order for a successful installation.

---

## Step 1: Verify Files 📋

Icons are **included** in the repo. The `icons/` folder already contains the four required PNG files. No generation step needed.

---

## Step 2: Verify All Files 📋

Check that you have ALL these files:

### Required Core Files ✅
- [ ] manifest.json
- [ ] popup.html
- [ ] popup.js
- [ ] background.js
- [ ] styles.css

### Required Icon Files ✅
- [ ] icons/icon16.png
- [ ] icons/icon32.png
- [ ] icons/icon48.png
- [ ] icons/icon128.png

### Total: 9 files required

---

## Step 3: Load Extension in Chrome 🌐

1. **Open Chrome Extensions:**
   - Type in address bar: `chrome://extensions/`
   - OR: Three dots menu → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Look for toggle switch in **top-right corner**
   - Click to enable (should turn blue/on)

3. **Load the Extension:**
   - Click "**Load unpacked**" button (top-left area)
   - Navigate to and select the `SnapSite` folder
   - Click "Select Folder" or "Open"

4. **Verify Loading:**
   - Extension should appear in the list
   - Should show SnapSite icon (if icons are present in `icons/`)
   - No error messages

---

## Step 4: Pin Extension (Optional but Recommended) 📌

1. Click the **puzzle piece icon** in Chrome toolbar
2. Find "SnapSite"
3. Click the **pin icon** next to it
4. Extension icon will now appear in your toolbar

---

## Step 5: Test the Extension 🧪

1. **Click the extension icon**
   - Popup should open
   - Should show clean interface with settings

2. **Test with a small site:**
   ```
   URL: https://example.com
   Max pages: 5
   Delay: 2000ms
   ```

3. **Click "Start Crawling"**
   - Should show progress
   - Should create screenshots folder
   - Screenshots should download

4. **Check output:**
   - Open: `Downloads/screenshots/`
   - Should see PNG files with timestamps

---

## ✅ Success Checklist

If all these are true, you're good to go:

- [ ] Extension loads without errors
- [ ] Extension icon appears (not puzzle piece)
- [ ] Popup opens when clicking icon
- [ ] Test crawl completes successfully
- [ ] Screenshots appear in Downloads folder
- [ ] Can pause/resume crawl
- [ ] Settings save when reopening popup

---

## ❌ Common Installation Errors

### "Failed to load extension"
→ Missing manifest.json or syntax error  
→ Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) in this folder

### "Could not load icon"
→ Icons folder missing or wrong file names  
→ Re-clone the repo or ensure `icons/` contains icon16.png, icon32.png, icon48.png, icon128.png

### Extension loads but no icon
→ Icon files are wrong size  
→ Must be exactly 16x16, 32x32, 48x48, 128x128 pixels

### Popup is blank
→ Missing popup.html or popup.js  
→ Verify all files exist

---

## 📁 Correct Folder Structure

Your folder should look like this:

```
SnapSite/
│
├── manifest.json          ← Extension config
├── popup.html             ← UI interface
├── popup.js               ← UI logic
├── background.js          ← Crawling engine
├── styles.css             ← Styling
│
├── icons/                 ← MUST CREATE THIS FOLDER
│   ├── icon16.png         ← 16x16 pixels
│   ├── icon32.png         ← 32x32 pixels
│   ├── icon48.png         ← 48x48 pixels
│   └── icon128.png        ← 128x128 pixels
│
├── docs/                  ← Documentation
│   ├── INSTALL.md         ← This file
│   ├── QUICKSTART.md      ← Quick start guide
│   ├── TROUBLESHOOTING.md ← Problem solving
│   ├── EXAMPLES.md        ← Configuration examples
│   └── FILE_STRUCTURE.md  ← File explanations
│
├── README.md              ← Full documentation (project root)
├── package.json           ← Node.js config
├── .gitignore             ← Git exclusions
└── LICENSE                ← MIT license
```

---

## 🎯 Next Steps After Installation

1. **Read Quick Start:**
   - Open [QUICKSTART.md](QUICKSTART.md) (in `docs/`)
   - Learn basic usage

2. **Check Examples:**
   - Open [EXAMPLES.md](EXAMPLES.md) (in `docs/`)
   - See configuration for different site types

3. **Start Crawling:**
   - Try with a small website first (5-10 pages)
   - Increase limits after testing

4. **Optimize Settings:**
   - Adjust based on site type
   - Monitor screenshot quality

---

## 🆘 Need Help?

If something goes wrong:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) in `docs/` first
2. Check extension console for errors:
   - `chrome://extensions/` → Details → Inspect views
3. Try with default settings
4. Test with `https://example.com`

---

## 🎉 You're Ready!

Once you've completed all steps above, you're ready to start crawling websites and capturing screenshots!

**Happy Crawling! 📸**
