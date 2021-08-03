/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

/**
 * Retrieves the currently selected tab and passes it to a callback function.
 * Passes an empty string to an error handler callback if the active tab could
 * not be retrieved.
 *
 * @param {function} callback The function to pass the current tab to.
 * @param {function} errorCallback The function to call if the current tab
 *     cannot be retrieved.
 */
const getCurrentTab = (
  callback: (tab: browser.tabs.Tab) => void,
  errorCallback: (string: string) => void
): void => {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs.length > 0 ? tabs[0] : null;
    if (tab && tab.url) {
      callback(tab);
    } else {
      errorCallback('');
    }
  }, errorCallback);
};

/**
 * Update the UI to show the current trust and trusted domain rule (if any) for
 * the domain loaded in the currently selected tab.
 *
 * @param {TrustedDomain[]} trustedDomains The list of trusted domain objects to
 *     check the loaded domain against.
 * @param {BrowserGuardSettings} settings A BrowserGuardSettings object.
 */
const displayDomainTrust = (
  trustedDomains: TrustedDomain[],
  settings: BrowserGuardSettings
): void => {
  getCurrentTab((tab) => {
    const loadedUrl = new URL(tab.url ? tab.url : '');
    const loadedDomain = loadedUrl.hostname;
    const browserProtocols = ['about:', 'chrome:', 'edge:'];
    const extensionProtocols = [
      'moz-extension:',
      'chrome-extension:',
      'extension:',
    ];
    const domainTrustRuleLabel = document.getElementById(
      'domain-trust-rule-label'
    );
    const domainTrustRuleDomain = document.getElementById(
      'domain-trust-rule-domain'
    );
    const domainTrustRuleSubdomains = document.getElementById(
      'domain-trust-rule-trust-subdomains'
    );
    const domainTrustRuleExpired = document.getElementById(
      'domain-trust-rule-expired'
    );
    const trustSubdomainsWrap = document.getElementById(
      'trust-subdomains-wrap'
    );
    const toSafetyButton = document.getElementById('to-safety-button');
    const tempTrustButton = document.getElementById('temp-trust-button');
    const trustDomainButton = document.getElementById('trust-domain-button');
    let removeTrustButton = document.getElementById('remove-trust-button');
    const domainTrustLabel = document.getElementById('domain-trust-label');
    const domainExpiresLabel = document.getElementById('domain-expires-label');
    if (domainTrustLabel && domainExpiresLabel) {
      domainTrustLabel.innerText = '';
      domainExpiresLabel.innerText = '';
    } else {
      return;
    }

    // Hide all buttons and controls initially
    toSafetyButton?.classList.add('hide');
    tempTrustButton?.classList.add('hide');
    trustDomainButton?.classList.add('hide');
    removeTrustButton?.classList.add('hide');
    trustSubdomainsWrap?.classList.add('hide');

    if (isTrustedDomain(loadedDomain, trustedDomains, settings.ignoreWww)) {
      removeTrustButton?.classList.remove('hide');
      domainTrustRuleLabel?.classList.remove('hide');
      setMainImageColor(BLUE_DARK, BLUE_LIGHT, true);
      const trustedDomain = getTrustedDomain(
        loadedDomain,
        trustedDomains,
        settings.ignoreWww
      );

      // Bind the "Remove trust" button
      if (removeTrustButton) {
        if (trustedDomain && typeof trustedDomain !== 'boolean') {
          removeEventListeners(removeTrustButton);
          removeTrustButton = document.getElementById('remove-trust-domain');
          removeTrustButton?.addEventListener('click', () => {
            untrustDomain(trustedDomain.id);
          });
        }
      }

      // Populate the matching trust rule table
      if (trustedDomain && typeof trustedDomain !== 'boolean') {
        if (
          domainTrustRuleDomain &&
          domainTrustRuleSubdomains &&
          domainTrustRuleExpired
        ) {
          domainTrustRuleDomain.innerText = trustedDomain.domain;
          domainTrustRuleSubdomains.innerText = trustedDomain.trustSubdomains
            ? 'yes'
            : 'no';
          domainTrustRuleExpired.innerText = trustedDomain.expires
            ? getTimeInMinutesFormatted(+new Date(trustedDomain.expires))
            : 'never';
        }
      }

      const expires = getTrustExpires(
        loadedDomain,
        trustedDomains,
        settings.ignoreWww
      );
      if (expires && typeof expires !== 'boolean') {
        trustDomainButton?.classList.remove('hide');
        domainTrustLabel.innerText =
          browser.i18n.getMessage('domainTempTrusted');
        domainExpiresLabel.innerText = [
          browser.i18n.getMessage('trustExpiresIn'),
          getTimeInMinutesFormatted(expires),
        ].join(' ');
      } else {
        domainTrustLabel.innerText = browser.i18n.getMessage('domainIsTrusted');
      }
    } else if (browserProtocols.indexOf(loadedUrl.protocol) > -1) {
      setMainImageColor(BLUE_DARK, BLUE_LIGHT, true);
      domainTrustLabel.innerText = browser.i18n.getMessage('domainIsBrowser');
      domainTrustRuleLabel?.classList.add('hide');
    } else if (extensionProtocols.indexOf(loadedUrl.protocol) > -1) {
      setMainImageColor(BLUE_DARK, BLUE_LIGHT, true);
      domainTrustLabel.innerText = browser.i18n.getMessage('domainIsExtension');
      domainTrustRuleLabel?.classList.add('hide');
    } else {
      toSafetyButton?.classList.remove('hide');
      tempTrustButton?.classList.remove('hide');
      trustDomainButton?.classList.remove('hide');
      trustSubdomainsWrap?.classList.remove('hide');
      setMainImageColor(YELLOW_DARK, YELLOW_LIGHT, true);
      domainTrustLabel.innerText = browser.i18n.getMessage('domainNotTrusted');
      domainTrustRuleLabel?.classList.add('hide');
    }
  }, console.error);
};

