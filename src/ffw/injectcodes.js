//要注入到服务器的变量
function codes({version,address, locale = 'zh_cn'}){
    return `if(!window.FFW){
        window.FFW = {};
        FFW.version = "${version}";
        FFW.platform = "chrome extension";
        FFW.address = "${address}";
        FFW.locale = "${locale}";
        FFW.callbackObjs = {}
  
        FFW.addCallback = function(id,fn){
          FFW.callbackObjs[id] = fn;
        };
  
        FFW.callback = function(id, data){
          console.log('callbackObjs:' + JSON.stringify(FFW.callbackObjs))
          var fn = FFW.callbackObjs[id];
          if(fn === undefined){
            fn = window[id];
          }
          if(fn === undefined){
            throw new Error('no callback function');
            return;
          }
          fn.apply(this,[data]);
          delete FFW.callbackObjs[id]; 
        };
  
        FFW.balances = function(callback){
          var params = { method:'balances'};
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
        FFW.pay = function(data,callback){
          var params = { method:'pay',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo};
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
        FFW.pathPayment = function(data,callback){ 
          var params = { method:'pathPayment',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo };
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
        FFW.sign = function(data,callback){
          var params = { method: 'sign', data: data};
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
        FFW.signXDR = function(data,message,callback){
          var params = { method: 'signXDR', data: data, message: message };
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
  
        FFW.trust = function(code,issuer,callback){
          var params = { method: 'trust', code: code, issuer: issuer };
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
        FFW.fireEvent = function(type, data, callback){
          var params = { type: type, data: data};
          params = genParams(params, callback);
          window.postMessage(params, '*');
        };
  
        function genParams(param, callback){
          var params = Object.assign({}, param);
          if(typeof callback === 'function'){
            var id = 'FFW_CB_' + new Date().getTime();
            FFW.addCallback(id, callback);
            params['callback'] = id;
          }else{
            params['callback'] = callback;
          }
          params.host = 'FireFly';
          return params;
        };
        
      };`;
}

export default codes;