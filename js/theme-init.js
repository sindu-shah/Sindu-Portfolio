// Loaded in <head> without defer so the saved theme applies before first paint (no flash)
// Set theme before paint to avoid a flash
(function () {
  var t;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
