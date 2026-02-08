// --- Logging (for troubleshooting) ---
const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };
const LOG_BUFFER_MAX = 100;
const logBuffer = [];

function log(level, message, detail) {
  const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
  const detailStr = detail !== undefined ? ' ' + (typeof detail === 'object' ? JSON.stringify(detail) : String(detail)) : '';
  const line = `[${ts}] [${level}] ${message}${detailStr}`;
  logBuffer.push(line);
  if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();
  if (level === LOG_LEVELS.ERROR) console.error('[SnapSite]', message, detail ?? '');
  else if (level === LOG_LEVELS.WARN) console.warn('[SnapSite]', message, detail ?? '');
  else console.log('[SnapSite]', message, detail ?? '');
}

function logInfo(msg, detail) { log(LOG_LEVELS.INFO, msg, detail); }
function logWarn(msg, detail) { log(LOG_LEVELS.WARN, msg, detail); }
function logError(msg, detail) { log(LOG_LEVELS.ERROR, msg, detail); }

function getLogs() { return [...logBuffer]; }

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

// Message listener for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startCrawl') {
    startCrawl(message.url, message.config);
  } else if (message.action === 'stopCrawl') {
    stopCrawl();
  } else if (message.action === 'pauseCrawl') {
    pauseCrawl();
  } else if (message.action === 'resumeCrawl') {
    resumeCrawl();
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
    sendResponse({ logs: getLogs() });
  }
  return true;
});

// Start crawling process
async function startCrawl(startUrl, config) {
  try {
    const url = new URL(startUrl);
    logInfo('Crawl started', { url: startUrl, maxPages: config.maxPages, delay: config.delay, waitForLoad: config.waitForLoad });

    // Initialize state
    crawlState.baseHost = url.host;
    crawlState.baseDomain = extractDomain(url.host);
    crawlState.config = { ...crawlState.config, ...config };
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

  try {
    // Create new tab
    const tab = await chrome.tabs.create({ url, active: false });
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

    // Close tab
    await chrome.tabs.remove(tab.id);

    // Delay before next request
    await sleep(crawlState.config.delay);

    // Continue to next URL
    crawlNext();
  } catch (error) {
    const errMsg = error?.message ?? String(error);
    logError('Failed to access page', { url, error: errMsg });
    addRecentPage(url, false);

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
  try {
    // Attach debugger
    await chrome.debugger.attach({ tabId }, '1.3');
    
    // Get page dimensions
    const { result: layout } = await chrome.debugger.sendCommand(
      { tabId },
      'Page.getLayoutMetrics'
    );
    
    let width = Math.round(layout.contentSize.width);
    let height = Math.round(layout.contentSize.height);
    
    // Cap dimensions to avoid CDP capture failures on very large pages
    if (width < 1) width = 800;
    if (height < 1) height = 600;
    if (width > MAX_SCREENSHOT_WIDTH || height > MAX_SCREENSHOT_HEIGHT) {
      width = Math.min(width, MAX_SCREENSHOT_WIDTH);
      height = Math.min(height, MAX_SCREENSHOT_HEIGHT);
      logWarn('Page very large; capping capture size', { width, height });
    }
    
    // Capture full page screenshot
    const { result } = await chrome.debugger.sendCommand(
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
    
    // Detach debugger
    await chrome.debugger.detach({ tabId });
    
    // Download screenshot
    const filename = sanitizeFilename(url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    await chrome.downloads.download({
      url: `data:image/png;base64,${result.data}`,
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
