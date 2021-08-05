/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

const importError = {
  noErrors: 0,
  errorNoFile: 1,
  errorInvalidFile: 2,
  errorGenericError: 3,
};

/**
 * Imports trusted domains from a JSON-encoded string.
 *
 * @param {string} string The string to import. Should be an array of
 *     TrustedDomain objects as valid JSON.
 */
const importDomains = (string: string): number => {
  if (string && string.length > 10) {
    try {
      const domainsToImport = JSON.parse(string);
      getTrustedDomains((trustedDomains) => {
        domainsToImport.forEach((domainToImport: TrustedDomain) => {
          if (
            typeof domainToImport.id === 'string' &&
            typeof domainToImport.domain === 'string' &&
            typeof domainToImport.trustSubdomains === 'boolean' &&
            typeof domainToImport.expires === 'number'
          ) {
            trustedDomains.push({
              id: newId(),
              domain: domainToImport.domain,
              trustSubdomains: domainToImport.trustSubdomains,
              expires: domainToImport.expires,
            } as TrustedDomain);
          }
        });
        setTrustedDomains(trustedDomains);
      });
      return importError.noErrors;
    } catch (e) {
      return importError.errorGenericError;
    }
  } else {
    return importError.errorInvalidFile;
  }
};

/**
 * Shows an error message corresponding to the given import error ID.
 */
const showImportError = (errorId: number): void => {
  const importDomainsStatus = document.getElementById('import-domains-status');
  if (importDomainsStatus) {
    if (errorId === importError.errorNoFile) {
      importDomainsStatus.innerText = browser.i18n.getMessage('noFileSelected');
    } else if (errorId === importError.errorInvalidFile) {
      importDomainsStatus.innerText = browser.i18n.getMessage('invalidFile');
    } else {
      importDomainsStatus.innerText =
        browser.i18n.getMessage('thereWasAnError');
    }
  }
};

/**
 * Returns a trusted domain list row with all of the buttons and controls bound.
 *
 * @param {TrustedDomain} trustedDomain The trusted domain object to create a
 *     list row for.
 * @return {HTMLDivElement} The new list row with all of the buttons and
 *     controls bound.
 */
const getTrustedDomainListRow = (
  trustedDomain: TrustedDomain
): HTMLDivElement => {
  const listRow = document.createElement('div');
  listRow.classList.add('trusted-domain-list-row');
  listRow.classList.add('trusted-domain-entry');

  // Create the "Domain" field
  const domainField = document.createElement('div');
  domainField.classList.add('trusted-domain-list-row-domain');
  const domainInput = document.createElement('input');
  domainInput.type = 'text';
  domainInput.classList.add('trusted-domain-list-domain-input');
  domainInput.value = trustedDomain.domain;
  domainInput.dataset.originalValue = trustedDomain.domain;
  domainInput.addEventListener('change', (event) => {
    if (event.target) {
      const target = event.target as HTMLInputElement;
      if (target.dataset.originalValue) {
        if (target.value !== target.dataset.originalValue) {
          setTrustedDomain(trustedDomain.id, target.value);
        }
      }
    }
  });
  domainField.appendChild(domainInput);
  listRow.appendChild(domainField);

  // Create the "Trust Subdomains" field
  const subdomainField = document.createElement('div');
  subdomainField.classList.add('trusted-domain-list-row-subdomain');
  const subdomainCheckbox = document.createElement('input');
  subdomainCheckbox.type = 'checkbox';
  subdomainCheckbox.checked = trustedDomain.trustSubdomains;
  subdomainCheckbox.addEventListener('change', (event) => {
    if (event.target) {
      setTrustSubdomains(
        trustedDomain.id,
        (event.target as HTMLInputElement).checked
      );
    }
  });
  subdomainField.appendChild(subdomainCheckbox);
  listRow.appendChild(subdomainField);

  // Create the "Expires" field
  const expiresField = document.createElement('div');
  expiresField.classList.add('trusted-domain-list-row-expires');
  const expiresText = document.createElement('div');
  expiresText.classList.add('trusted-domain-list-row-expires-text');
  if (trustedDomain.expires === 0) {
    expiresText.innerText = browser.i18n.getMessage('never');
  } else {
    expiresText.innerText = getTimeInMinutesFormatted(trustedDomain.expires);
    expiresText.title = new Date(trustedDomain.expires).toString();
  }
  expiresField.appendChild(expiresText);
  listRow.appendChild(expiresField);

  // Create the "Options" field
  const removeTrustField = document.createElement('div');
  removeTrustField.classList.add('trusted-domain-list-row-options');
  const removeTrustButton = document.createElement('button');
  removeTrustButton.innerText = browser.i18n.getMessage('removeTrust');
  removeTrustButton.addEventListener('click', (event) => {
    untrustDomain(trustedDomain.id);
  });
  removeTrustField.appendChild(removeTrustButton);
  listRow.appendChild(removeTrustField);

  return listRow;
};

