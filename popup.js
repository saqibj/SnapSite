// DOM Elements
const startUrlInput = document.getElementById('startUrl');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const statusEl = document.getElementById('status');
const crawledEl = document.getElementById('crawled');
const screenshotsEl = document.getElementById('screenshots');
const queueEl = document.getElementById('queue');
const progressFillEl = document.getElementById('progressFill');
const currentUrlEl = document.getElementById('currentUrl');
const recentPagesEl = document.getElementById('recentPages');

// Settings elements
const maxPagesInput = document.getElementById('maxPages');
const maxDepthInput = document.getElementById('maxDepth');
const delayInput = document.getElementById('delay');
const waitForLoadInput = document.getElementById('waitForLoad');
const excludePatternsInput = document.getElementById('excludePatterns');
const followSubdomainsCheckbox = document.getElementById('followSubdomains');
const ignoreQueryParamsCheckbox = document.getElementById('ignoreQueryParams');

// Settings toggle
const settingsToggle = document.getElementById('settingsToggle');
const settingsContent = document.getElementById('settingsContent');
const toggleIcon = settingsToggle.querySelector('.toggle-icon');

// Logs
const logsToggle = document.getElementById('logsToggle');
const logsContent = document.getElementById('logsContent');
const logsOutput = document.getElementById('logsOutput');
const refreshLogsBtn = document.getElementById('refreshLogsBtn');
const copyLogsBtn = document.getElementById('copyLogsBtn');
const copyLastErrorBtn = document.getElementById('copyLastErrorBtn');

let isPaused = false;

// Load saved settings
chrome.storage.local.get([
  'maxPages', 'maxDepth', 'delay', 'waitForLoad', 
  'excludePatterns', 'followSubdomains', 'ignoreQueryParams'
], (result) => {
  if (result.maxPages) maxPagesInput.value = result.maxPages;
  if (result.maxDepth) maxDepthInput.value = result.maxDepth;
  if (result.delay) delayInput.value = result.delay;
  if (result.waitForLoad) waitForLoadInput.value = result.waitForLoad;
  if (result.excludePatterns) excludePatternsInput.value = result.excludePatterns;
  if (result.followSubdomains !== undefined) followSubdomainsCheckbox.checked = result.followSubdomains;
  if (result.ignoreQueryParams !== undefined) ignoreQueryParamsCheckbox.checked = result.ignoreQueryParams;
});

// Settings toggle functionality
settingsToggle.addEventListener('click', () => {
  settingsContent.classList.toggle('collapsed');
  toggleIcon.classList.toggle('rotated');
});

// Logs section: start collapsed (guard if DOM not present, e.g. old popup)
if (logsContent) {
  logsContent.classList.add('collapsed');
  const logsIcon = logsToggle?.querySelector('.toggle-icon');
  if (logsIcon) logsIcon.classList.add('rotated');
}
if (logsToggle) {
  logsToggle.addEventListener('click', () => {
    if (!logsContent) return;
    logsContent.classList.toggle('collapsed');
    const icon = logsToggle.querySelector('.toggle-icon');
    if (icon) icon.classList.toggle('rotated');
    if (!logsContent.classList.contains('collapsed')) refreshLogs();
  });
}

