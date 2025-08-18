// Content script to hide specific time control buttons on Chess.com
console.log('Chess.com content script loaded');

// Function to hide time control buttons
function hideTimeControlButtons() {
  // Find all time selector buttons
  const timeButtons = document.querySelectorAll('.time-selector-button-button');
  
  timeButtons.forEach((button) => {
    const buttonText = button.textContent?.trim();
    
    // Check if the button text matches our criteria
    if (buttonText === '3 min' || buttonText === '3 | 2' || buttonText === '5 min') {
      console.log(`Hiding time control button: "${buttonText}"`);
      
      // Hide the button by setting display to none
      (button as HTMLElement).style.display = 'none';
      
      // Also disable the button to prevent any click events
      (button as HTMLElement).style.pointerEvents = 'none';
      (button as HTMLElement).style.opacity = '0';
    }
  });
}

// Function to continuously monitor for new buttons (in case they're added dynamically)
function startMonitoring() {
  // Initial check
  hideTimeControlButtons();
  
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
  setInterval(hideTimeControlButtons, 2000);
}

// Start monitoring when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMonitoring);
} else {
  startMonitoring();
}

// Also start monitoring immediately in case the script loads after DOMContentLoaded
startMonitoring();
