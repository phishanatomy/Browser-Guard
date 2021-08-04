/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

/**
 * Binds a given event listener to the DOM node with the given ID to the given
 * callback function.
 *
 * @param {string} id The ID of the DOM node to bind.
 * @param {string} event The name of the event to bind, i.e. 'click'.
 * @param {function} callback The function to call when the given event is
 *     triggered on the given DOM node.
 */
const bind = (id: string, event: string, callback: (arg: any) => any): void => {
  const target = document.getElementById(id);
  if (target) {
    target.addEventListener(event, callback);
  }
};

/**
 * Returns a new ID. IDs are random, but not guaranteed to be unique.
 *
 * @return {string} a new ID.
 */
const newId = (): string => {
  return Math.random().toString().split('.')[1];
};

/**
 * Checks if the current browser is Firefox based on the user agent.
 *
 * @return {boolean} Whether or not the current browser is Firefox.
 */
const isFirefox = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

/**
 * Checks if the current browser is Chrome based on the definition of
 * window.chrome.
 *
 * @return {boolean} Whether or not the current browser is Firefox.
 */
const isChrome = (): boolean => {
  return !!window.chrome;
};

/**
 * Removes event listeners from a DOM node by cloning it and replacing it with
 * the clone.
 *
 * @param {HTMLElement} DOMNode The DOM node to remove event listeners from.
 */
const removeEventListeners = (DOMNode: HTMLElement): void => {
  var newDOMNode = DOMNode.cloneNode(true);
  DOMNode.parentNode?.replaceChild(newDOMNode, DOMNode);
};

/**
 * Resolves the URL of an extension resource. Will use Firefox's preferred
 * method if the browser is Firefox, otherwise Chrome's preferred method will be
 * used.
 *
 * @param {string} url The URL of a file to resolve, relative to the root of the
 *     extension.
 * @return {string} The URL of the resource.
 */
const getExtensionURL = (url: string): string => {
  if (isFirefox()) {
    return browser.runtime.getURL(url);
  } else {
    return chrome.extension.getURL(url);
  }
};

/**
 * Returns a copy of a given string with all regex-sensitive characters replaced
 * for use in regular expressions. See: https://stackoverflow.com/a/9310752
 *
 * @param {string} string The string to escape.
 * @return {string} The string with regex characters escaped.
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Triggers the download of a string as a file.
 *
 * @param {string} string The string to download as a file.
 * @param {string} contentType The content type of the file to download, e.g.
 *     "application/json".
 * @param {string} fileName The name to give the downloaded file.
 */
const downloadString = (
  string: string,
  contentType: string,
  fileName: string
): void => {
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute(
    'href',
    `data:${contentType};charset=utf-8,${encodeURIComponent(string)}`
  );
  downloadLink.setAttribute('download', fileName);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

/**
 * Reads the contents of a file selected through a file input into a string and
 * passes it to a callback.
 *
 * @param {HTMLInputElement} input The file input to read.
 * @param {function} callback The function to pass the file contents to (if
 *     any).
 */
const readFileInput = (
  input: HTMLInputElement,
  callback: (string: string) => any
): void => {
  if (input && input.files && input.files[0]) {
    const selectedFile = input.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let contents = '';
      if (event.target && event.target.result) {
        contents = event.target.result.toString();
      }
      callback(contents);
    });
    reader.readAsBinaryString(selectedFile);
  }
};

/**
 * Returns the approximate number of minutes between a given date as a number
 * and now.
 *
 * @param {number} time The date expressed as the number of milliseconds since
 *     1 January 1970 UTC.
 * @return {number} The difference in minutes between the given time and now.
 */
const getTimeInMinutes = (time: number): number => {
  const now = +new Date();
  if (time) {
    if (time > now) {
      return Math.round((time - now) / 1000 / 60);
    } else {
      return Math.round(((time - now) * -1) / 1000 / 60) * -1;
    }
  }
  return 0;
};

/**
 * Returns the approximate number of minutes between a given date as a number
 * and now, followed by 'minute' or 'minutes' (whichever is most appropriate.)
 *
 * @param {number} time The date expressed as the number of milliseconds since
 *     1 January 1970 UTC.
 * @return {string} The difference in minutes between the given time and now,
 *     followed by 'minute' or 'minutes' (whichever is most appropriate.)
 */
