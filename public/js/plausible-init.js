// Plausible's queue stub, served from 'self' because script-src allows no inline
// script. Loaded before the async loader; see plausibleAnalytics in src/data/site.ts.
window.plausible = window.plausible || function () { (plausible.q = plausible.q || []).push(arguments); };
plausible.init = plausible.init || function (i) { plausible.o = i || {}; };
plausible.init();