/**
 * Returns a form used to create a new trusted domain list row with all of the
 * buttons and controls bound.
 *
 * @return {HTMLDivElement} The new form as a list row with all of the buttons
 *     and controls bound.
 */
const bindAddTrustedDomainForm = (): void => {
  getSettings((settings) => {
    // Bind the "Trust Subdomains" checkbox
    const subdomainCheckbox = document.getElementById(
      'new-trust-subdomain-input'
    ) as HTMLInputElement;
    if (subdomainCheckbox) {
      subdomainCheckbox.checked = settings.trustSubdomainsByDefault;
    }

    // Bind the "Expires" field
    if (settings.tempTrustByDefault) {
      const expiresSelect = document.getElementById(
        'new-expires-input'
      ) as HTMLInputElement;
      if (expiresSelect && settings.tempTrustDuration !== 0) {
        expiresSelect.value = settings.tempTrustDuration.toString();
      }
    }

    // Bind the "Add trust" button
    bind('add-trust-button', 'click', () => {
      const newDomain = document.getElementById(
        'new-trusted-domain-input'
      ) as HTMLInputElement;
      const newSubdomains = document.getElementById(
        'new-trust-subdomain-input'
      ) as HTMLInputElement;
      const newExpires = document.getElementById(
        'new-expires-input'
      ) as HTMLInputElement;
      if (newDomain && newDomain.value && newSubdomains && newExpires) {
        let expires = parseInt(newExpires.value);
        if (expires !== 0) {
          expires = +new Date() + expires * 60000;
        }
        trustDomain(newDomain.value, newSubdomains.checked, expires);
      }
    });
  });
};

/**
 * Sets the value of items in the settings form to match their associated saved
 * setting.
 *
 * @param {BrowserGuardSettings} settings? Settings to apply. Optional. If
 *     omitted, settings will be fetched before applying them.
 */
const bindSettingsFormValues = (settings?: BrowserGuardSettings): void => {
  const bindForm = (settings: BrowserGuardSettings): void => {
    const settingsKeys = Object.keys(settings);
    const settingsToBind = document.querySelectorAll(
      '[data-bind-setting]'
    ) as NodeListOf<HTMLInputElement>;
    settingsToBind.forEach((settingToBind) => {
      if (settingToBind.dataset.bindSetting) {
        const boundSetting = settingToBind.dataset.bindSetting;
        if (settingsKeys.indexOf(boundSetting) > -1) {
          if (settingToBind.type === 'checkbox') {
            settingToBind.checked = settings[boundSetting];
          } else {
            settingToBind.value = settings[boundSetting];
          }
        } else {
          console.warn(
            `Cannot bind setting value, ${boundSetting} is not defined.`
          );
        }
      }
    });
  };

  if (typeof settings !== 'undefined') {
    bindForm(settings);
  } else {
    getSettings((settings) => {
      bindForm(settings);
    });
  }
};

/**
 * Binds event listeners on settings form items such that they change the
 * associated saved setting.
 */
const bindSettingsFormEvents = (): void => {
  getSettings((settings) => {
    const settingsKeys = Object.keys(settings);
    const settingsToBind = document.querySelectorAll(
      '[data-bind-setting]'
    ) as NodeListOf<HTMLInputElement>;
    settingsToBind.forEach((settingToBind) => {
      if (settingToBind.dataset.bindSetting) {
        const boundSetting = settingToBind.dataset.bindSetting;
        if (settingsKeys.indexOf(boundSetting) > -1) {
          if (settingToBind.type === 'checkbox') {
            settingToBind.addEventListener('change', (event) => {
              getSettings((settings) => {
                settings[boundSetting] = settingToBind.checked;
                setSettings(settings);
              });
            });
          } else {
            settingToBind.addEventListener('change', () => {
              getSettings((settings) => {
                settings[boundSetting] = settingToBind.value;
                setSettings(settings);
              });
            });
          }
        } else {
          console.warn(
            `Cannot bind setting event, ${boundSetting} is not defined.`
          );
        }
      }
    });
  });
};

/**
 * Populates the given div with the given list of TrustedDomain objects.
 *
 * @param {TrustedDomain[]} trustedDomains The trusted domain objects to add to
 *     the DOM.
 * @param {HTMLDivElement} target The div to add the trusted domain list to.
 */
const loadTrustedDomainsList = (
  trustedDomains: TrustedDomain[],
  target: HTMLDivElement
): void => {
  trustedDomains.forEach((trustedDomain) => {
    target.appendChild(getTrustedDomainListRow(trustedDomain));
  });
};

