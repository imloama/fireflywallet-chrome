// 使用localstorage保存数据，如果是浏览器环境下
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64
// delete file
export function deleteFile(file){
  return new Promise((resolve,reject)=>{
    try{
      if(window.chrome){
        window.chrome.storage.local.removeItem(file,()=>{
          resolve(true)
        })      
      }else{
        localStorage.removeItem(file)
        resolve(true)
      }
    }catch(err){
      reject(err)
    }
  });
}

// read file into string
export function readFile(key){
  return new Promise((resolve,reject)=>{
    if(window.chrome && window.chrome.storage){
      console.log('------read from chrome.storage.local---')
      window.chrome.storage.local.get(key,value=>{
        let v = value[key]
        resolveValue(value,resolve,reject);  
      })      
    }else{
      console.log('------read from localstorage----')
      let value = localStorage.getItem(key)
      resolveValue(value,resolve,reject);
    }
  });
}

function resolveValue(value,resolve,reject){
  if(value){
    try{
      value = Base64.decode(value)
      resolve(value)
    }catch(err){
      reject(err)
    }
  }else{
    reject('Error.NoData')
  }
}

// save file content
export function saveFile(key,value){
  return new Promise((resolve,reject)=>{
    try{
      if(typeof value === 'object'){
        value = JSON.stringify(value)
      }
      value = Base64.encode(value)
      if(window.chrome && window.chrome.storage){
        let items = {};
        items[key] = value;
        window.chrome.storage.local.set(items, (value)=>{
          resolve(true)
        });
      }else{
        localStorage.setItem(key,value)
        resolve()
      }    
    }catch(err){
      reject(err)
    }
  });
}
