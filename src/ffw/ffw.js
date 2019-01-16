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

 // 接收来自后台的消息
window.chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
	if(request.cmd == 'update_font_size') {
		var ele = document.createElement('style');
		ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
		document.head.appendChild(ele);
	}
	else {
		// tip(JSON.stringify(request));
		sendResponse('我收到你的消息了：'+JSON.stringify(request));
	}
});

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
	window.chrome.runtime.sendMessage({greeting: message || '你好，我是content-script呀，我主动发消息给后台！'}, function(response) {
    //tip('收到来自后台的回复：' + response);
    console.log('-----from background----');
	});
};


window.document.addEventListener('DOMContentLoaded', ()=>{
  
});

//接收网页发出的请求
window.addEventListener("message", function(message){
  let data = message.data
  if(data && data.method && 'FireFly' === data.host){
    let method = data.method;
    let params = data.params;
    params.method = method;
    params.type = 'openffwapi';
    //向后台发出消息
    window.chrome.runtime.sendMessage(params,response => {
      console.log(response);
    });
  }
}, false);
