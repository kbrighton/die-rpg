/**
 * Scroll Indicators Utility
 * Automatically detects elements with .scroll-indicators class and adds
 * visual feedback (shadows) when content is scrollable.
 *
 * This is a self-contained, portable utility that can be copied to any Foundry project.
 */

/**
 * Check if an element is actually scrollable
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if the element can scroll
 */
function isScrollable(element) {
  const { scrollHeight, clientHeight } = element;

  // Content must exceed container
  if (scrollHeight <= clientHeight) {
    return false;
  }

  const computedStyle = window.getComputedStyle(element);
  const overflowY = computedStyle.overflowY;
  const overflow = computedStyle.overflow;

  // Check if overflow allows scrolling (not hidden or clip)
  const canScroll =
    overflowY === 'auto' ||
    overflowY === 'scroll' ||
    overflow === 'auto' ||
    overflow === 'scroll' ||
    // In flex/grid contexts, overflow can be implicit
    (overflowY !== 'hidden' && overflowY !== 'clip' && overflow !== 'hidden' && overflow !== 'clip');

  return canScroll;
}

/**
 * Find the actual scrolling element within a container
 * @param {HTMLElement} container - The container to search
 * @returns {HTMLElement|null} The scrollable element or null
 */
function findScrollableElement(container) {
  // Check if the container itself is scrollable
  if (isScrollable(container)) {
    return container;
  }

  // Recursively check children
  for (const child of container.children) {
    if (isScrollable(child)) {
      return child;
    }

    // Check deeper if this child has children
    if (child.children.length > 0) {
      const found = findScrollableElement(child);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Initialize scroll indicators for a given element
 * @param {HTMLElement} element - The element to track (with .scroll-indicators class)
 */
function setupScrollIndicator(element) {
  // Skip if already initialized
  if (element.dataset.scrollIndicatorInit === 'true') return;
  element.dataset.scrollIndicatorInit = 'true';

  // Find the actual scrollable element (might be a child)
  const scrollableElement = findScrollableElement(element);

  // Store reference to scrollable element (might be null initially)
  element._scrollableElement = scrollableElement;

  /**
   * Update scroll state classes based on current scroll position
   */
  function updateScrollState() {
    // Always use the current scrollable element (in case it changed)
    const currentScrollable = element._scrollableElement;
    if (!currentScrollable) {
      element.classList.add('scroll-indicators--none');
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = currentScrollable;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) {
      element.classList.remove('scroll-indicators--top', 'scroll-indicators--bottom', 'scroll-indicators--both');
      element.classList.add('scroll-indicators--none');
      return;
    }

    const atTop = scrollTop <= 1; // Small threshold for float precision
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Remove all state classes first
    element.classList.remove('scroll-indicators--top', 'scroll-indicators--bottom', 'scroll-indicators--both', 'scroll-indicators--none');

    // Add appropriate state class
    if (atTop && atBottom) {
      element.classList.add('scroll-indicators--none');
    } else if (atTop) {
      element.classList.add('scroll-indicators--bottom');
    } else if (atBottom) {
      element.classList.add('scroll-indicators--top');
    } else {
      element.classList.add('scroll-indicators--both');
    }
  }

  /**
   * Attach scroll listener to a scrollable element
   */
  function attachScrollListener(scrollable) {
    if (!scrollable || scrollable._scrollIndicatorListenerAttached) return;
    scrollable.addEventListener('scroll', updateScrollState, { passive: true });
    scrollable._scrollIndicatorListenerAttached = true;
  }

  // Initial state check
  updateScrollState();

  // Listen for scroll events on the actual scrollable element (if found)
  if (scrollableElement) {
    attachScrollListener(scrollableElement);
  }

  // ALSO listen on the container itself to catch async content loads
  // If scroll happens on container, it means content loaded and we should re-check
  element.addEventListener('scroll', function handleContainerScroll() {
    // Re-find scrollable element in case it appeared after initialization
    const newScrollable = findScrollableElement(element);
    if (newScrollable && newScrollable !== element._scrollableElement) {
      // Found a new scrollable element! Re-setup
      console.log('Scroll indicators: Found scrollable element after initial load');
      element._scrollableElement = newScrollable;
      attachScrollListener(newScrollable);
      updateScrollState();
    }
  }, { passive: true });

  // Watch for content changes that might affect scrollability
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      // Check if scrollable element appeared
      if (!element._scrollableElement) {
        const newScrollable = findScrollableElement(element);
        if (newScrollable) {
          element._scrollableElement = newScrollable;
          attachScrollListener(newScrollable);
        }
      }
      updateScrollState();
    });
    // Observe the container itself, not just the scrollable element
    resizeObserver.observe(element);

    // Store observer for cleanup if needed
    element._scrollIndicatorResizeObserver = resizeObserver;
  }

  // Watch for child mutations (content added/removed)
  if (window.MutationObserver) {
    const mutationObserver = new MutationObserver(() => {
      // Re-find scrollable element in case DOM changed
      const newScrollable = findScrollableElement(element);
      if (newScrollable && newScrollable !== element._scrollableElement) {
        // Scrollable element changed or appeared, re-setup
        element._scrollableElement = newScrollable;
        attachScrollListener(newScrollable);
      }
      updateScrollState();
    });
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Store observer for cleanup if needed
    element._scrollIndicatorMutationObserver = mutationObserver;
  }
}

/**
 * Cleanup scroll indicators for an element
 * @param {HTMLElement} element - The element to cleanup
 */
function cleanupScrollIndicator(element) {
  if (element._scrollIndicatorResizeObserver) {
    element._scrollIndicatorResizeObserver.disconnect();
    delete element._scrollIndicatorResizeObserver;
  }
  if (element._scrollIndicatorMutationObserver) {
    element._scrollIndicatorMutationObserver.disconnect();
    delete element._scrollIndicatorMutationObserver;
  }
  element.classList.remove('scroll-indicators--top', 'scroll-indicators--bottom', 'scroll-indicators--both', 'scroll-indicators--none');
  delete element.dataset.scrollIndicatorInit;
}

/**
 * Initialize scroll indicators globally
 * Finds all existing .scroll-indicators elements and sets up tracking
 * Also watches for new elements being added to the DOM
 */
export function initializeScrollIndicators() {
  // Find and setup all existing elements (both variants)
  document.querySelectorAll('.scroll-indicators, .scroll-indicators-self').forEach(setupScrollIndicator);

  // Watch for new elements being added
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself has either class
            if (node.classList?.contains('scroll-indicators') || node.classList?.contains('scroll-indicators-self')) {
              setupScrollIndicator(node);
            }
            // Check if any descendants have either class
            node.querySelectorAll?.('.scroll-indicators, .scroll-indicators-self').forEach(setupScrollIndicator);
          }
        });

        // Cleanup removed nodes
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList?.contains('scroll-indicators') || node.classList?.contains('scroll-indicators-self')) {
              cleanupScrollIndicator(node);
            }
            node.querySelectorAll?.('.scroll-indicators, .scroll-indicators-self').forEach(cleanupScrollIndicator);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('Scroll indicators initialized');
  }
}
