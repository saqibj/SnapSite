# 📸 SnapSite

A powerful Chrome extension that automatically crawls websites and captures full-page screenshots of every page within the same domain.

**Repository:** [github.com/saqibj/SnapSite](https://github.com/saqibj/SnapSite)  
**Version:** Defined in `manifest.json` (and `package.json`). See [CHANGELOG.md](CHANGELOG.md) for release history.

## ✨ Features

- **Automatic Crawling** - Intelligently discovers and visits all pages within a website
- **Full-Page Screenshots** - Captures complete page content, not just the visible viewport
- **Domain Scoped** - Only crawls pages within the specified domain (no external links)
- **Smart Configuration**:
  - Set maximum pages and crawl depth
  - Configurable delays between requests
  - Exclude specific URL patterns
  - Optional subdomain crawling
  - Query parameter handling
- **Real-time Progress** - See crawl status, queue size, and screenshots taken
- **Pause/Resume** - Control the crawl process at any time
- **Recent Pages View** - Track successfully crawled pages
- **Auto-download** - Screenshots automatically saved to Downloads folder

## 📋 Requirements

- Google Chrome browser (version 88+)
- Sufficient disk space for screenshots
- Active internet connection

## 📁 Project Structure

```
SnapSite/
├── manifest.json          # Extension config (Manifest V3)
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── background.js          # Crawling engine (service worker)
├── styles.css             # Popup styling
├── icons/                 # Extension icons (16, 32, 48, 128px)
├── docs/                  # Documentation
│   ├── INSTALL.md         # Installation checklist
│   ├── QUICKSTART.md      # Quick start guide
│   ├── EXAMPLES.md        # Configuration examples
│   ├── TROUBLESHOOTING.md # Problem solving
│   └── FILE_STRUCTURE.md  # File reference
├── package.json
├── .gitignore
├── LICENSE
├── CHANGELOG.md           # Release history
└── README.md              # This file
```

## 📚 Documentation

| Doc | Description |
|-----|--------------|
| [INSTALL.md](docs/INSTALL.md) | Step-by-step installation checklist |
| [QUICKSTART.md](docs/QUICKSTART.md) | Get running in 3 steps |
| [EXAMPLES.md](docs/EXAMPLES.md) | Configuration examples by site type |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md) | File-by-file reference |
| [CHANGELOG.md](CHANGELOG.md) | Release history and versioning |

## 🚀 Installation

### Method 1: Clone and Load (Recommended)

1. **Get the code**
   ```bash
   git clone https://github.com/saqibj/SnapSite.git
   cd SnapSite
   ```
2. **Load the extension** in Chrome (see *Load Unpacked Extension* below). Icons are included in the repo.

### Load Unpacked Extension

1. **Get the extension**
   - Clone the repo (see above) or download the `SnapSite` folder
   - Icons are already in `icons/`—no need to generate them

2. **Open Chrome Extensions**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `SnapSite` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "SnapSite" and click the pin icon
   - The extension icon will now appear in your toolbar

**Icons:** The repo includes ready-to-use icons in `icons/` (16×16, 32×32, 48×48, 128×128). No generation step needed.

## 📖 How to Use

### Basic Usage

1. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - The popup window will appear

2. **Enter Website URL**
   - Enter the starting URL (e.g., `https://example.com`)
   - The current tab's URL is auto-filled if valid

3. **Configure Settings (Optional)**
   - Click "⚙️ Settings" to expand options
   - Adjust crawl parameters as needed

4. **Start Crawling**
   - Click "▶️ Start Crawling"
   - Watch the progress in real-time
   - Screenshots are automatically saved to `Downloads/screenshots/`

5. **Control the Crawl**
   - **Pause** - Temporarily pause crawling
   - **Resume** - Continue from where you paused
   - **Stop** - Completely stop the crawl

### Settings Explained

| Setting | Description | Default |
|---------|-------------|---------|
| **Max Pages** | Maximum number of pages to crawl | 50 |
| **Max Depth** | How many clicks deep to crawl from start | 10 |
| **Delay (ms)** | Wait time between page requests | 2000 |
| **Wait for Load (ms)** | Time to wait for page content to load | 3000 |
| **Exclude Patterns** | URLs containing these patterns are skipped | None |
| **Include Subdomains** | Crawl all subdomains of the site | Off |
| **Ignore Query Params** | Treat URLs with different params as same page | On |

