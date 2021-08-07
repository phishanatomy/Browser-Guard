<p align="center">
  <img width="256" height="256" src="/src/art/browser-guard-256.png" alt="Browser Guard Logo">
</p>

# Browser Guard
Protect browsers from accessing untrusted websites. A browser extension for the paranoid.

## How it Works
Browser Guard intercepts all top-level navigation requests and checks if the destination is on your list of trusted domains. If it is not found, the request is blocked, and you're given the option to temporarily or permanently trust the domain.

<p align="center">
  <img src="https://user-images.githubusercontent.com/3778841/128482235-e00e91b8-00f1-4bc5-be85-0e93680f1e93.png" alt="Browser Guard block page">
</p>

## How to Install Browser Guard

### [Firefox](https://addons.mozilla.org/en-US/firefox/addon/browser-guard/)
You can install Browser Guard for Firefox by installing the [Browser Guard](https://addons.mozilla.org/en-US/firefox/addon/browser-guard/) addon from the Mozilla addon store.

### Chrome (and Chromium-based)
You can install Browser Guard in Chrome and other Chromium-based browsers by loading it as an unpacked extension using the following steps:

 1) Download the ZIP file for the latest release of Browser Guard from [releases](https://github.com/phishanatomy/Browser-Guard/releases).
 2) Extract the ZIP file to a directory like `C:\users\<your name>\Documents\extensions\Browser Guard`.
 3) Open Chrome and access your extension settings, either by navigating to `Settings` > `Extensions`, or by entering `chrome://extensions` in the URL bar.
 4) Enable the "Developer mode" switch.
 5) Click the "Load unpacked" button.
 6) Browse to the directory where you extracted the extension, e.g. `C:\users\<your name>\Documents\extensions\Browser Guard`. Make sure you're in the same directory as the `manifest.json` fil.
 7) Click the "Select Folder" button.

### Others
For all other browsers which support [WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), you can build the TypeScript files yourself, and install the extension using the `/src` directory in your repository.

## Privacy
Browser Guard takes your privacy seriously. No data is collected by Browser Guard at any point, and no connections are ever made to any remote servers.