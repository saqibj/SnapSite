// --- Logging (for troubleshooting) ---
const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };
const LOG_BUFFER_MAX = 100;
const LOG_PERSIST_TAIL = 50;
const logBuffer = [];

function log(level, message, detail) {
  const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
  const detailStr = detail !== undefined ? ' ' + (typeof detail === 'object' ? JSON.stringify(detail) : String(detail)) : '';
  const line = `[${ts}] [${level}] ${message}${detailStr}`;
  logBuffer.push(line);
  if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();
  const consoleDetail = detail !== undefined ? (typeof detail === 'object' ? JSON.stringify(detail) : detail) : '';
  if (level === LOG_LEVELS.ERROR) console.error('[SnapSite]', message, consoleDetail);
  else if (level === LOG_LEVELS.WARN) console.warn('[SnapSite]', message, consoleDetail);
  else console.log('[SnapSite]', message, consoleDetail);
  // Persist recent logs so they survive service worker restart (popup can show them after reload)
  if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
    const tail = logBuffer.slice(-LOG_PERSIST_TAIL);
    chrome.storage.local.set({ snapSiteLogTail: tail }).catch(() => {});
  }
}

function logInfo(msg, detail) { log(LOG_LEVELS.INFO, msg, detail); }
function logWarn(msg, detail) { log(LOG_LEVELS.WARN, msg, detail); }
function logError(msg, detail) { log(LOG_LEVELS.ERROR, msg, detail); }

function getLogs() {
  return logBuffer.length > 0 ? [...logBuffer] : null;
}

// Restore persisted log tail when service worker starts (so Logs panel shows something after reload)
chrome.storage.local.get(['snapSiteLogTail'], (r) => {
  if (Array.isArray(r?.snapSiteLogTail) && r.snapSiteLogTail.length > 0) {
    logBuffer.push(...r.snapSiteLogTail);
    if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.splice(0, logBuffer.length - LOG_BUFFER_MAX);
  }
});

// Crawl state management
let crawlState = {
  isRunning: false,
  isPaused: false,
  visited: new Set(),
  toVisit: [],
  baseHost: '',
  baseDomain: '',
  screenshotCount: 0,
  currentUrl: '',
  config: {
    maxPages: 50,
    maxDepth: 10,
    delay: 2000,
    waitForLoad: 3000,
    excludePatterns: [],
    followSubdomains: false,
    ignoreQueryParams: true
  },
  urlDepths: new Map(),
  startTime: null,
  recentPages: []
};

// Message listener for popup communication (must call sendResponse for every branch to avoid "message channel closed" error)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === 'startCrawl') {
      startCrawl(message.url, message.config);
      sendResponse({ ok: true });
    } else if (message.action === 'stopCrawl') {
      stopCrawl();
      sendResponse({ ok: true });
    } else if (message.action === 'pauseCrawl') {
      pauseCrawl();
      sendResponse({ ok: true });
    } else if (message.action === 'resumeCrawl') {
      resumeCrawl();
      sendResponse({ ok: true });
    } else if (message.action === 'getState') {
      sendResponse({
        state: {
          isRunning: crawlState.isRunning,
          isPaused: crawlState.isPaused,
          visited: crawlState.visited.size,
          queueSize: crawlState.toVisit.length,
          screenshotCount: crawlState.screenshotCount,
          currentUrl: crawlState.currentUrl,
          status: getStatus()
        }
      });
    } else if (message.action === 'getLogs') {
      const mem = getLogs();
      if (mem && mem.length > 0) {
        sendResponse({ logs: mem });
      } else {
        chrome.storage.local.get(['snapSiteLogTail'], (r) => {
          const stored = r?.snapSiteLogTail;
          sendResponse({ logs: Array.isArray(stored) ? stored : [], fromStorage: !!stored });
        });
        return true; // keep channel open for async sendResponse
      }
    } else if (message.action === 'clearRecentPages') {
      crawlState.recentPages = [];
      chrome.storage.local.set({ recentPages: [] });
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false });
    }
  } catch (e) {
    logError('Message handler error', e?.message ?? String(e));
    sendResponse({ ok: false, error: e?.message });
  }
  return false; // no async response; we replied synchronously
});

