# dynamics365-translation

Auto-translation script for Dynamics 365 forms supporting EN-US, DE (German), and ZH (Chinese) based on URL patterns.

## Usage

Add these script tags to your HTML (in this exact order):

```html
<script src="https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@refs/heads/main/translations.js"></script>
<script src="https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@aa3b39b7409bcab262787527cf7230fbf30dd2c0/translate.js"></script>

```



(Optional)
```html
<script>
  function initTranslation() {
    if (typeof translations !== 'undefined' && typeof updateTranslation === 'function') {
      window.currentLang = detectLanguageFromURL();
      updateTranslation();
    } else {
      setTimeout(initTranslation, 50);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslation);
  } else {
    initTranslation();
  }
</script>




```

Console test script:
```html
// === INDIVIDUAL SCRIPT LOAD & ROOT-CAUSE DIAGNOSTIC ===
(async () => {
  console.clear();
  console.log('🔍 Script-by-Script Load Check & Root-Cause Analysis\n');

  // --- Your scripts & expected globals
  const scriptsUnderTest = [
    {
      label: 'translations.js (main branch)',
      url: 'https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@refs/heads/main/translations.js',
      expectedGlobals: ['translations'],
      notes: 'Defines translations data; must run BEFORE translate.js'
    },
    {
      label: 'translate.js (pinned commit)',
      url: 'https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@aa3b39b7409bcab262787527cf7230fbf30dd2c0/translate.js',
      expectedGlobals: ['detectLanguageFromURL', 'updateTranslation', 'currentLang'],
      notes: 'Depends on translations.js'
    }
  ];

  // --- Helpers
  const ok  = (m) => console.log('  ✅', m);
  const err = (m) => console.log('  ❌', m);
  const warn= (m) => console.log('  ⚠️ ', m);
  const hr  = () => console.log(''.padEnd(70, '—'));
  const toOrigin = (u) => { try { return new URL(u, location.href).origin; } catch { return '(bad url)'; } };

  // --- 0) Context / CSP quick check
  console.log('🕒 Context');
  console.log('  readyState:', document.readyState, '| location:', location.href);
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    console.log('  Found meta CSP:', cspMeta.getAttribute('content')?.slice(0, 200) + '...');
    if (!/script-src/i.test(cspMeta.content) || !/jsdelivr\.net/.test(cspMeta.content)) {
      warn('CSP meta may not include jsDelivr in script-src. External scripts may be blocked.');
    }
  } else {
    console.log('  No meta CSP detected (headers may still enforce CSP).');
  }
  hr();

  // --- 1) Audit existing <script> tags
  console.log('📦 <script> tag audit');
  const tagList = Array.from(document.scripts || []);
  console.table(tagList.map((s, i) => ({
    idx: i+1,
    src: s.src || '(inline)',
    async: !!s.async,
    defer: !!s.defer,
    type: s.type || 'text/javascript',
    module: (s.type || '').toLowerCase() === 'module',
    crossorigin: s.crossOrigin || '(none)',
    referrerpolicy: s.referrerPolicy || '(default)'
  })));
  hr();

  // --- 2) Performance entries (did they actually load over network?)
  console.log('⏱️ PerformanceResourceTiming (scripts)');
  const perfScripts = performance.getEntriesByType('resource')
    .filter(e => e.initiatorType === 'script')
    .map(e => ({
      name: e.name,
      start_ms: Math.round(e.startTime),
      dur_ms: Math.round(e.duration),
      size: e.transferSize,
      renderBlocking: e.renderBlockingStatus || '(n/a)'
    }));
  if (perfScripts.length) console.table(perfScripts); else warn('No script resource entries found (cache or not captured).');
  hr();

  // --- 3) Active network probe (HEAD then GET) for each script URL
  async function probe(url) {
    // Try HEAD first (some CDNs block HEAD; fallback to GET)
    try {
      const head = await fetch(url, { method: 'HEAD', cache: 'no-store', mode: 'cors' });
      return {
        ok: head.ok,
        status: head.status,
        statusText: head.statusText,
        contentType: head.headers.get('content-type'),
        contentLength: head.headers.get('content-length'),
        via: 'HEAD'
      };
    } catch (e) {
      // TypeError often indicates network/CORS/DNS/TLS issues
      return { ok: false, error: e.message, via: 'HEAD' };
    }
  }

  async function probeWithFallback(url) {
    let head = await probe(url);
    if (!head.ok && head.via === 'HEAD') {
      // Retry with GET (no-store) to bypass HEAD restrictions
      try {
        const get = await fetch(url, { method: 'GET', cache: 'no-store', mode: 'cors' });
        return {
          ok: get.ok,
          status: get.status,
          statusText: get.statusText,
          contentType: get.headers.get('content-type'),
          contentLength: get.headers.get('content-length'),
          via: 'GET'
        };
      } catch (e) {
        return { ok: false, error: e.message, via: 'GET' };
      }
    }
    return head;
  }

  // --- 4) Map expected globals to current window state
  function checkGlobals(expected) {
    const report = {};
    expected.forEach(name => {
      const t = typeof window[name];
      if (t === 'undefined') {
        report[name] = 'missing';
      } else {
        report[name] = t;
      }
    });
    return report;
  }

  // --- 5) Optionally re-inject to capture onerror/onload (disabled by default)
  async function reinject(url) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = url + (url.includes('?') ? '&' : '?') + 'cachebust=' + Date.now();
      s.async = true;
      s.onload = () => resolve({ loaded: true });
      s.onerror = (e) => resolve({ loaded: false, error: (e?.message || 'onerror fired'), event: e });
      document.head.appendChild(s);
      // Auto-timeout after 10s
      setTimeout(() => resolve({ loaded: false, error: 'timeout after 10s' }), 10000);
    });
  }

  const REINJECT_FOR_DIAG = false; // 👉 set to true if you want to actively re-test loads

  // --- 6) Evaluate each script individually
  for (const s of scriptsUnderTest) {
    console.log(`🧩 ${s.label}`);
    console.log('  URL:', s.url);
    console.log('  Origin:', toOrigin(s.url));
    console.log('  Expected globals:', s.expectedGlobals.join(', '));
    console.log('  Notes:', s.notes);

    // a) See if this exact URL shows up in performance entries
    const perfHit = perfScripts.find(p => p.name === s.url);
    if (perfHit) {
      ok(`Found in Performance entries (start:${perfHit.start_ms}ms, dur:${perfHit.dur_ms}ms, size:${perfHit.size})`);
    } else {
      warn('Not found in Performance entries (could be cached, cross-origin policy, or not requested).');
    }

    // b) Active probe
    const probeRes = await probeWithFallback(s.url);
    if (probeRes.ok) {
      ok(`Reachable via ${probeRes.via}: ${probeRes.status} ${probeRes.statusText} | ${probeRes.contentType || '(no content-type)'} | length=${probeRes.contentLength || 'n/a'}`);
      if (probeRes.contentType && !/javascript|ecmascript|text\/plain/i.test(probeRes.contentType)) {
        warn(`Unexpected content-type for script: ${probeRes.contentType}`);
      }
    } else {
      err(`Not reachable via ${probeRes.via}: ${probeRes.error || (probeRes.status + ' ' + probeRes.statusText)}`);
      console.log('  ➤ Likely causes: DNS/TLS/network block, ad/tracker block, corporate proxy, or CSP.');
    }

    // c) Global symbols present?
    const globalsReport = checkGlobals(s.expectedGlobals);
    console.table(globalsReport);

    // d) Heuristics for WHY globals might be missing:
    //    - ES modules don't expose globals unless assigned to window
    //    - async scripts may race with inline code
    //    - CSP blocking external origins
    //    - Version mismatch between files (branch vs pinned commit)
    const anyMissing = Object.values(globalsReport).some(v => v === 'missing');
    if (anyMissing) {
      warn('One or more expected globals are missing.');
      // Check if modules are present on page
      const hasModule = !!document.querySelector('script[type="module"]');
      if (hasModule) {
        warn('Page uses ES Modules. If these files are modules, they must assign to window.* to expose globals.');
      }
      // Async/defer race hints
      const tag = Array.from(document.scripts).find(t => t.src === s.url);
      if (tag) {
        if (tag.async) warn('This script tag is async; load order is not guaranteed → potential race.');
        if (tag.defer) ok('This script tag is defer; it runs after parsing, order is preserved among defer scripts.');
        if ((tag.type || '').toLowerCase() === 'module') warn('type="module" scopes variables; export to window.* if you need globals.');
      } else {
        warn('This exact URL not found among current <script> tags; maybe a different ref/URL is used at runtime.');
      }
      // Version mismatch hint
      if (s.label.includes('translations') || s.label.includes('translate')) {
        warn('You are mixing branch (refs/heads/main) and pinned commit. Consider pinning BOTH to the SAME commit to avoid API drift.');
      }
      // CSP origin hint
      const meta = cspMeta?.getAttribute('content') || '';
      if (meta && !/jsdelivr\.net/.test(meta)) {
        warn('Meta CSP content does not list jsDelivr; this may block the script.');
      }
    } else {
      ok('All expected globals from this script are present.');
    }

    // e) Optional: Reinjection test to capture onerror reasons
    if (REINJECT_FOR_DIAG) {
      console.log('  Reinjecting for live load signal…');
      const reinj = await reinject(s.url);
      if (reinj.loaded) ok('Reinjection loaded successfully (onload fired).');
      else err(`Reinjection failed: ${reinj.error || 'unknown error'}`);
    }

    hr();
  }

  // --- 7) Cross-file dependency quick functional test
  console.log('🔗 Cross-file functionality check');
  if (typeof window.updateTranslation === 'function') {
    try {
      window.updateTranslation();
      ok('updateTranslation() executed.');
    } catch (e) {
      err('updateTranslation() threw: ' + e.message);
    }
  } else {
    warn('updateTranslation function not available to call.');
  }

  // --- 8) Suggest concrete fixes
  console.log('\n🛠️ Suggested Fixes (if issues were detected)');
  console.log('  • Pin BOTH URLs to the SAME commit to guarantee compatibility:');
  console.log('    https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@<COMMIT>/translations.js');
  console.log('    https://cdn.jsdelivr.net/gh/norican-dev/dynamics-translate@<COMMIT>/translate.js');
  console.log('  • If using ES modules, expose globals explicitly: window.translations = translations; window.updateTranslation = updateTranslation; etc.');
  console.log('  • If CSP is enforced, ensure script-src allows https://cdn.jsdelivr.net and add integrity/crossorigin as needed.');
  console.log('  • Avoid async for dependent scripts; prefer <script defer> or place scripts in correct order at the end of <body>.');
})();
``

```

**Important:** Always use the jsDelivr CDN URLs (`cdn.jsdelivr.net`) as shown above. Do NOT use `raw.githubusercontent.com` URLs, as they serve files with incorrect MIME types and will be blocked by modern browsers.
