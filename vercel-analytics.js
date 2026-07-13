// Vercel Web Analytics
// These docs are served under checklyhq.com/docs via a Vercel rewrite, so the
// insights script and its beacon only resolve at the domain root. A path
// relative to /docs 404s.
(function () {
  if (window.__vercelInsightsAdded) return;
  window.__vercelInsightsAdded = true;

  var script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();