// Start crawling process
async function startCrawl(startUrl, config) {
  try {
    const url = new URL(startUrl);
    logInfo('Crawl started', { url: startUrl, maxPages: config.maxPages, delay: config.delay, waitForLoad: config.waitForLoad });

    // Initialize state
    crawlState.baseHost = url.host;
    crawlState.baseDomain = extractDomain(url.host);
    // Merge config with validated numbers (avoid NaN from popup)
    const defaults = { maxPages: 50, maxDepth: 10, delay: 2000, waitForLoad: 3000 };
    const num = (v, def) => (typeof v === 'number' && !Number.isNaN(v) ? v : def);
    crawlState.config = {
      ...crawlState.config,
      ...config,
      maxPages: num(config.maxPages, defaults.maxPages),
      maxDepth: num(config.maxDepth, defaults.maxDepth),
      delay: num(config.delay, defaults.delay),
      waitForLoad: num(config.waitForLoad, defaults.waitForLoad)
    };
    crawlState.visited.clear();
    crawlState.toVisit = [startUrl];
    crawlState.urlDepths.clear();
    crawlState.urlDepths.set(startUrl, 0);
    crawlState.isRunning = true;
    crawlState.isPaused = false;
    crawlState.screenshotCount = 0;
    crawlState.startTime = Date.now();
    crawlState.recentPages = [];

    updateStatus('Starting crawl...');

    // Start crawling
    crawlNext();
  } catch (error) {
    logError('Start crawl failed: invalid URL', error?.message ?? String(error));
    updateStatus('Error: Invalid URL');
  }
}

// Stop crawling
function stopCrawl() {
  logInfo('Crawl stopped by user');
  crawlState.isRunning = false;
  crawlState.isPaused = false;
  crawlState.toVisit = [];
  updateStatus('Stopped');
}

// Pause crawling
function pauseCrawl() {
  logInfo('Crawl paused');
  crawlState.isPaused = true;
  updateStatus('Paused');
}

// Resume crawling
function resumeCrawl() {
  logInfo('Crawl resumed');
  crawlState.isPaused = false;
  updateStatus('Resumed');
  crawlNext();
}