/**
 * Bind the controls and buttons on the popup.
 */
const bindControls = (): void => {
  // Set the default value of the "trust subdomains" checkbox
  const trustSubdomainsCheckbox = document.getElementById(
    'trust-subdomains'
  ) as HTMLInputElement;
  if (trustSubdomainsCheckbox) {
    trustSubdomainsCheckbox.checked = popup_settings.trustSubdomainsByDefault;
  }

  // Bind "To safety" button
  bind('to-safety', 'click', () => {
    getCurrentTab((tab) => {
      if (tab.id) {
        browser.tabs.reload(tab.id);
      }
    }, console.error);
  });

  // Bind "Trust temporarily" button
  bind('temp-trust-domain', 'click', () => {
    getCurrentTab((tab) => {
      let requestedDomain = new URL(tab.url ? tab.url : '').hostname;
      if (popup_settings.ignoreWww) {
        requestedDomain = requestedDomain.replace('www.', '');
      }
      let trustSubdomains = popup_settings.trustSubdomainsByDefault;
      if (trustSubdomainsCheckbox) {
        trustSubdomains = trustSubdomainsCheckbox.checked;
      }
      let expires = +new Date() + popup_settings.tempTrustDuration * 60000;
      trustDomain(requestedDomain, trustSubdomains, expires);
    }, console.error);
  });

  // Bind "Trust permanently" button
  bind('trust-domain', 'click', () => {
    getCurrentTab((tab) => {
      let requestedDomain = new URL(tab.url ? tab.url : '').hostname;
      if (popup_settings.ignoreWww) {
        requestedDomain = requestedDomain.replace('www.', '');
      }
      let trustSubdomains = popup_settings.trustSubdomainsByDefault;
      if (trustSubdomainsCheckbox) {
        trustSubdomains = trustSubdomainsCheckbox.checked;
      }
      trustDomain(requestedDomain, trustSubdomains, 0);
    }, console.error);
  });
};

/**
 * Code to run when the page loads.
 */
const popup_onLoad = (): void => {
  // Load the domain trust status
  getTrustedDomains((trustedDomains) => {
    displayDomainTrust(trustedDomains, popup_settings);
  });

  // Reload domain trust status if it changes in storage
  browser.storage.onChanged.addListener((changes, areaName) => {
    const keys = Object.keys(changes);
    if (areaName === 'local' && keys.indexOf(STORAGE_TRUSTED_DOMAINS) > -1) {
      trustedDomains = JSON.parse(changes[STORAGE_TRUSTED_DOMAINS].newValue);
      displayDomainTrust(trustedDomains, popup_settings);
    }
  });

  bindControls();
  fixPopupHorizontalScroll();
};

let popup_DOMContentLoaded = false;
window.addEventListener('DOMContentLoaded', () => {
  popup_DOMContentLoaded = true;
});

// Load settings and then call onLoad
let popup_settings: BrowserGuardSettings;
let popup_loadTimer: number;
getSettings((storedSettings) => {
  popup_settings = storedSettings;
  popup_loadTimer = self.setInterval(() => {
    if (popup_DOMContentLoaded) {
      self.clearInterval(popup_loadTimer);
      popup_onLoad();
    }
  }, 10);
});

// Reload settings when they are changed
browser.storage.onChanged.addListener((changes, areaName) => {
  const keys = Object.keys(changes);
  if (areaName === 'local' && keys.indexOf(STORAGE_SETTINGS) > -1) {
    popup_settings = JSON.parse(changes[STORAGE_SETTINGS].newValue);
  }
});