const getTimeInMinutesFormatted = (time: number): string => {
  const minutes = getTimeInMinutes(time);
  if (minutes || minutes === 0) {
    const minutesText =
      minutes === 1
        ? browser.i18n.getMessage('minute')
        : browser.i18n.getMessage('minutes');
    return `${minutes} ${minutesText}`;
  }
  return '';
};

/**
 * Changes the color of the main Browser Guard badge, if present as an SVG.
 *
 * @param {string} leftColor The color to set for the left half of the badge.
 *     Can be any valid CSS color.
 * @param {string} rightColor The color to set for the right half of the badge.
 *     Can be any valid CSS color.
 */
const setMainImageColor = (
  leftColor: string,
  rightColor: string,
  fade = false
): void => {
  const leftHalf = document.getElementById('main-image-left');
  const rightHalf = document.getElementById('main-image-right');
  if (leftHalf && rightHalf) {
    if (fade) {
      leftHalf.classList.add('fill-fade');
      rightHalf.classList.add('fill-fade');
    } else {
      leftHalf.classList.remove('fill-fade');
      rightHalf.classList.remove('fill-fade');
    }
    leftHalf.setAttribute('fill', leftColor);
    rightHalf.setAttribute('fill', rightColor);
  }
};

/**
 * Add or remove padding depending on the presence of vertical scrollbars. This
 * works around the bug discusses here:
 *     https://bugzilla.mozilla.org/show_bug.cgi?id=1400279
 * where vertical scrollbars in the popup take up 17 pixels, requiring the body
 * to side-scroll.
 */
const fixPopupHorizontalScroll = (): void => {
  const content = document.getElementById('content');
  if (content && isFirefox()) {
    const layoutPadding = () => {
      if (document.documentElement.scrollHeight > window.innerHeight) {
        content.classList.add('pad');
      } else {
        content.classList.remove('pad');
      }
    };
    layoutPadding();
    window.addEventListener('resize', () => {
      layoutPadding();
    });
  }
};

/**
 * Checks whether or not a given domain is found in a given array of trusted
 * domains.
 *
 * @param {string} testDomain The domain to search for in the array of trusted
 *     domains.
 * @param {TrustedDomain[]} trustedDomains An array of TrustedDomain objects to
 *     check.
 * @param {boolean} ignoreWww Whether to remove "www." from testDomain before
 *     testing its trust.
 */
const isTrustedDomain = (
  testDomain: string,
  trustedDomains: TrustedDomain[],
  ignoreWww: boolean = false
): boolean => {
  const trustedDomain = getTrustedDomain(testDomain, trustedDomains, ignoreWww);
  if (trustedDomain) {
    return true;
  }
  return false;
};

/**
 * Checks whether or not a given domain is found in a given array of trusted
 * domains and returns its TrustedDomain object. Returns false if it is not
 * found.
 *
 * @param {string} testDomain The domain to search for in the array of trusted
 *     domains.
 * @param {TrustedDomain[]} trustedDomains An array of TrustedDomain objects to
 *     check.
 * @param {boolean} ignoreWww Whether to remove "www." from testDomain before
 *     testing its trust.
 */
const getTrustedDomain = (
  testDomain: string,
  trustedDomains: TrustedDomain[],
  ignoreWww: boolean = false
): TrustedDomain | boolean => {
  // Don't trust empty domains
  if (!testDomain) {
    return false;
  }

  // Remove any trailing "." characters form the domain name to prevent domains
  // like "example.com.attacker.com." (note the trailing ".") from being
  // interpreted as an "example.com" subdomain later on
  testDomain = testDomain.replace(/\.*$/g, '');

  if (ignoreWww && testDomain.indexOf('www.') === 0) {
    testDomain = testDomain.replace('www.', '');
  }

  let matchedTrustedDomain = {} as TrustedDomain;
  const trustFound = trustedDomains.some((trustedDomain) => {
    if (trustedDomain.expires === 0 || trustedDomain.expires > +new Date()) {
      // Trust the domain if it is an exact match for a domain in the trust
      // list
      if (trustedDomain.domain === testDomain) {
        matchedTrustedDomain = trustedDomain;
        return true;
      }

      // Trust the domain if it is a subdomain of a domain in the trust list
      // and that domain is set to trust subdomains.
      //
      // Here we assume that the domain we're testing looks like
      // "foo.example.com" and the trusted domain is "example.com". If we
      // replace "example.com" with nothing, we're left with "foo.", with "."
      // as the final character, meaning this is a subdomain of "example.com".
      //
      // However, if we're testing a domain like "fooexample.com" or
      // "example.com.attacker.com", we will instead be left with "foo" or
      // "attacker.com" respectively, and will not consider these to be
      // subdomains of "example.com".
      const domainMatch = new RegExp(escapeRegExp(trustedDomain.domain), 'g');
      const sub = testDomain.replace(domainMatch, '');
      if (sub.slice(-1) === '.' && trustedDomain.trustSubdomains === true) {
        matchedTrustedDomain = trustedDomain;
        return true;
      }
    }
  });
  if (trustFound) {
    return matchedTrustedDomain;
  } else {
    return false;
  }
};

