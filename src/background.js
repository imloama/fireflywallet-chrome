// import store from './store';

global.browser = require('webextension-polyfill');

// 从缓存中获取数据

console.log('from background')
//alert(`Hello ${store.getters.foo}!`);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.method === 'showAlert') {
    chrome.tabs.create({url:"chrome://newtab"})
  }
});

chrome.browserAction.onClicked.addListener(function (tab) {
  //chrome.tabs.create({ url: chrome.runtime.getURL('result.htm') });
  console.log('on tab');
  // chrome.tabs.create({url:"chrome://newtab"})
  chrome.tabs.create({url: chrome.runtime.getURL('index.html') });
});

/*
// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
// 用户接受了上边的建议内容
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });
  */