window.addEventListener('load', () => {
  // Detect browser for quirks fixes
  if (isFirefox()) {
    document.body.classList.add('firefox');
  } else if (isChrome()) {
    document.body.classList.add('chrome');
  }

  // Bind tabs
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      [...tabs, ...sections].forEach((unselect) => {
        unselect.classList.remove('selected');
      });
      tab.classList.add('selected');
      const boundSection = (tab as HTMLElement).dataset.bind;
      if (boundSection && document.getElementById(boundSection)) {
        document.getElementById(boundSection)?.classList.add('selected');
      }
    });
  });

  bindAddTrustedDomainForm();
  bindSettingsFormValues();
  bindSettingsFormEvents();

  // Reload elements when settings change
  browser.storage.onChanged.addListener((changes, areaName) => {
    const keys = Object.keys(changes);
    if (areaName === 'local' && keys.indexOf(STORAGE_SETTINGS) > -1) {
      bindAddTrustedDomainForm();
      let newSettings = changes[STORAGE_SETTINGS].newValue;
      try {
        bindSettingsFormValues(JSON.parse(newSettings));
      } catch (e) {}
    }
  });

  const trustedDomainsList = document.getElementById(
    'trusted-domains-list'
  ) as HTMLDivElement;
  if (trustedDomainsList) {
    // Load the trusted domains list
    getTrustedDomains((trustedDomains) => {
      loadTrustedDomainsList(trustedDomains, trustedDomainsList);
    });

    // Reload trusted domains list if it changes in storage
    browser.storage.onChanged.addListener((changes, areaName) => {
      const keys = Object.keys(changes);
      if (areaName === 'local' && keys.indexOf(STORAGE_TRUSTED_DOMAINS) > -1) {
        trustedDomains = JSON.parse(changes[STORAGE_TRUSTED_DOMAINS].newValue);
        const trustedDomainEntries = trustedDomainsList.querySelectorAll(
          '.trusted-domain-entry'
        );
        trustedDomainEntries.forEach((entry) => {
          entry.parentElement?.removeChild(entry);
        });
        loadTrustedDomainsList(trustedDomains, trustedDomainsList);
      }
    });
  }

  // Load the extension version on the about page
  const versionOutput = document.getElementById('about-version');
  if (versionOutput) {
    versionOutput.innerText = browser.runtime.getManifest().version;
  }

  // Change behavior if settings is opened inside the popup
  if (new URL(document.location.href).searchParams.get('popup') === 'true') {
    const settingsIcon = document.getElementById('heading-settings-wrap');
    if (settingsIcon) {
      settingsIcon.classList.remove('hide');
    }
    fixPopupHorizontalScroll();
    self.setTimeout(() => {
      fixPopupHorizontalScroll();
    }, 100);
    document.body.classList.add('popup');
  }

  // Bind the "Import trusted domains" button
  bind('import-domains-button', 'click', () => {
    const importDomainsStatus = document.getElementById(
      'import-domains-status'
    );
    const importDomainsFile = document.getElementById(
      'import-domains-file'
    ) as HTMLInputElement;
    let errorId = importError.noErrors;
    if (
      importDomainsFile &&
      importDomainsFile.files &&
      importDomainsFile.files.length > 0
    ) {
      readFileInput(importDomainsFile, (contents) => {
        const error = importDomains(contents);
        if (error !== importError.noErrors) {
          showImportError(errorId);
        }
      });
    } else {
      errorId = importError.errorNoFile;
    }
    if (errorId !== importError.noErrors) {
      showImportError(errorId);
    } else if (importDomainsStatus) {
      importDomainsStatus.innerHTML =
        '<img class="check" src="../art/check.svg">';
      self.setTimeout(() => {
        importDomainsStatus.innerText = '';
      }, 3000);
    }
  });

  // Bind the "Export trusted domains" button
  bind('export-domains-button', 'click', () => {
    getTrustedDomains((trustedDomains) => {
      if (trustedDomains && Object.keys(trustedDomains).length > 0) {
        downloadString(
          JSON.stringify(trustedDomains),
          'application/json',
          'browser-guard-trusted-domains.json'
        );
      } else {
        alert(browser.i18n.getMessage('noTrustedDomainsFound'));
      }
    });
  });

  // Bind the "Reset trusted domains" button
  bind('reset-trusted-domains-button', 'click', () => {
    if (confirm(browser.i18n.getMessage('resetTrustedDomainsConfirm'))) {
      const setting = {};
      setting[STORAGE_TRUSTED_DOMAINS] = JSON.stringify([]);
      browser.storage.local.set(setting);
      const check = document.getElementById('reset-trusted-domains-check');
      if (check) {
        check.classList.remove('hide');
        self.setTimeout(() => {
          check.classList.add('hide');
        }, 3000);
      }
    }
  });

  // Bind the "Reset settings" button
  bind('reset-settings-button', 'click', () => {
    if (confirm(browser.i18n.getMessage('resetSettingsConfirm'))) {
      const setting = {};
      setting[STORAGE_SETTINGS] = JSON.stringify(
        DEFAULT_BROWSER_GUARD_SETTINGS
      );
      browser.storage.local.set(setting);
      const check = document.getElementById('reset-settings-check');
      if (check) {
        check.classList.remove('hide');
        self.setTimeout(() => {
          check.classList.add('hide');
        }, 3000);
      }
    }
  });
});