/**
 * Retrieve the list of trusted domains from localStorage and send them to a
 * callback function. Results are an array of TrustedDomain objects.
 *
 * @param {function} callback A function to call with the array of trusted
 *     domains.
 * @param {boolean=} filterExpired Whether or not to remove expired domains from
 *     from the array before sending it to the callback. Default: true.
 */
const getTrustedDomains = (
  callback: (trustedDomains: TrustedDomain[]) => void,
  filterExpired = true
): void => {
  browser.storage.local
    .get(STORAGE_TRUSTED_DOMAINS)
    .then((savedTrustedDomains) => {
      let trustedDomains: TrustedDomain[] = [];
      if (
        typeof savedTrustedDomains[STORAGE_TRUSTED_DOMAINS] !== 'undefined' &&
        savedTrustedDomains[STORAGE_TRUSTED_DOMAINS].length > 0
      ) {
        try {
          trustedDomains = JSON.parse(
            savedTrustedDomains[STORAGE_TRUSTED_DOMAINS]
          );
          if (filterExpired) {
            trustedDomains = removeExpiredTrustedDomains(trustedDomains);
          }
        } catch (e) {}
      }
      callback(trustedDomains);
    });
};

/**
 * Set the list of trusted domains in localStorage to a given array of
 * TrustedDomain objects.
 *
 * @param {TrustedDomain[]} trustedDomains An array of TrustedDomain objects.
 */
const setTrustedDomains = (trustedDomains: TrustedDomain[]): void => {
  const storeSetting = {};
  storeSetting[STORAGE_TRUSTED_DOMAINS] = JSON.stringify(trustedDomains);
  browser.storage.local.set(storeSetting);
};

/**
 * Set the value of the domain field for the trusted domain with the given ID.
 *
 * @param {string} trustedDomainId The ID of the trusted domain to change.
 * @param {boolean} domain The new value of the domain field.
 */
const setTrustedDomain = (trustedDomainId: string, domain: string): void => {
  getTrustedDomains((trustedDomains) => {
    trustedDomains.some((trustedDomain, i) => {
      if (trustedDomain.id === trustedDomainId) {
        trustedDomains[i].domain = domain;
        setTrustedDomains(trustedDomains);
        return true;
      }
    });
  });
};

/**
 * Set the value of the trustSubdomains field for the trusted domain with the
 * given ID.
 *
 * @param {string} trustedDomainId The ID of the trusted domain to change.
 * @param {boolean} trustSubdomains The new value of the trustSubdomains field.
 */
const setTrustSubdomains = (
  trustedDomainId: string,
  trustSubdomains: boolean
): void => {
  getTrustedDomains((trustedDomains) => {
    trustedDomains.some((trustedDomain, i) => {
      if (trustedDomain.id === trustedDomainId) {
        trustedDomains[i].trustSubdomains = trustSubdomains;
        setTrustedDomains(trustedDomains);
        return true;
      }
    });
  });
};

/**
 * Returns the 'expires' value for a trusted domain rule matching the specified
 * "loadedDomain" and "trustedDomains" values, if any.
 *
 * @param {string} loadedDomain The domain to search for in the array of trusted
 *     domains.
 * @param {TrustedDomain[]} loadedDomain An array of TrustedDomain objects to
 *     check. *
 * @param {boolean} ignoreWww Whether to remove "www." from testDomain before
 *     testing its trust.
 */
const getTrustExpires = (
  loadedDomain: string,
  trustedDomains: TrustedDomain[],
  ignoreWww: boolean = false
): number | boolean => {
  const trustedDomain = getTrustedDomain(
    loadedDomain,
    trustedDomains,
    ignoreWww
  );
  if (trustedDomain && typeof trustedDomain !== 'boolean') {
    return trustedDomain.expires;
  }
  return false;
};