// Main crawling loop
async function crawlNext() {
  // Check if should continue
  if (!crawlState.isRunning) {
    return;
  }
  
  if (crawlState.isPaused) {
    return;
  }
  
  // Check if reached max pages
  if (crawlState.visited.size >= crawlState.config.maxPages) {
    logInfo('Crawl completed: max pages reached', { visited: crawlState.visited.size, screenshots: crawlState.screenshotCount });
    updateStatus('Completed (max pages reached)');
    crawlState.isRunning = false;
    return;
  }

  // Check if queue is empty
  if (crawlState.toVisit.length === 0) {
    logInfo('Crawl completed: queue empty', { visited: crawlState.visited.size, screenshots: crawlState.screenshotCount });
    updateStatus('Completed');
    crawlState.isRunning = false;
    return;
  }

  // Get next URL
  const url = crawlState.toVisit.shift();

  // Skip if already visited
  if (crawlState.visited.has(url)) {
    logInfo('Skip (already visited)', url);
    crawlNext();
    return;
  }

  // Check depth
  const depth = crawlState.urlDepths.get(url) || 0;
  if (depth > crawlState.config.maxDepth) {
    logInfo('Skip (max depth exceeded)', { url, depth, maxDepth: crawlState.config.maxDepth });
    crawlNext();
    return;
  }

  // Mark as visited
  crawlState.visited.add(url);
  crawlState.currentUrl = url;
  updateStatus(`Crawling: ${truncateUrl(url, 50)}`);
  updateProgress();
  logInfo('Processing page', { url, depth, queueRemaining: crawlState.toVisit.length });

  let tab;
  try {
    // Create new tab
    tab = await chrome.tabs.create({ url, active: false });
    logInfo('Tab created, waiting for load', { tabId: tab.id });

    // Wait for page to load
    let loadTimedOut = false;
    await new Promise((resolve) => {
      const listener = (tabId, info) => {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);

      // Timeout fallback
      setTimeout(() => {
        if (chrome.tabs.onUpdated.hasListener(listener)) {
          chrome.tabs.onUpdated.removeListener(listener);
          loadTimedOut = true;
          resolve();
        }
      }, 30000);
    });

    if (loadTimedOut) {
      logWarn('Page load timed out (30s), continuing anyway', url);
    }

    // Wait for additional load time
    await sleep(crawlState.config.waitForLoad);

    // Take screenshot
    const screenshotSuccess = await takeFullPageScreenshot(tab.id, url);

    // Extract links
    await extractLinks(tab.id, url, depth);

    // Add to recent pages
    addRecentPage(url, screenshotSuccess);
    if (!screenshotSuccess) {
      logWarn('Screenshot failed for page (see ERROR above)', url);
    }

    // Close tab (may already be closed by user or crash)
    try {
      await chrome.tabs.remove(tab.id);
    } catch (e) {
      if (!e?.message?.includes('No tab with id')) {
        logWarn('Could not close tab (may already be closed)', { tabId: tab.id, url });
      }
    }

    // Delay before next request
    await sleep(crawlState.config.delay);

    // Continue to next URL
    crawlNext();
  } catch (error) {
    const errMsg = error?.message ?? String(error);
    logError('Failed to access page', { url, error: errMsg });
    addRecentPage(url, false);

    // Try to close tab if it was created (e.g. user closed it or it crashed)
    try {
      if (typeof tab !== 'undefined' && tab?.id) {
        await chrome.tabs.remove(tab.id);
      }
    } catch (e) {
      // Ignore
    }

    // Continue despite error
    await sleep(crawlState.config.delay);
    crawlNext();
  }
}

// Chrome CDP screenshot dimension limits (exceeding can cause capture to fail)
const MAX_SCREENSHOT_WIDTH = 4096;
const MAX_SCREENSHOT_HEIGHT = 16384;

// Take full page screenshot (with optional retry)
async function takeFullPageScreenshot(tabId, url) {
  const result = await takeFullPageScreenshotOnce(tabId, url);
  if (result) return true;
  logInfo('Screenshot retry after 1s', url);
  await sleep(1000);
  return await takeFullPageScreenshotOnce(tabId, url);
}

