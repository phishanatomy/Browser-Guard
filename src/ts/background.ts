/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

/**
 * Called when any tab sends a request to load a page.
 *
 * @param {FullWebRequestBodyDetails} details The details of the request.
 * @return {chrome.webRequest.BlockingResponse} The action the browser should
 *     take, i.e. block, redirect, or take no action.
 */
const onRequestStart = (
  details: FullWebRequestBodyDetails
): chrome.webRequest.BlockingResponse => {
  const requestDomain = new URL(details.url).hostname;
  const requestProtocol = new URL(details.url).protocol;
  if (
    !isTrustedDomain(
      requestDomain,
      trustedDomains,
      background_settings.ignoreWww
    ) &&
    BROWSER_PROTOCOLS.indexOf(requestProtocol) < 0 &&
    EXTENSION_PROTOCOLS.indexOf(requestProtocol) < 0
  ) {
    const redirectUrl = getExtensionURL('html/blocked.html');
    const finalUrl = new URL(redirectUrl);
    finalUrl.searchParams.append('request_url', btoa(details.url));
    finalUrl.searchParams.append('origin_url', btoa(details.originUrl));
    finalUrl.searchParams.append('method', btoa(details.method));
    finalUrl.searchParams.append(
      'url_classification',
      btoa(JSON.stringify(details.urlClassification))
    );
    if (isFirefox()) {
      chrome.tabs.update(details.tabId, {url: finalUrl.toString()});
      return {cancel: true};
    } else {
      return {redirectUrl: finalUrl.toString()};
    }
  } else {
    return {cancel: false};
  }
};

// Load settings
let background_settings: BrowserGuardSettings;
getSettings((storedSettings) => {
  background_settings = storedSettings;
});

// Reload settings when they are changed
browser.storage.onChanged.addListener((changes, areaName) => {
  const keys = Object.keys(changes);
  if (areaName === 'local' && keys.indexOf(STORAGE_SETTINGS) > -1) {
    background_settings = JSON.parse(changes[STORAGE_SETTINGS].newValue);
  }
});

// Load trusted domains from storage
let trustedDomains: TrustedDomain[] = [];
getTrustedDomains((savedTrustedDomains) => {
  trustedDomains = removeExpiredTrustedDomains(savedTrustedDomains);
});

// Reload trusted domains when they are changed
browser.storage.onChanged.addListener((changes, areaName) => {
  const keys = Object.keys(changes);
  if (areaName === 'local' && keys.indexOf(STORAGE_TRUSTED_DOMAINS) > -1) {
    trustedDomains = JSON.parse(changes[STORAGE_TRUSTED_DOMAINS].newValue);
    trustedDomains = removeExpiredTrustedDomains(trustedDomains);
  }
});

// Collect garbage
const garbageCollector = self.setInterval(() => {
  // Remove trusted domains whose trust has expired
  getTrustedDomains((trustedDomains: TrustedDomain[]) => {
    const cleanedTrustedDomains = removeExpiredTrustedDomains(trustedDomains);
    if (cleanedTrustedDomains.length < trustedDomains.length) {
      setTrustedDomains(cleanedTrustedDomains);
    }
  }, false);
}, 60000 * 5);

window.addEventListener('load', () => {
  // Add listeners for request events so we can block untrusted requests before
  // they are made
  if (!chrome.webRequest.onBeforeRequest.hasListener(onRequestStart)) {
    chrome.webRequest.onBeforeRequest.addListener(
      onRequestStart,
      {
        urls: ['<all_urls>'],
        types: ['main_frame' as chrome.webRequest.ResourceType],
      },
      ['blocking']
    );
  }
});
