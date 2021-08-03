/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

/**
 * Toggles visibility of the "Details" section on the blocked page.
 */
const toggleDetails = (): void => {
  const details = document.getElementById('details');
  if (details) {
    if (details.classList.contains('hide')) {
      details.classList.remove('hide');
    } else {
      details.classList.add('hide');
    }
  }
};

/**
 * Wrapper function which trusts a given domain and redirects to it after the
 * change has taken effect.
 *
 * @param {string} domain The domain to trust.
 * @param {boolean} trustSubdomains Whether to trust subdomains of the given
 *     domain.
 * @param {number} expires The date at which the trust in the given domain
 *     expires.
 * @param {string} requestUrl The URL to redirect to once a change in saved
 *     domains has been detected.
 */
const trustAndContinue = (
  domain: string,
  trustSubdomains: boolean,
  expires: number,
  requestUrl: string
): void => {
  trustDomain(domain, trustSubdomains, expires);
  browser.storage.onChanged.addListener((changes, areaName) => {
    const keys = Object.keys(changes);
    if (areaName === 'local' && keys.indexOf(STORAGE_TRUSTED_DOMAINS) > -1) {
      document.location.href = requestUrl;
    }
  });
};

/**
 * Code to run when the page loads.
 */
const blocked_onLoad = (): void => {
  const url = new URL(document.location.href);
  const requestUrl = atob(url.searchParams.get('request_url') || '');
  const requestDomain = requestUrl ? new URL(requestUrl).hostname : '';
  const originUrl = atob(url.searchParams.get('origin_url') || '');
  const method = atob(url.searchParams.get('method') || '');
  let urlClassification = atob(
    url.searchParams.get('url_classification') || ''
  );

  // Set the text conveying the blocked domain and reason
  const blockedReason = document.getElementById('blocked-reason');
  if (blockedReason) {
    const label = browser.i18n.getMessage('untrustedDomain');
    const domainName = document.createElement('span');
    domainName.id = 'blocked-domain-name';
    domainName.innerText = requestDomain;
    blockedReason.innerHTML = `${label}: ${domainName.outerHTML}`;
  }

  // Set the block explanation
  const blockedExplanation = document.getElementById('blocked-explanation');
  if (blockedExplanation) {
    blockedExplanation.innerText = browser.i18n.getMessage(
      'untrustedDomainDesc'
    );
  }

  // Populate the blocked URL field
  const blockedUrlInput = document.getElementById(
    'blocked-url'
  ) as HTMLInputElement;
  if (blockedUrlInput) {
    if (requestUrl) {
      blockedUrlInput.value = requestUrl;
    } else {
      blockedUrlInput.value = browser.i18n.getMessage('unknownUrl');
    }
  }

  // Bind the "Copy" button
  bind('copy-url', 'click', () => {
    const blockedUrlInput = document.getElementById(
      'blocked-url'
    ) as HTMLInputElement;
    if (blockedUrlInput) {
      blockedUrlInput.focus();
      blockedUrlInput.select();
      document.execCommand('copy');
    }
  });

  // Bind the "Back to safety" button
  bind('to-safety', 'click', () => {
    setMainImageColor(BLUE_DARK, BLUE_LIGHT);
    history.back();
  });

  // Set the default value of the "trust subdomains" checkbox
  let trustSubdomainsCheckbox = document.getElementById(
    'trust-subdomains'
  ) as HTMLInputElement;
  if (trustSubdomainsCheckbox) {
    trustSubdomainsCheckbox.checked = blocked_settings.trustSubdomainsByDefault;
  }

  // Bind the "Temporarily trust and continue" button
  bind('temp-trust-domain', 'click', () => {
    let hostname = new URL(requestUrl).hostname;
    if (blocked_settings.ignoreWww && hostname.indexOf('www.') === 0) {
      hostname = hostname.replace('www.', '');
    }
    let expires =
      +new Date() + DEFAULT_BROWSER_GUARD_SETTINGS.tempTrustDuration * 60000;
    if (blocked_settings.tempTrustDuration) {
      expires = +new Date() + blocked_settings.tempTrustDuration * 60000;
    }
    setMainImageColor(BLUE_DARK, BLUE_LIGHT);
    trustAndContinue(
      hostname,
      trustSubdomainsCheckbox.checked,
      expires,
      requestUrl
    );
  });

  // Bind the "Trust and continue" button
  bind('trust-domain', 'click', () => {
    let hostname = new URL(requestUrl).hostname;
    if (blocked_settings.ignoreWww && hostname.indexOf('www.') === 0) {
      hostname = hostname.replace('www.', '');
    }
    setMainImageColor(BLUE_DARK, BLUE_LIGHT);
    trustAndContinue(hostname, trustSubdomainsCheckbox.checked, 0, requestUrl);
  });

  // Bind the "Details" toggle
  bind('details-toggle', 'click', () => {
    toggleDetails();
  });

  // Populate the "Request URL" detail
  const detailsRequestUrl = document.getElementById('details-request-url');
  if (detailsRequestUrl) {
    detailsRequestUrl.innerText = requestUrl;
  }

  // Populate the "Origin URL" detail
  const detailsOriginUrl = document.getElementById('details-origin-url');
  if (detailsOriginUrl) {
    detailsOriginUrl.innerText = originUrl;
  }

  // Populate the "Method" detail
  const detailsMethod = document.getElementById('details-method');
  if (detailsMethod) {
    detailsMethod.innerText = method;
  }

  // Populate the "URL Classification" detail
  const detailsUrlClassification = document.getElementById(
    'details-url-classification'
  );
  if (detailsUrlClassification) {
    if (urlClassification) {
      urlClassification = JSON.parse(urlClassification);
    }
    let urlClassificationText: string[] = [];
    Object.keys(urlClassification).forEach((party) => {
      const classifications = urlClassification[party].join(', ');
      urlClassificationText.push(`${party}: ${classifications}`);
    });
    detailsUrlClassification.innerText = urlClassificationText.join('\n');
  }

  setMainImageColor(YELLOW_DARK, YELLOW_LIGHT, true);
};

let blocked_DOMContentLoaded = false;
window.addEventListener('DOMContentLoaded', () => {
  blocked_DOMContentLoaded = true;
});

// Load settings and then call onLoad
let blocked_settings: BrowserGuardSettings;
let blocked_loadTimer: number;
getSettings((storedSettings) => {
  blocked_settings = storedSettings;
  blocked_loadTimer = self.setInterval(() => {
    if (blocked_DOMContentLoaded) {
      self.clearInterval(blocked_loadTimer);
      blocked_onLoad();
    }
  }, 10);
});

// Reload settings when they are changed
browser.storage.onChanged.addListener((changes, areaName) => {
  const keys = Object.keys(changes);
  if (areaName === 'local' && keys.indexOf(STORAGE_SETTINGS) > -1) {
    blocked_settings = JSON.parse(changes[STORAGE_SETTINGS].newValue);
  }
});