async function takeFullPageScreenshotOnce(tabId, url) {
  let tab;
  try {
    // Chrome does not render background tabs; captureScreenshot returns no data for inactive tabs.
    // Activate the tab and focus its window so the page is painted, then capture.
    try {
      tab = await chrome.tabs.get(tabId);
      await chrome.tabs.update(tabId, { active: true });
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      await sleep(800); // allow tab to paint and composite
    } catch (e) {
      logWarn('Could not activate/focus tab for screenshot', { tabId, url, error: e?.message });
      tab = await chrome.tabs.get(tabId).catch(() => null);
    }
    if (!tab) {
      logError('Could not get tab for screenshot', { tabId, url });
      return false;
    }

    // Attach debugger
    await chrome.debugger.attach({ tabId }, '1.3');

    // Get page dimensions (layout/contentSize can be missing on some SPAs or before layout)
    const response = await chrome.debugger.sendCommand(
      { tabId },
      'Page.getLayoutMetrics'
    );
    const layout = response?.result;
    const contentSize = layout?.contentSize;
    const viewport = layout?.layoutViewport;
    let width = contentSize?.width != null ? Math.round(Number(contentSize.width)) : 0;
    let height = contentSize?.height != null ? Math.round(Number(contentSize.height)) : 0;
    if (width < 1 || height < 1) {
      const vw = viewport?.clientWidth ?? viewport?.width;
      const vh = viewport?.clientHeight ?? viewport?.height;
      if (vw != null && vh != null) {
        width = Math.round(Number(vw));
        height = Math.round(Number(vh));
        logInfo('Using layoutViewport (contentSize missing)', { width, height });
      }
    }
    if (width < 1 || height < 1) {
      logWarn('No valid dimensions from getLayoutMetrics; using default 1280x720', { url });
      width = 1280;
      height = 720;
    }
    if (width > MAX_SCREENSHOT_WIDTH || height > MAX_SCREENSHOT_HEIGHT) {
      width = Math.min(width, MAX_SCREENSHOT_WIDTH);
      height = Math.min(height, MAX_SCREENSHOT_HEIGHT);
      logWarn('Page very large; capping capture size', { width, height });
    }
    
    // Capture full page screenshot
    const captureResponse = await chrome.debugger.sendCommand(
      { tabId },
      'Page.captureScreenshot',
      {
        format: 'png',
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width: width,
          height: height,
          scale: 1
        }
      }
    );
    let result = captureResponse?.result;
    let screenshotData = result?.data;
    let viewportResponse = null;

    // If clip-based capture returned no data (e.g. some SPAs), try viewport-only capture
    if (!screenshotData) {
      logWarn('Clip capture had no data; trying viewport-only capture', { url });
      viewportResponse = await chrome.debugger.sendCommand(
        { tabId },
        'Page.captureScreenshot',
        { format: 'png' }
      );
      const viewportResult = viewportResponse?.result;
      screenshotData = viewportResult?.data;
      if (screenshotData) {
        logInfo('Viewport-only capture succeeded', { url });
      }
    }

    // If CDP still returned no data, try extension API captureVisibleTab (viewport only)
    if (!screenshotData && tab.windowId) {
      await chrome.debugger.detach({ tabId }).catch(() => {});
      logInfo('Trying captureVisibleTab fallback (viewport only)', { url });
      try {
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        if (dataUrl) {
          logInfo('CaptureVisibleTab fallback succeeded', { url });
          const filename = sanitizeFilename(url);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          await chrome.downloads.download({
            url: dataUrl,
            filename: `screenshots/${timestamp}_${filename}.png`,
            saveAs: false
          });
          crawlState.screenshotCount++;
          updateProgress();
          return true;
        }
      } catch (e) {
        logWarn('CaptureVisibleTab fallback failed', { url, error: e?.message });
      }
    }

    if (!screenshotData) {
      const respKeys = captureResponse?.result ? Object.keys(captureResponse.result) : [];
      const clipError = captureResponse?.error?.message || captureResponse?.error;
      const viewportError = viewportResponse?.error?.message || viewportResponse?.error;
      logError('Screenshot capture returned no data', {
        url,
        responseKeys: respKeys,
        clipError: clipError || null,
        viewportError: viewportError || null
      });
      await chrome.debugger.detach({ tabId }).catch(() => {});
      return false;
    }

    // Detach debugger
    await chrome.debugger.detach({ tabId });

    // Download screenshot
    const filename = sanitizeFilename(url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    await chrome.downloads.download({
      url: `data:image/png;base64,${screenshotData}`,
      filename: `screenshots/${timestamp}_${filename}.png`,
      saveAs: false
    });

    crawlState.screenshotCount++;
    updateProgress();

    return true;
    
  } catch (error) {
    const errMsg = error?.message ?? String(error);
    logError('Screenshot failed', { url, error: errMsg });

    // Try to detach debugger if attached
    try {
      await chrome.debugger.detach({ tabId });
    } catch (e) {
      // Ignore detach errors
    }

    return false;
  }
}

// Extract links from page
async function extractLinks(tabId, currentUrl, currentDepth) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractLinksFromPage,
      args: [
        crawlState.baseHost,
        crawlState.baseDomain,
        crawlState.config.followSubdomains,
        crawlState.config.ignoreQueryParams
      ]
    });
    
    if (results && results[0] && results[0].result) {
      const links = results[0].result;
      processLinks(links, currentUrl, currentDepth);
      logInfo('Links extracted', { url: currentUrl, count: links.length });
    } else {
      logWarn('No links extracted (script may have failed)', currentUrl);
    }
  } catch (error) {
    const errMsg = error?.message ?? String(error);
    logError('Extract links failed', { url: currentUrl, error: errMsg });
  }
}

