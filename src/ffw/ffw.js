/**
 与background.js通信，打开相应的接口界面
// 测试账户： 
// 私钥：SBPDLIPMKF54CYX6KOCYBKOKG73CGNGZZUXVV6LH43N55DETCUZOWFIB ， 
// 公钥: GAYHQQT37MXPVGAY7RBBC63CI7BM55YNHPTS4UD3YFK5IE6G3FFFEBVZ
// 第三方应用接口内容
// 1. 获取G地址
// 2. 支付
// 3. pathpayment支付
// 4. 加密信息
// 5. 备份非敏感数据
// 6. 恢复非敏感数据
// 7. 授信
// 向页面注入JS
 */ 
import codes from './injectcodes';

 // 接收来自后台的消息
window.chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
  console.log(request);
  if(request.type === 'apicallback') {
    // 来自于api界面的回调
    let cb = window.FFW.callbackObjs[request.callback];
    if(cb){
      cb(request.data);
    }else{
      alert("firefly wallet works failed!");
    }
  }
  sendResponse({type:'apicallback',message: 'success'});
});

// 主动发送消息给后台
function sendMessageToBackground(data, cb) {
	window.chrome.runtime.sendMessage(data, (response) => {
    console.log('-----from background----');
    console.log(response);
    cb(response);
	});
};


//在网页加载完成后，向后台请求当前账户信息，并向前台注入变量
window.document.addEventListener('DOMContentLoaded', () => {
  let temp = document.createElement('script');
  temp.setAttribute('type', 'text/javascript');
  sendMessageToBackground({type:'init'},response =>{
    console.log('read data from response----')
    console.log(response);
    let version = response.version;
    let address = response.address;
    let locale = response.locale;
    temp.innerHTML = codes({version,address,locale})
    document.body.appendChild(temp);
  })
  
});


//接收网页发出的请求
window.addEventListener("message", function(message){
  let data = message.data
  if(data && data.method && 'FireFly' === data.host){
    let params = data;
    params.type = 'openffwapi';
    //向后台发出消息
    sendMessageToBackground(params, response => {
      console.log('--收到网页消息，再向后台转发--');
      console.log(response);
    });
  }
}, false);
