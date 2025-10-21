# dynamics365-translation

Auto-translation script for Dynamics 365 forms supporting EN-US, DE (German), and ZH (Chinese) based on URL patterns.

## Usage

Add these script tags to your HTML (in this exact order):

```html
<script src="https://cdn.jsdelivr.net/gh/mylokaye/dynamics365-translation@main/translations.js"></script>
<script src="https://cdn.jsdelivr.net/gh/mylokaye/dynamics365-translation@main/translate.js"></script>

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
// === COMPREHENSIVE TRANSLATION TEST ===
console.clear();
console.log('🔍 TRANSLATION SYSTEM CHECK\n');

// 1. Check if scripts are loaded
console.log('📦 SCRIPT LOADING:');
console.log('  ✓ translations:', typeof translations !== 'undefined' ? '✅ Loaded' : '❌ Missing');
console.log('  ✓ detectLanguageFromURL:', typeof detectLanguageFromURL !== 'undefined' ? '✅ Loaded' : '❌ Missing');
console.log('  ✓ updateTranslation:', typeof updateTranslation !== 'undefined' ? '✅ Loaded' : '❌ Missing');
console.log('  ✓ currentLang:', typeof currentLang !== 'undefined' ? `✅ ${currentLang}` : '❌ Missing');

// 2. Check URL and language detection
console.log('\n🌐 LANGUAGE DETECTION:');
console.log('  Current URL:', window.location.href);
console.log('  Pathname:', window.location.pathname);
if (typeof detectLanguageFromURL !== 'undefined') {
  console.log('  Detected language:', detectLanguageFromURL());
} else if (typeof currentLang !== 'undefined') {
  console.log('  Current language:', currentLang);
}

// 3. Check translation data
console.log('\n📚 TRANSLATION DATA:');
if (typeof translations !== 'undefined') {
  console.log('  Available keys:', Object.keys(translations).length);
  console.log('  Sample keys:', Object.keys(translations).slice(0, 5));
  const firstKey = Object.keys(translations)[0];
  if (firstKey) {
    console.log(`  Example (${firstKey}):`, translations[firstKey]);
  }
} else {
  console.log('  ❌ No translations object found');
}

// 4. Check DOM elements
console.log('\n🎯 DOM ELEMENTS:');
const i18nElements = document.querySelectorAll('[data-i18n]');
console.log(`  Found ${i18nElements.length} elements with [data-i18n]`);
if (i18nElements.length > 0) {
  console.log('  Elements:');
  i18nElements.forEach((el, i) => {
    const key = el.getAttribute('data-i18n');
    const text = el.textContent.trim().substring(0, 50);
    console.log(`    ${i+1}. [data-i18n="${key}"] = "${text}..."`);
  });
} else {
  console.log('  ⚠️  No elements with [data-i18n] attribute found');
}

// 5. Test translation function
console.log('\n⚡ FUNCTION TEST:');
if (typeof updateTranslation === 'function') {
  console.log('  Running updateTranslation()...');
  try {
    updateTranslation();
    console.log('  ✅ Translation function executed successfully');
  } catch(e) {
    console.log('  ❌ Error:', e.message);
  }
} else {
  console.log('  ❌ updateTranslation function not available');
}

// 6. Final status
console.log('\n📊 FINAL STATUS:');
const scriptsOk = typeof translations !== 'undefined' && typeof updateTranslation !== 'undefined';
const elementsOk = i18nElements.length > 0;
const overallStatus = scriptsOk && elementsOk ? '✅ ALL SYSTEMS OK' : '⚠️  ISSUES DETECTED';
console.log(`  ${overallStatus}`);

```

**Important:** Always use the jsDelivr CDN URLs (`cdn.jsdelivr.net`) as shown above. Do NOT use `raw.githubusercontent.com` URLs, as they serve files with incorrect MIME types and will be blocked by modern browsers.