function refreshLogs() {
  if (!logsOutput) return;
  chrome.runtime.sendMessage({ action: 'getLogs' }, (response) => {
    if (chrome.runtime.lastError) {
      logsOutput.textContent = '(Extension context invalid. Reload the extension.)';
      return;
    }
    if (response && response.logs) {
      const lines = response.logs;
      const text = lines.length
        ? (response.fromStorage ? '(Logs from previous session — extension was reloaded or restarted.)\n\n' + lines.join('\n') : lines.join('\n'))
        : '(No log entries yet. Start a crawl to see logs.)';
      logsOutput.textContent = text;
    } else {
      logsOutput.textContent = '(Could not load logs. Reload the extension and try again.)';
    }
  });
}
if (refreshLogsBtn) refreshLogsBtn.addEventListener('click', refreshLogs);
if (copyLogsBtn) {
  copyLogsBtn.addEventListener('click', () => {
    if (!logsOutput) return;
    const text = logsOutput.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyLogsBtn.textContent = 'Copied!';
      setTimeout(() => { copyLogsBtn.textContent = 'Copy logs'; }, 1500);
    }).catch(() => {
      copyLogsBtn.textContent = 'Copy failed';
      setTimeout(() => { copyLogsBtn.textContent = 'Copy logs'; }, 1500);
    });
  });
}
if (copyLastErrorBtn) {
  copyLastErrorBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'getLogs' }, (response) => {
      const btn = copyLastErrorBtn;
      if (chrome.runtime.lastError || !response?.logs?.length) {
        btn.textContent = 'No logs';
        setTimeout(() => { btn.textContent = 'Copy last error'; }, 1500);
        return;
      }
      const lines = response.logs;
      const lastError = lines.slice().reverse().find(line => line.includes('[ERROR]'));
      const text = lastError || '';
      if (!text) {
        btn.textContent = 'No error in logs';
        setTimeout(() => { btn.textContent = 'Copy last error'; }, 1500);
        return;
      }
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy last error'; }, 1500);
      }).catch(() => {
        btn.textContent = 'Copy failed';
        setTimeout(() => { btn.textContent = 'Copy last error'; }, 1500);
      });
    });
  });
}

// Save settings when changed
const parseNum = (val, defaultVal) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? defaultVal : n;
};
const saveSettings = () => {
  chrome.storage.local.set({
    maxPages: parseNum(maxPagesInput.value, 50),
    maxDepth: parseNum(maxDepthInput.value, 10),
    delay: parseNum(delayInput.value, 2000),
    waitForLoad: parseNum(waitForLoadInput.value, 3000),
    excludePatterns: excludePatternsInput.value,
    followSubdomains: followSubdomainsCheckbox.checked,
    ignoreQueryParams: ignoreQueryParamsCheckbox.checked
  });
};

maxPagesInput.addEventListener('change', saveSettings);
maxDepthInput.addEventListener('change', saveSettings);
delayInput.addEventListener('change', saveSettings);
waitForLoadInput.addEventListener('change', saveSettings);
excludePatternsInput.addEventListener('change', saveSettings);
followSubdomainsCheckbox.addEventListener('change', saveSettings);
ignoreQueryParamsCheckbox.addEventListener('change', saveSettings);

// Start crawling
startBtn.addEventListener('click', () => {
  const url = startUrlInput.value.trim();
  
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }
  
  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    alert('Please enter a valid URL (include http:// or https://)');
    return;
  }
  
  const config = {
    maxPages: parseNum(maxPagesInput.value, 50),
    maxDepth: parseNum(maxDepthInput.value, 10),
    delay: parseNum(delayInput.value, 2000),
    waitForLoad: parseNum(waitForLoadInput.value, 3000),
    excludePatterns: excludePatternsInput.value.split(',').map(p => p.trim()).filter(p => p),
    followSubdomains: followSubdomainsCheckbox.checked,
    ignoreQueryParams: ignoreQueryParamsCheckbox.checked
  };
  
  chrome.runtime.sendMessage({ 
    action: 'startCrawl', 
    url,
    config
  });
  
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  isPaused = false;
  pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
});

// Pause/Resume crawling
pauseBtn.addEventListener('click', () => {
  if (isPaused) {
    chrome.runtime.sendMessage({ action: 'resumeCrawl' });
    pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
    isPaused = false;
  } else {
    chrome.runtime.sendMessage({ action: 'pauseCrawl' });
    pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume';
    isPaused = true;
  }
});

// Stop crawling
stopBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to stop crawling?')) {
    chrome.runtime.sendMessage({ action: 'stopCrawl' });
    resetUI();
  }
});

