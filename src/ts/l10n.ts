/**
 * This file is part of Browser Guard, a browser extension for the paranoid.
 * Author: piroor <https://github.com/piroor>
 * Author: Jonathan Gregson <browser-guard-support@phishanatomy.com>
 * License: GPL v3
 *
 * This file was originally released under the MIT license. However, it has been
 * modified for Browser Guard and re-released under the GPL v3 license.
 * Source:
 *   http://github.com/piroor/webextensions-lib-l10n
 */

const l10n = {
  updateString(string: string): string {
    return string.replace(/__MSG_([@\w]+)__/g, (matched, key) => {
      return chrome.i18n.getMessage(key) || matched;
    });
  },

  updateSubtree(node: Node): void {
    const texts = document.evaluate(
      'descendant::text()[contains(self::text(), "__MSG_")]',
      node,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
      const text = texts.snapshotItem(i);
      if (text) {
        text.nodeValue = this.updateString(text.nodeValue);
      }
    }

    const attributes = document.evaluate(
      'descendant::*/attribute::*[contains(., "__MSG_")]',
      node,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
      const attribute = attributes.snapshotItem(i) as SubtreeAttribute;
      if (attribute && attribute.value) {
        attribute.value = this.updateString(attribute.value);
      }
    }
  },

  updateDocument() {
    this.updateSubtree(document);
  },
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    l10n.updateDocument();
  },
  {once: true}
);
