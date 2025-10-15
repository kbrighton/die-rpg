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

  if (!scrollableElement) {
    // No scrollable element found, mark as none
    element.classList.add('scroll-indicators--none');
    return;
  }

  // Store reference to scrollable element for cleanup
  element._scrollableElement = scrollableElement;

  /**
   * Update scroll state classes based on current scroll position
   */
  function updateScrollState() {
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
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

  // Initial state check
  updateScrollState();

  // Listen for scroll events on the actual scrollable element
  scrollableElement.addEventListener('scroll', updateScrollState, { passive: true });

  // Watch for content changes that might affect scrollability
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(scrollableElement);

    // Store observer for cleanup if needed
    element._scrollIndicatorResizeObserver = resizeObserver;
  }

  // Watch for child mutations (content added/removed)
  if (window.MutationObserver) {
    const mutationObserver = new MutationObserver(() => {
      // Re-find scrollable element in case DOM changed
      const newScrollable = findScrollableElement(element);
      if (newScrollable && newScrollable !== element._scrollableElement) {
        // Scrollable element changed, re-setup
        element._scrollableElement = newScrollable;
        scrollableElement.removeEventListener('scroll', updateScrollState);
        newScrollable.addEventListener('scroll', updateScrollState, { passive: true });
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
