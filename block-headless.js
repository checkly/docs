// Block Segment analytics for headless browsers
(function() {
  function isHeadlessBrowser() {
    // Check user agent for headless indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const headlessIndicators = [
      'headlesschrome',
      'headless',
      'phantom',
      'selenium',
      'webdriver',
      'chromedriver'
    ];

    // Check if any headless indicators are in the user agent
    const hasHeadlessUA = headlessIndicators.some(indicator =>
      userAgent.includes(indicator)
    );

    // Check userAgentData brands for HeadlessChrome
    let hasHeadlessBrand = false;
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      hasHeadlessBrand = navigator.userAgentData.brands.some(brand =>
        brand.brand.toLowerCase().includes('headlesschrome')
      );
    }

    // Check for webdriver property
    const hasWebDriver = navigator.webdriver === true;

    // Check for other headless browser indicators
    const hasNoPlugins = navigator.plugins.length === 0;
    const hasNoLanguages = navigator.languages.length === 0;

    return hasHeadlessUA || hasHeadlessBrand || hasWebDriver ||
           (hasNoPlugins && hasNoLanguages);
  }

  // If this is a headless browser, prevent Segment from loading
  if (isHeadlessBrowser()) {
    console.log('Headless browser detected - blocking Segment analytics');

    // Create a dummy analytics object that does nothing
    window.analytics = {
      page: function() { console.log('Segment page call blocked (headless browser)'); },
      track: function() { console.log('Segment track call blocked (headless browser)'); },
      identify: function() { console.log('Segment identify call blocked (headless browser)'); },
      alias: function() { console.log('Segment alias call blocked (headless browser)'); },
      group: function() { console.log('Segment group call blocked (headless browser)'); },
      ready: function(callback) {
        console.log('Segment ready call blocked (headless browser)');
        if (typeof callback === 'function') callback();
      },
      load: function() { console.log('Segment load call blocked (headless browser)'); },
      reset: function() { console.log('Segment reset call blocked (headless browser)'); }
    };

    // Prevent any future assignments to analytics
    Object.defineProperty(window, 'analytics', {
      value: window.analytics,
      writable: false,
      configurable: false
    });
  }
})();