// Function injected into page to extract links
function extractLinksFromPage(baseHost, baseDomain, followSubdomains, ignoreQueryParams) {
  const links = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.href)
    .filter(href => {
      try {
        const url = new URL(href);
        
        // Must be HTTP/HTTPS
        if (!url.protocol.startsWith('http')) {
          return false;
        }
        
        // Check domain matching
        if (followSubdomains) {
          // Extract domain from href
          const hrefParts = url.host.split('.');
          const hrefDomain = hrefParts.slice(-2).join('.');
          return hrefDomain === baseDomain;
        } else {
          return url.host === baseHost;
        }
        
      } catch (e) {
        return false;
      }
    })
    .map(href => {
      // Remove query params and hash if configured
      try {
        const url = new URL(href);
        if (ignoreQueryParams) {
          url.search = '';
        }
        url.hash = '';
        return url.toString();
      } catch (e) {
        return href;
      }
    });
  
  return [...new Set(links)]; // Remove duplicates
}

// Process extracted links
function processLinks(links, parentUrl, parentDepth) {
  links.forEach(link => {
    // Skip if already visited or in queue
    if (crawlState.visited.has(link) || crawlState.toVisit.includes(link)) {
      return;
    }
    
    // Check exclusion patterns
    if (shouldExcludeUrl(link)) {
      return;
    }
    
    // Add to queue with depth
    crawlState.toVisit.push(link);
    crawlState.urlDepths.set(link, parentDepth + 1);
  });
}

// Check if URL should be excluded
function shouldExcludeUrl(url) {
  if (!crawlState.config.excludePatterns || crawlState.config.excludePatterns.length === 0) {
    return false;
  }
  
  return crawlState.config.excludePatterns.some(pattern => {
    try {
      return url.includes(pattern);
    } catch (e) {
      return false;
    }
  });
}

// Sanitize filename for saving
function sanitizeFilename(url) {
  try {
    const urlObj = new URL(url);
    let filename = urlObj.pathname === '/' 
      ? 'index' 
      : urlObj.pathname.replace(/\//g, '_');
    
    filename = filename
      .replace(/[^a-z0-9_-]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return filename.substring(0, 100) || 'page';
  } catch (e) {
    return 'page';
  }
}

// Extract domain from host
function extractDomain(host) {
  const parts = host.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return host;
}

// Add page to recent pages
function addRecentPage(url, success) {
  const page = { url, success, timestamp: Date.now() };
  crawlState.recentPages.unshift(page);
  
  // Keep only last 50
  if (crawlState.recentPages.length > 50) {
    crawlState.recentPages = crawlState.recentPages.slice(0, 50);
  }
  
  // Save to storage
  chrome.storage.local.set({ recentPages: crawlState.recentPages });
  
  // Notify popup
  updateUI({
    recentPage: page
  });
}

// Get current status message
function getStatus() {
  if (!crawlState.isRunning) {
    return 'Idle';
  }
  if (crawlState.isPaused) {
    return 'Paused';
  }
  if (crawlState.currentUrl) {
    return `Crawling: ${truncateUrl(crawlState.currentUrl, 50)}`;
  }
  return 'Running';
}

// Update status
function updateStatus(status) {
  updateUI({ status });
}

// Update progress
function updateProgress() {
  const progress = crawlState.config.maxPages > 0
    ? Math.min(100, (crawlState.visited.size / crawlState.config.maxPages) * 100)
    : 0;
  
  updateUI({
    crawled: crawlState.visited.size,
    screenshots: crawlState.screenshotCount,
    queue: crawlState.toVisit.length,
    progress,
    currentUrl: crawlState.currentUrl
  });
}

// Send UI update to popup
function updateUI(data) {
  chrome.runtime.sendMessage({
    action: 'updateUI',
    ...data
  }).catch(() => {
    // Popup might be closed, ignore error
  });
}

// Truncate URL for display
function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  logInfo('SnapSite installed');
});
