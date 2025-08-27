// This file will be compiled to popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const messageElement = document.getElementById('message');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const winsCountElement = document.getElementById('winsCount');
  const lossesCountElement = document.getElementById('lossesCount');
  const resetStatsBtn = document.getElementById('resetStatsBtn');
  
  if (!messageElement) {
    console.error('Message element not found!');
    return;
  }

  if (!toggleSwitch) {
    console.error('Toggle switch element not found!');
    return;
  }

  if (!winsCountElement || !lossesCountElement || !resetStatsBtn) {
    console.error('Stats elements not found!');
    return;
  }

  const setMessage = (text: string, color: string) => {
    messageElement.textContent = text;
    messageElement.style.color = color;
    console.log(`Setting message: "${text}" with color: ${color}`);
  };

  try {
    console.log('Extension popup loaded, checking current tab...');
    setMessage('Loading...', '#666');

    // Check if Chrome APIs are available
    if (!chrome || !chrome.tabs) {
      setMessage('Chrome tabs API not available', '#d32f2f');
      console.error('Chrome tabs API not available');
      return;
    }

    // Try multiple approaches to get the active tab
    let tabs: chrome.tabs.Tab[] = [];
    
    // First try: lastFocusedWindow
    try {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      console.log('Tabs from lastFocusedWindow:', tabs);
    } catch (err) {
      console.warn('lastFocusedWindow query failed:', err);
    }

    // Second try: currentWindow if first failed
    if (!tabs || tabs.length === 0) {
      try {
        tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Tabs from currentWindow:', tabs);
      } catch (err) {
        console.warn('currentWindow query failed:', err);
      }
    }

    // Third try: get all tabs and find active one
    if (!tabs || tabs.length === 0) {
      try {
        const allTabs = await chrome.tabs.query({});
        tabs = allTabs.filter(tab => tab.active);
        console.log('Tabs from all tabs filter:', tabs);
      } catch (err) {
        console.warn('all tabs query failed:', err);
      }
    }

    if (!tabs || tabs.length === 0) {
      setMessage('No active tabs found', '#d32f2f');
      console.error('No active tabs found after all attempts');
      return;
    }

    const tab = tabs[0];
    console.log('Resolved current tab:', tab);
    console.log('Tab ID:', tab.id);
    console.log('Tab URL:', tab.url);
    console.log('Tab pendingUrl:', (tab as any).pendingUrl);

    // Get the URL from the tab
    const rawUrl = tab.url || (tab as any).pendingUrl || '';

    if (!rawUrl) {
      setMessage('Tab URL is undefined. Please refresh the page and try again.', '#d32f2f');
      console.warn('Tab URL and pendingUrl are both undefined.');
      console.log('Available tab properties:', Object.keys(tab));
      return;
    }

    console.log('Resolved URL:', rawUrl);

    let hostname = '';
    try {
      const parsed = new URL(rawUrl);
      hostname = parsed.hostname;
      console.log('Parsed URL hostname:', hostname);
    } catch (parseErr) {
      console.error('Failed to parse URL:', rawUrl, parseErr);
      setMessage('Failed to parse current page URL', '#d32f2f');
      return;
    }

    if (hostname === 'chess.com' || hostname.endsWith('.chess.com')) {
      setMessage("You're on Chess.com! Extension is active.", '#2e7d32');
      console.log('Chess.com detected!');
    } else {
      setMessage(`You're not on Chess.com (currently on: ${hostname})`, '#666');
      console.log('Not on chess.com, current hostname:', hostname);
    }
  } catch (error) {
    console.error('Error accessing tab:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setMessage(`Error: ${errorMessage}`, '#d32f2f');
  }

  // Load and display game statistics
  const loadStats = async () => {
    try {
      const result = await chrome.storage.sync.get(['gameStats']);
      const stats = result.gameStats || { wins: 0, losses: 0 };
      
      winsCountElement.textContent = stats.wins.toString();
      lossesCountElement.textContent = stats.losses.toString();
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  // Initialize toggle state
  try {
    const result = await chrome.storage.sync.get(['hideTimeButtons']);
    const isEnabled = result.hideTimeButtons !== false; // Default to true
    
    if (isEnabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
  } catch (error) {
    console.error('Error loading toggle state:', error);
  }

  // Load initial stats
  await loadStats();

  // Handle toggle click
  toggleSwitch.addEventListener('click', async () => {
    try {
      const isCurrentlyActive = toggleSwitch.classList.contains('active');
      const newState = !isCurrentlyActive;
      
      // Update UI immediately
      if (newState) {
        toggleSwitch.classList.add('active');
      } else {
        toggleSwitch.classList.remove('active');
      }
      
      // Save to storage
      await chrome.storage.sync.set({ hideTimeButtons: newState });
      console.log('Toggle state saved:', newState);
      
      // Notify content script to refresh
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshButtonHiding' });
        } catch (msgError) {
          console.log('Could not send message to content script (tab may not have the extension loaded)');
        }
      }
    } catch (error) {
      console.error('Error toggling setting:', error);
    }
  });

  // Handle reset stats button
  resetStatsBtn.addEventListener('click', async () => {
    try {
      const confirmed = confirm('Are you sure you want to reset your game statistics? This cannot be undone.');
      if (confirmed) {
        await chrome.storage.sync.set({ gameStats: { wins: 0, losses: 0 } });
        await loadStats(); // Refresh display
        console.log('Game statistics reset');
      }
    } catch (error) {
      console.error('Error resetting stats:', error);
    }
  });

  // Listen for storage changes to update stats in real-time
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.gameStats) {
      const newStats = changes.gameStats.newValue || { wins: 0, losses: 0 };
      winsCountElement.textContent = newStats.wins.toString();
      lossesCountElement.textContent = newStats.losses.toString();
    }
  });
});
