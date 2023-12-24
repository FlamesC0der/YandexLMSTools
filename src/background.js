chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
      if (!changeInfo.url.includes("solutions")) {
        chrome.tabs.sendMessage( tabId, {
          message: 'changedURL',
          url: changeInfo
        })
      }
    }
  }
);

chrome.storage.onChanged.addListener(
  function(changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          message: 'storageUpdate',
          data: {key: Object.keys(changes)[0], value: storageChange.newValue}
        })
      })
    }
  }
)