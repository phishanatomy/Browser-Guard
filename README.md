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

### [Chrome](https://chrome.google.com/webstore/detail/browser-guard/pkmhephjkgkjgfmpjcdjapkmjappfbjf/) (and Chromium-based browsers)
You can install Browser Guard for Chrome and Chromium-based browsers by installing the [Browser Guard](https://chrome.google.com/webstore/detail/browser-guard/pkmhephjkgkjgfmpjcdjapkmjappfbjf/) extension from the Chrome Web Store.

Alternatively, you can side-load Browser Guard in Chrome and Chromium-based browsers using the following steps:
1. Download the ZIP file for the latest release of Browser Guard from [releases](https://github.com/phishanatomy/Browser-Guard/releases)
1. Extract the ZIP file to a directory like `C:\users\<your name>\Documents\extensions\Browser Guard`
1. Open Chrome and access your extension settings, either by navigating to `Settings` > `Extensions`, or visiting the `chrome://extensions` URL
1. Enable the "Developer mode" switch
1. Click the "Load unpacked" button
1. Browse to the directory where you extracted the Browser Guard, e.g., `C:\users\<your name>\Documents\extensions\Browser Guard` (make sure you're in the same directory as the `manifest.json` file)
1. Click the "Select Folder" button

### Other Browsers
For all other browsers which support [WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), you can build the TypeScript files yourself following the [Building Browser Guard](#building-browser-guard) steps, and install the extension using the `/src` directory in your repository.

## Building Browser Guard
Browser Guard uses Visual Studio Code and NPM to manage the development and build environment. Ensure you have Visual Studio Code and Node.JS installed before proceeding.

Steps to build:
1. Clone the Browser Guard repository locally or download the repository as a ZIP file and extract it
1. In a command prompt window, change to the "Browser-Guard" folder and run "npm install"
1. Open the "Browser-Guard" folder in Visual Studio Code and select "Open Workspace" when prompted
1. Open any of the files in "/src/ts"
1. Type "Shift + Control + B"
1. Select either "tsc: build" (to build once) or "tsc: watch" (to build after each change)

## Privacy
Browser Guard takes your privacy seriously. No data is collected by Browser Guard at any point, and no connections are ever made to any remote servers.