/**
 * Set the value of the expires field for the trusted domain with the given ID.
 *
 * @param {string} trustedDomainId The ID of the trusted domain to change.
 * @param {boolean} expires The new value of the expires field.
 */
const setTrustExpires = (trustedDomainId: string, expires: number): void => {
  getTrustedDomains((trustedDomains) => {
    trustedDomains.some((trustedDomain, i) => {
      if (trustedDomain.id === trustedDomainId) {
        trustedDomains[i].expires = expires;
        setTrustedDomains(trustedDomains);
        return true;
      }
    });
  });
};

/**
 * Add a domain to the trust list in localStorage.
 *
 * @param {string} domain The domain name to trust, with or without subdomains.
 * @param {boolean} trustSubdomains Whether or not to trust subdomains of the
 *     specified domain.
 * @param {number} expires A date as a number specifying when this domain should
 *     be removed from the trust list.
 */
const trustDomain = (
  domain: string,
  trustSubdomains: boolean,
  expires: number
): void => {
  getTrustedDomains((trustedDomains) => {
    // Just update the Expires value if there is already a trust entry for
    // this domain with the same trustSubdomains value
    const domainAlreadyTrusted = trustedDomains.some((trustedDomain, i) => {
      if (
        trustedDomain.domain === domain &&
        trustedDomain.trustSubdomains === trustSubdomains
      ) {
        trustedDomains[i].expires = expires;
        return true;
      }
    });
    // Otherwise, create a new trust entry for this domain
    if (!domainAlreadyTrusted) {
      const id = newId();
      const newDomain: TrustedDomain = {id, domain, trustSubdomains, expires};
      trustedDomains.push(newDomain);
    }
    setTrustedDomains(trustedDomains);
  });
};

/**
 * Removes a given trusted domain from the list of trusted domains.
 *
 * @param {string} trustedDomainId The ID of the trusted domain to untrust.
 */
const untrustDomain = (trustedDomainId: string): void => {
  getTrustedDomains((trustedDomains) => {
    trustedDomains.some((trustedDomain, i) => {
      if (trustedDomain.id === trustedDomainId) {
        trustedDomains.splice(i, 1);
        setTrustedDomains(trustedDomains);
        return true;
      }
    });
  });
};

/**
 * Removes expired domains from a given array of TrustedDomain objects.
 *
 * @param {TrustedDomain[]} trustedDomains An array of TrustedDomain objects to
 *     remove expired trusted domains from.
 * @return {TrustedDomain[]} An array of trusted domains which aren't expired.
 */
const removeExpiredTrustedDomains = (
  trustedDomains: TrustedDomain[]
): TrustedDomain[] => {
  return trustedDomains.filter((trustedDomain) => {
    return trustedDomain.expires === 0 || trustedDomain.expires > +new Date();
  });
};

/**
 * Retrieves the saved settings object from local storage and passes it to
 * callback. Passes an object with default settings if there are no saved
 * settings. This function merges default settings and saved settings before
 * returning them, so new setting values can be added to the application without
 * breaking existing user's settings.
 *
 * @param {function} callback The function to call with the settings object.
 */
const getSettings = (
  callback: (settings: BrowserGuardSettings) => void
): void => {
  browser.storage.local.get(STORAGE_SETTINGS).then((savedSettings) => {
    let settings: BrowserGuardSettings = DEFAULT_BROWSER_GUARD_SETTINGS;
    if (
      typeof savedSettings[STORAGE_SETTINGS] !== 'undefined' &&
      savedSettings[STORAGE_SETTINGS].length > 0
    ) {
      try {
        const parsedSettings = JSON.parse(savedSettings[STORAGE_SETTINGS]);
        settings = {...DEFAULT_BROWSER_GUARD_SETTINGS, ...parsedSettings};
      } catch (e) {}
    }
    callback(settings);
  });
};

/**
 * Saves the given settings object to local storage.
 *
 * @param {BrowserGuardSettings} settings The settings object to save.
 */
const setSettings = (settings: BrowserGuardSettings): void => {
  const storeSetting = {};
  storeSetting[STORAGE_SETTINGS] = JSON.stringify(settings);
  browser.storage.local.set(storeSetting);
};
