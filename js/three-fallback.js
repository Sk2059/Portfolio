/**
 * three-fallback.js
 * CDN fallback loader for Three.js.
 * Called via onerror on the primary CDN <script> tag.
 */
function loadThreeFallback() {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
  document.head.appendChild(s);
}
