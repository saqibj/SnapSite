# Changelog

All notable changes to SnapSite are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses the version number defined in `manifest.json` (and kept in sync in `package.json`).

## [Unreleased]

- Nothing yet.

## [1.1.0] - 2026-02-08

### Added

- **Screenshot fallbacks when CDP returns no data**
  - Activate tab and focus its window before capture (Chrome does not render background tabs); 800 ms paint delay.
  - Viewport-only CDP capture attempt when clip-based capture has no data.
  - **captureVisibleTab** fallback: when both CDP attempts return no data, use `chrome.tabs.captureVisibleTab` to save a viewport screenshot so crawls still produce images on affected sites.
- **Logging persistence and Copy last error**
  - ERROR and WARN lines are persisted to storage (last 50 lines) so logs survive service worker restart.
  - When the in-memory log buffer is empty, the Logs panel loads from storage and shows a “Logs from previous session” hint.
  - Log buffer is restored from storage when the service worker starts.
  - **Copy last error** button in the Logs toolbar copies the most recent `[ERROR]` line to the clipboard.
- **clearRecentPages** message so clearing history in the popup also clears the background state and storage.
- **windows** permission in manifest (for focusing the window before screenshot).

### Changed

- **Message handling:** Every message branch now calls `sendResponse()` and the listener returns `false` to avoid “message channel closed” errors.
- **Screenshot error logging:** When capture returns no data, log `clipError` and `viewportError` from CDP responses; console log detail is stringified so objects don’t show as `[object Object]`.
- **Config validation:** Crawl config numbers (maxPages, maxDepth, delay, waitForLoad) are validated with fallbacks so invalid or empty popup values don’t produce NaN.
- **Tab handling:** Tab is closed inside a try/catch (handles “tab already closed”); on crawl error we attempt to close the tab before continuing.
- **Popup:** Completion detection uses `status.startsWith('Completed')`; current URL is cleared when crawl completes; parseNum() for all numeric settings; guards for logs DOM and getState; truncateUrl safe for non-string; addRecentPage guards for missing page/url.

### Fixed

- Screenshot “returned no data” on inactive tabs by activating and focusing the tab’s window before capture.
- Logs panel showing “No log entries yet” after a reload by persisting and restoring recent ERROR/WARN lines.
- Red X / no screenshots on some sites by adding the captureVisibleTab viewport fallback.
- Troubleshooting doc: note about Chrome not capturing background tabs and about the captureVisibleTab fallback.

---

## [1.0.0] - 2026-02-08

### Added

- Initial SnapSite Chrome extension: crawl websites and capture full-page screenshots within a domain.
- Popup UI with URL input, collapsible settings (max pages, depth, delay, wait for load, exclude patterns, subdomains, query params), Start/Pause/Stop, progress, recent pages, and downloads.
- Background service worker: tab-based crawling, Chrome Debugger API for full-page screenshots, link extraction, same-domain scoping, depth and exclusion rules.
- Icons included in repo (`icons/`); no generation step required.
- **Logging for troubleshooting**
  - In-memory log buffer (last 100 lines) with `[HH:mm:ss] [INFO|WARN|ERROR]` prefix.
  - Logs for: crawl start/stop/pause/resume, each URL (processing/skip/timeout), screenshot success/failure (with error message), link extraction, page access failures, completion.
  - Popup **Logs** section (collapsible): Refresh, Copy logs, and hint to Inspect service worker for full console.
  - New message `getLogs` to retrieve recent logs from the popup.
- **Screenshot reliability**
  - Automatic retry once after 1s on screenshot failure.
  - Dimension capping (max 4096×16384 px) to avoid Chrome CDP capture failures on very large pages.
  - Fallback dimensions when layout returns invalid or zero size.
- Documentation: README (project structure, docs table, clone instructions), `docs/` (INSTALL, QUICKSTART, EXAMPLES, TROUBLESHOOTING, FILE_STRUCTURE) and CHANGELOG.

### Changed

- App name set to **SnapSite** everywhere (manifest, popup, docs, package.json).
- Project structure: documentation moved into `docs/`; directory tree and cross-links updated in README and all docs.
- Installation flow simplified: icons included; clone-and-load or load unpacked only.

### Removed

- Icon generation assets: `icon-generator.html`, `generate-icons.js`, `generate-icons.py`; installation no longer requires generating icons.

### Fixed

- Screenshot failures on very tall/large pages (dimension cap and retry).
- Red X / failed screenshots: troubleshooting doc updated with causes and solutions (wait for load, capping, Inspect service worker).

---

[Unreleased]: https://github.com/saqibj/SnapSite/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/saqibj/SnapSite/releases/tag/v1.1.0
[1.0.0]: https://github.com/saqibj/SnapSite/releases/tag/v1.0.0
