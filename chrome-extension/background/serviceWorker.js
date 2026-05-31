/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Background Worker script for Chrome Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateSelection",
    title: "Translate selection via LinguaLayer AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateSelection" && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "TRIGGER_OVERLAY",
      text: info.selectionText
    });
  }
});
