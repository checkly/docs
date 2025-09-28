// Custom script to add /docs prefix to Segment analytics calls
(function() {
  console.log('Segment path fix script loaded');

  // Method 1: Intercept analytics object creation
  let _analytics = window.analytics;

  function wrapAnalytics(analytics) {
    if (!analytics || typeof analytics !== 'object') return analytics;

    const originalPage = analytics.page;
    if (typeof originalPage === 'function') {
      analytics.page = function(properties, ...args) {
        if (properties && typeof properties === 'object') {
          // Clone and modify properties
          const modifiedProps = { ...properties };

          // Fix path
          if (modifiedProps.path && !modifiedProps.path.startsWith('/docs')) {
            modifiedProps.path = '/docs' + modifiedProps.path;
          }

          // Fix URL
          if (modifiedProps.url) {
            try {
              const url = new URL(modifiedProps.url);
              if (!url.pathname.startsWith('/docs')) {
                url.pathname = '/docs' + url.pathname;
                modifiedProps.url = url.toString();
              }
            } catch (e) {
              console.warn('URL parsing error:', e);
            }
          }

          console.log('Segment intercepted - original:', properties, 'modified:', modifiedProps);
          return originalPage.call(this, modifiedProps, ...args);
        }
        return originalPage.call(this, properties, ...args);
      };
    }
    return analytics;
  }

  // Method 2: Override window.analytics with getter/setter
  Object.defineProperty(window, 'analytics', {
    get() {
      return this._analytics;
    },
    set(value) {
      console.log('Analytics object being set:', value);
      this._analytics = wrapAnalytics(value);
    },
    configurable: true,
    enumerable: true
  });

  // Initialize with existing analytics if present
  if (_analytics) {
    window.analytics = _analytics;
  }

  // Method 3: Listen for script tag additions (Segment loading)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'SCRIPT' &&
            (node.src?.includes('segment') || node.src?.includes('analytics'))) {
          console.log('Segment script detected:', node.src);
          // Re-wrap analytics after script loads
          setTimeout(() => {
            if (window.analytics) {
              window.analytics = wrapAnalytics(window.analytics);
            }
          }, 100);
        }
      });
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });

  // Method 4: Periodic check and re-wrap
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    if (window.analytics && typeof window.analytics.page === 'function') {
      const currentPage = window.analytics.page.toString();
      if (!currentPage.includes('/docs')) {
        console.log('Re-wrapping analytics (attempt', ++checkCount, ')');
        window.analytics = wrapAnalytics(window.analytics);
      }

      if (checkCount > 10) {
        clearInterval(checkInterval);
      }
    }
  }, 500);

  console.log('All Segment intercept methods initialized');
})();