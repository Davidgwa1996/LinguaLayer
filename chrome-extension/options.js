/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const userLang = document.getElementById('userLang');
  const saveButton = document.getElementById('saveButton');

  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['userLang'], (res) => {
      if (res.userLang) {
        userLang.value = res.userLang;
      }
    });
  }

  saveButton.addEventListener('click', () => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ userLang: userLang.value }, () => {
        alert('Language Preference Configured Successfully');
      });
    } else {
      alert('Local Storage Context not bound.');
    }
  });
});
