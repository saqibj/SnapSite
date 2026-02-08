# Changelog

All notable changes to SnapSite are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses the version number defined in `manifest.json` (and kept in sync in `package.json`).

## [Unreleased]

- Nothing yet.

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

[Unreleased]: https://github.com/saqibj/SnapSite/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/saqibj/SnapSite/releases/tag/v1.0.0