### Best Practices

**For Small Sites (< 20 pages)**
- Max Pages: 50
- Delay: 1000ms
- Wait for Load: 2000ms

**For Medium Sites (20-100 pages)**
- Max Pages: 100
- Delay: 2000ms
- Wait for Load: 3000ms

**For Large Sites (100+ pages)**
- Max Pages: 200
- Delay: 3000ms
- Wait for Load: 4000ms
- Consider excluding admin/API paths

**Exclude Pattern Examples**
- `/admin/, /api/, /login/` - Skip admin and API pages
- `.pdf, .zip` - Skip downloadable files
- `/search?` - Skip search result pages

## 📁 Output

Screenshots are saved to:
```
Downloads/screenshots/
└── YYYY-MM-DDTHH-MM-SS_filename.png
```

Naming convention:
- Timestamp prefix for chronological sorting
- URL path converted to filename
- Sanitized for file system compatibility

## 🔧 Advanced Features

### Using Exclude Patterns

Exclude patterns help you focus on specific content:

```
# Skip these patterns (comma-separated)
/blog/, /news/, /archive/

# Result: Only crawls main site pages
```

### Subdomain Crawling

Enable "Include Subdomains" to crawl:
- `example.com`
- `blog.example.com`
- `shop.example.com`

### Depth Control

Depth limits how far from the starting page to crawl:
- Depth 1: Only pages linked from start page
- Depth 2: Pages linked from depth 1 pages
- Depth 3+: Continues following links deeper

## ⚠️ Limitations & Notes

1. **Rate Limiting**
   - Respect website rate limits
   - Use appropriate delays (2000ms+)
   - Large sites may take considerable time

2. **Browser Resources**
   - Each page opens in a background tab
   - Memory usage increases with larger sites
   - Close other tabs for better performance

3. **Dynamic Content**
   - Some JavaScript-heavy sites may need longer wait times
   - Adjust "Wait for Load" setting if content is missing

4. **Storage Space**
   - Full-page screenshots can be large (500KB - 5MB each)
   - Ensure sufficient disk space before crawling large sites

5. **Permissions**
   - Extension requires debugger permission for full-page screenshots
   - This is normal and safe for screenshot functionality

## 🐛 Troubleshooting

### Screenshots are incomplete
- Increase "Wait for Load" time to 4000-6000ms
- Some sites load content asynchronously

### Crawl seems stuck
- Check browser console for errors (F12)
- Try reducing "Max Pages" setting
- Restart the crawl

### Missing pages
- Check "Max Depth" - increase if needed
- Some pages may not be linked from discovered pages
- Verify exclude patterns aren't too broad

### Extension icon not showing
- Ensure all icon files are present in `icons/` folder
- Reload the extension from `chrome://extensions/`

## 🔒 Privacy & Security

- **Local Processing** - All crawling happens locally
- **No Data Collection** - Extension doesn't send data anywhere
- **No Analytics** - No tracking or telemetry
- **Open Source** - Inspect the code yourself

## 📝 Technical Details

**Technologies Used:**
- Chrome Extension Manifest V3
- Chrome Debugger API (for full-page screenshots)
- Chrome Tabs API (for page navigation)
- Chrome Downloads API (for saving screenshots)
- Chrome Storage API (for settings persistence)

**How It Works:**
1. Starts at the provided URL
2. Captures full-page screenshot using Debugger API
3. Extracts all same-domain links from the page
4. Adds new links to crawl queue
5. Repeats for each URL until max pages reached

## 🤝 Contributing

Found a bug or want to add a feature?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use and modify

## 🙏 Credits

Created for automated website documentation and archival purposes.

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](docs/TROUBLESHOOTING.md) section
- Review Chrome Extension documentation
- [Open an issue](https://github.com/saqibj/SnapSite/issues) on the repository

---

**Happy Crawling! 📸**
