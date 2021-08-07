/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

// Key used to store and access trusted domains in local storage
const STORAGE_TRUSTED_DOMAINS = 'trustedDomains';

// Key used to store and access settings in local storage
const STORAGE_SETTINGS = 'settings';

// Default BrowserGuardSettings object
const DEFAULT_BROWSER_GUARD_SETTINGS = {
  // Whether to remove "www." from domains before trusting them and to ignore
  // the "www" subdomain such that trusting "example.com" also trusts
  // "www.example.com"
  ignoreWww: true,

  // Whether to trust subdomains by default
  trustSubdomainsByDefault: true,

  // Duration to temporarily trust domains (in minutes)
  tempTrustDuration: 60,

  // Whether to set the "Expires" field to the tempTrustDefaultDuration value by
  // default on the "Add trust" form in settings (else it is set to "Never" by
  // default)
  tempTrustByDefault: false,
}

// Colors
const BLUE_DARK = '#009fd6';
const BLUE_LIGHT = '#14b7f1';
const YELLOW_DARK = '#f0c133';
const YELLOW_LIGHT = '#f7d777';
const RED_DARK = '#a82121';
const RED_LIGHT = '#c64f4f';
const GRAY_DARK = '#d5d5d5';
const GRAY_LIGHT = '#eaeaea';

// Browser and Extension protocols. These are URL prefixes which are part of the
// browser or an extension and will never be blocked.
const BROWSER_PROTOCOLS = [
  'about:',
  'chrome:',
  'edge:',
  'file',
];
const EXTENSION_PROTOCOLS = [
  'moz-extension:',
  'chrome-extension:',
  'extension:',
];