// View downloads
downloadAllBtn.addEventListener('click', () => {
  chrome.downloads.showDefaultFolder();
});

// Clear history (sync with background so it doesn't repopulate)
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Clear recent pages history?')) {
    recentPagesEl.innerHTML = '';
    chrome.runtime.sendMessage({ action: 'clearRecentPages' });
  }
});

// Reset UI to initial state
function resetUI() {
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  isPaused = false;
  pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
}

// Update UI from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateUI') {
    // Update status
    if (message.status) {
      statusEl.textContent = message.status;
      
      // Add pulsing animation when crawling
      if (message.status.includes('Crawling')) {
        statusEl.classList.add('pulsing');
      } else {
        statusEl.classList.remove('pulsing');
      }
      
      // Reset UI when completed or stopped
      if (message.status === 'Stopped' || (message.status && message.status.startsWith('Completed'))) {
        resetUI();
        if (downloadAllBtn) downloadAllBtn.disabled = false;
        if (currentUrlEl) currentUrlEl.textContent = '';
      }
    }

    // Update counters
    if (message.crawled !== undefined) {
      crawledEl.textContent = message.crawled;
    }
    
    if (message.screenshots !== undefined) {
      screenshotsEl.textContent = message.screenshots;
    }
    
    if (message.queue !== undefined) {
      queueEl.textContent = message.queue;
    }
    
    // Update progress bar
    if (message.progress !== undefined) {
      progressFillEl.style.width = `${message.progress}%`;
    }
    
    // Update current URL
    if (message.currentUrl !== undefined) {
      if (currentUrlEl) {
        currentUrlEl.textContent = message.currentUrl ? `Currently processing: ${message.currentUrl}` : '';
      }
    }
    
    // Add to recent pages
    if (message.recentPage) {
      addRecentPage(message.recentPage);
    }
  }
});

// Add page to recent pages list
function addRecentPage(page) {
  if (!page || !page.url || !recentPagesEl) return;
  const pageItem = document.createElement('div');
  pageItem.className = `recent-page-item ${page.success ? 'success' : 'error'}`;

  const icon = page.success ? '✅' : '❌';
  const url = typeof page.url === 'string' ? page.url : '';
  pageItem.innerHTML = `
    <span class="status-icon">${icon}</span>
    <span>${truncateUrl(url, 60)}</span>
  `;

  recentPagesEl.insertBefore(pageItem, recentPagesEl.firstChild);
  
  // Keep only last 10 items
  while (recentPagesEl.children.length > 10) {
    recentPagesEl.removeChild(recentPagesEl.lastChild);
  }
}

// Truncate URL for display
function truncateUrl(url, maxLength) {
  const s = typeof url === 'string' ? url : '';
  if (s.length <= maxLength) return s;
  return s.substring(0, maxLength - 3) + '...';
}

// Load initial state from background (guard against extension reload / no response)
chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
  if (chrome.runtime.lastError || !response?.state) return;
  const state = response.state;

  if (state.isRunning) {
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = false;
    if (state.isPaused) {
      isPaused = true;
      if (pauseBtn) pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume';
    }
  }

  if (statusEl) statusEl.textContent = state.status || 'Idle';
  if (crawledEl) crawledEl.textContent = state.visited ?? 0;
  if (screenshotsEl) screenshotsEl.textContent = state.screenshotCount ?? 0;
  if (queueEl) queueEl.textContent = state.queueSize ?? 0;
  if (currentUrlEl) currentUrlEl.textContent = state.currentUrl ? `Currently processing: ${state.currentUrl}` : '';
});

// Load recent pages from storage
chrome.storage.local.get(['recentPages'], (result) => {
  if (result.recentPages && result.recentPages.length > 0) {
    result.recentPages.slice(0, 10).forEach(page => {
      addRecentPage(page);
    });
  }
});

// Auto-fill current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url && !startUrlInput.value) {
    const url = tabs[0].url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      startUrlInput.value = url;
    }
  }
});
