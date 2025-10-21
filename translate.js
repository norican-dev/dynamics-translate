// Wrap in IIFE to prevent global scope pollution and duplicate execution
(function() {
  'use strict';

  // Prevent double execution
  if (window.__translationInitialized) {
    console.warn('Translation script already loaded');
    return;
  }
  window.__translationInitialized = true;

  // Auto-detect language based on URL pattern
  function detectLanguageFromURL() {
    const pathname = window.location.pathname;

    // Check for language code in URL path
    if (pathname.includes('/de/')) {
      return 'DE';
    } else if (pathname.includes('/zh/')) {
      return 'ZH';
    } else {
      // Default to English for base URLs without language code
      return 'EN-US';
    }
  }

  const currentLang = detectLanguageFromURL();
  const originalText = {};

  function updateTranslation() {
    // Check if translations object exists
    if (typeof translations === 'undefined') {
      console.error('Translations not loaded. Make sure translations.js is loaded before translate.js');
      return;
    }

    for (const key in translations) {
      const el = document.querySelector(`[data-i18n='${key}']`);
      if (!el) continue;

      // Store original text (English)
      if (!originalText[key]) {
        originalText[key] = el.textContent;
      }

      // Apply translation based on detected language
      if (currentLang === "EN-US") {
        el.textContent = originalText[key];
      } else if (translations[key] && translations[key][currentLang]) {
        el.textContent = translations[key][currentLang];
      }
    }
  }

  // Optional: Create language switcher button for testing/manual override
  function createLanguageSwitcher() {
    const languageMap = {
      'EN-US': { url: '/contact', label: 'EN' },
      'DE': { url: '/de/contact/', label: 'DE' },
      'ZH': { url: '/zh/contact', label: 'ZH' }
    };

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.gap = '5px';

    for (const [lang, config] of Object.entries(languageMap)) {
      const btn = document.createElement('button');
      btn.textContent = config.label;
      btn.title = `Switch to ${config.label}`;
      btn.style.padding = '5px 10px';
      btn.style.cursor = 'pointer';

      // Highlight current language
      if (lang === currentLang) {
        btn.style.fontWeight = 'bold';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
      }

      btn.addEventListener('click', () => {
        window.location.href = config.url;
      });

      container.appendChild(btn);
    }

    document.body.appendChild(container);
  }

  // Auto-translate on page load
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
      updateTranslation();
      // Uncomment the line below to show language switcher for testing
      // createLanguageSwitcher();
    });
  } else {
    // DOM already loaded
    updateTranslation();
    // Uncomment the line below to show language switcher for testing
    // createLanguageSwitcher();
  }

  // Expose functions globally for console access and manual control
  window.detectLanguageFromURL = detectLanguageFromURL;
  window.updateTranslation = updateTranslation;
  window.createLanguageSwitcher = createLanguageSwitcher;
  window.currentLang = currentLang;
)();
