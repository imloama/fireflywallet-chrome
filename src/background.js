// import store from './store';
// import pkg from '../package.json'

const version = "0.0.1";
const FILENAME_ACCOUNTS = 'accounts.firefly'
const FILENAME_APP_SETTING = 'appsetting.firefly'

// global.browser = require('webextension-polyfill');

// 从缓存中获取数据

console.log('from background')
//alert(`Hello ${store.getters.foo}!`);
var urlEncode = function(param, key, encode) {
  if (param==null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
      paramStr += '&' + key + '='  + ((encode==null||encode) ? encodeURIComponent(param) : param); 
  } else {
      for (var i in param) {
          var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
          paramStr += urlEncode(param[i], k, encode)
      }
  }
  return paramStr;
}

function getSelectedAccount(){
  let accounts = window.localStorage.getItem(FILENAME_ACCOUNTS)
  if(accounts){
    accounts = JSON.parse(window.atob(accounts));
    let selected = accounts.selected;
    return accounts.data[selected];
  }
  return null;
}

function getAppSettings(){
  let settings = window.localStorage.getItem(FILENAME_APP_SETTING);
  if(!settings)return null;
  settings = JSON.parse(window.atob(settings));
  return settings;
}

//接收来自于ffw的消息
window.chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('---get message----');
  console.log(message);
  if(message.type ==='openffwapi'){//打开openapi的交互界面
    let params = urlEncode(message);
    openffwapi(params.slice(1),()=>{});
    return;
  }
  if(message.type==='apicallback'){//向ffw.js发消息

    return;
  }
  if(message.type ==='init'){
    let account = getSelectedAccount();
    let settings = getAppSettings();
    let address = account ? account.address:null;
    let locale = settings ? settings.locale.key:null;
    sendResponse({version, address, locale});
    return;
  }
});

window.chrome.browserAction.onClicked.addListener(function (tab) {
  window.chrome.tabs.create({url: chrome.runtime.getURL('index.html') });
});

function openffwapi(params, callback){
  chrome.windows.create({
    url: 'ffwmain.html?'+params,
    type: 'popup',
    width: 550,
    height: 640
  }, callback);
}

function callffwapi(params){

}

//如果用户在网页上选择了一个G地址，可以右键菜单选择支付
window.chrome.contextMenus.create({
  title: "使用萤火钱包发送到：%s",
  contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
  onclick: function(params){
    let address = params.selectionText;
    let urlparams = '?method=pay&target='+address
    openffwapi(urlparams,()=>{});
  }
});
window.chrome.contextMenus.create({
  title: "查询资产：%s",
  contexts: ['selection'],
  onclick: function(params){
    let address = params.selectionText;
    chrome.tabs.create({url: 'https://steexp.com/account/'+address});
  }
});
