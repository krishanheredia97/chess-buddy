// Content script to hide specific time control buttons on Chess.com
console.log('Chess.com content script loaded');

// Check if button hiding is enabled
async function isButtonHidingEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.sync.get(['hideTimeButtons']);
    return result.hideTimeButtons !== false; // Default to true if not set
  } catch (error) {
    console.log('Error checking button hiding setting:', error);
    return true; // Default to enabled
  }
}

// Function to hide time control buttons
async function hideTimeControlButtons() {
  // Check if button hiding is enabled
  const isEnabled = await isButtonHidingEnabled();
  if (!isEnabled) {
    console.log('Button hiding is disabled, skipping...');
    return;
  }

  // Find all time selector buttons
  const timeButtons = document.querySelectorAll('.time-selector-button-button');
  
  timeButtons.forEach((button) => {
    const buttonText = button.textContent?.trim();
    
    // Check if the button text matches our criteria
    if (buttonText === '30 sec' || buttonText === '20 sec | 1' || buttonText === '5 | 5' || 
        buttonText === '5 | 2' || buttonText === '1 min' || buttonText === '1 | 1' || 
        buttonText === '2 | 1' || buttonText === '3 min' || buttonText === '3 | 2' || 
        buttonText === '5 min') {
      console.log(`Hiding time control button: "${buttonText}"`);
      
      // Hide the button by setting display to none
      (button as HTMLElement).style.display = 'none';
      
      // Also disable the button to prevent any click events
      (button as HTMLElement).style.pointerEvents = 'none';
      (button as HTMLElement).style.opacity = '0';
    }
  });
}

// Function to block chess board when the specific flag class exists
function blockChessBoard() {
  const flagExists = !!document.querySelector('.country-flags-component.country-75.country-flags-small');
  const boardElement = document.querySelector('#board-single') as HTMLElement | null;
  const existingOverlay = document.getElementById('chess-blocker-overlay') as HTMLDivElement | null;

  if (!flagExists || !boardElement) {
    if (existingOverlay) existingOverlay.remove();
    return;
  }

  let overlay = existingOverlay;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'chess-blocker-overlay';
    overlay.style.position = 'fixed';
    overlay.style.background = '#000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.textAlign = 'center';
    overlay.style.color = 'red';
    overlay.style.font = 'bold 28px Arial, sans-serif';
    overlay.style.zIndex = '2147483647';
    overlay.style.pointerEvents = 'all';
    overlay.style.userSelect = 'none';
    overlay.style.cursor = 'not-allowed';
    overlay.textContent = 'Are you sure you want to continue with this match?';
    document.body.appendChild(overlay);
  }

  const positionOverlay = () => {
    const rect = boardElement.getBoundingClientRect();
    overlay!.style.left = rect.left + 'px';
    overlay!.style.top = rect.top + 'px';
    overlay!.style.width = rect.width + 'px';
    overlay!.style.height = rect.height + 'px';
  };

  positionOverlay();

  if (!overlay.dataset.posListeners) {
    const handler = () => positionOverlay();
    window.addEventListener('resize', handler, { passive: true });
    window.addEventListener('scroll', handler, { passive: true });
    overlay.dataset.posListeners = 'true';
  }
}

// Function to continuously monitor for new buttons (in case they're added dynamically)
async function startMonitoring() {
  // Initial check
  await hideTimeControlButtons();
  blockChessBoard();
  
  // Set up a mutation observer to watch for new elements being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if any new nodes were added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // If a new element was added, check if it's a time button or contains time buttons
            const element = node as Element;
            if (element.classList?.contains('time-selector-button-button')) {
              hideTimeControlButtons();
            } else if (element.querySelector?.('.time-selector-button-button')) {
              hideTimeControlButtons();
            }
            
            // Also check for flag element or chess board
            if (element.classList?.contains('country-flags-component') || 
                element.querySelector?.('.country-flags-component') ||
                element.tagName === 'WC-CHESS-BOARD' ||
                element.querySelector?.('wc-chess-board')) {
              blockChessBoard();
            }
          }
        });
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also check periodically in case the observer misses something
  setInterval(async () => {
    await hideTimeControlButtons();
    blockChessBoard();
  }, 2000);
}

// Start monitoring when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMonitoring);
} else {
  startMonitoring();
}

// Also start monitoring immediately in case the script loads after DOMContentLoaded
startMonitoring();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refreshButtonHiding') {
    console.log('Received refresh request from popup');
    hideTimeControlButtons();
    sendResponse({ success: true });
  }
});
