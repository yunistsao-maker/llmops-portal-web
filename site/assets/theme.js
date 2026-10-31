/* Runs before first paint (loaded without defer): apply the saved palette and language so the page does not flash. */
try {
  var s = localStorage.getItem('llmops-ui');
  if (s === 'dark' || s === 'light' || s === 'beige') document.documentElement.setAttribute('data-ui', s);
  if (localStorage.getItem('llmops-lang') === 'en') document.documentElement.lang = 'en';
} catch (e) { /* storage blocked: defaults apply */ }
