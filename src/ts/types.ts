/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 */

interface TrustedDomain {
  id: string;
  domain: string;
  trustSubdomains: boolean;
  expires: number;
}

interface BrowserGuardSettings {
  ignoreWww: boolean;
  trustSubdomainsByDefault: boolean;
  tempTrustDuration: number;
  tempTrustByDefault: boolean;
}

interface URLClassification {
  firstParty?: string[];
  thirdParty?: string[];
}

interface FullWebRequestBodyDetails
  extends chrome.webRequest.WebRequestBodyDetails {
  urlClassification: URLClassification;
  originUrl: string;
}

interface SubtreeAttribute extends Node {
  value: any;
}
