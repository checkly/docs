// Temporary: verifies the console errors check ignores failing tracker requests
// and doesn't hang on pages that never reach network idle.
fetch('https://cdn.segment.com/ci-test-does-not-exist.js');
setInterval(() => fetch('/robots.txt', { cache: 'no-store' }), 400);
