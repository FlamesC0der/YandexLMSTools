chrome.tabs.onUpdated.addListener(function(e,a,s){a.url&&!a.url.includes("solutions")&&chrome.tabs.sendMessage(e,{message:"changedURL",url:a})}),chrome.storage.onChanged.addListener(function(e,a){for(var s in e){var n=e[s];chrome.tabs.query({active:!0,currentWindow:!0},function(a){chrome.tabs.sendMessage(a[0].id,{message:"storageUpdate",data:{key:Object.keys(e)[0],value:n.newValue}})})}});