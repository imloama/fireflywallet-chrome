// 第三方应用列表界面
<template>
  <div class="page" dark >

      ffwc 
    <!-- <sign v-if="appEventType === 'sign'" 
        :data="appEventData.data" >
    </sign>
    
    <send-asset v-if="(appEventType === 'pay' || appEventType === 'pathPayment')&& appEventData" 
      :destination="appEventData.destination"
      :appname="appEventData.title"
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      :memo_type="appEventData.memo_type"
      :memo="appEventData.memo"
      :amount="appEventData.amount"
      :pathPayment="appEventType === 'pathPayment'"
      @exit="exitSendAsset"
      @sendsuccess="sendAssetSuccess"
       ></send-asset>
    
    <trust-line v-if="appEventType === 'trust' && appEventData" 
      :appname="appEventData.title" 
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      @exit="exitTrustEvent" @success="successTrustEvent" />

    <sign-x-d-r v-if="appEventType === 'signXDR' && appEventData" 
      :appname="appEventData.title"
      :message="appEventData.message"
      :xdr="appEventData.data"
      @exit="exitSignXDREvent"
      @success="successSignXDREvent"
      />
     -->
    
  </div>
</template>

<script>
// import { mapState, mapActions} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import PasswordSheet from '@/components/PasswordSheet';
import Sign from '@/components/dapp/Sign';
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,
   FFW_EVENT_TYPE_SIGNXDR, FFW_EVENT_TYPE_SHARE,FFW_EVENT_TYPE_BALANCES,
   FFW_EVENT_TYPE_SCAN } from '@/api/ffw'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'
import AccountsNav from '@/components/AccountsNav'
const COLOR_GREEN = '#21CE90'

export default {
  data(){
    return {
      working: false,
      err: null,
      
      appEventType: null,
      appEventData: null,
    }
  },
  computed:{
  },
  beforeMount(){
    //从url地址获取相应的参数
    var url = location.search; //获取url中"?"符后的字串  
    console.log('url0-000---' + url);
    this.appEventData = {}; 
    if (url.indexOf("?") != -1) {  
      var str = url.substr(1);  
      let strs = str.split("&");  
      for(var i = 0; i < strs.length; i ++) { 
          let items = strs[i].split("=");
          let value = unescape(items[1]);
            if(items[0] === 'method'){
                this.appEventType = value;
            }else{
                this.appEventData[items[0]] = value;
            }
        }
    }
    console.log(this.appEventType);
    console.log(this.appEventData);
  },
  methods: {
    getCurrentTabId(){
      return new Promise((resolve,reject) => {
        window.chrome.tabs.query({active:true, currentWindow: true}, tabs=>{
          if(tabs.length == 0){
            reject();
            return;
          }
          resolve(tabs[0].id);
        })
      })
    },
    sendMessageToContentScript(params){
      this.getCurrentTabId().then(tabid =>{
        window.chrome.tabs.sendMessage(tabid,prams,response=>{
          console.log("response---")
        })
      })
    },
    doCallbackEvent(data){
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let params = { type: 'apicallback', callback: cb, data: data}
          //window.chrome.runtime.sendMessage(params,()=>{});
          // var bg = window.chrome.extension.getBackgroundPage();
          // console.log(bg);
          // bg.callffwapi(params);
          //直接给content-script，即ffw.js发送消息
          this.sendMessageToContentScript(params);
        }catch(err){
          console.error(err)
        }
      }
    },
    callbackData(code,message,data){
      // return JSON.stringify({code,message,data})
      return {code,message,data}
    },
    exitSendAsset(){
      this.showSendAsset = false
      this.$nextTick(()=>{
        //this.appInstance.show()
        this.doCallbackEvent(this.callbackData('fail','cancel payment'))
      });
    },
    sendAssetSuccess(hash){
      this.showSendAsset = false
      this.$nextTick(()=>{
        //this.appInstance.show()
        this.doCallbackEvent(this.callbackData('success','success', hash))
      });
    },
    exitEvent(msg){
      this.$nextTick(()=>{
        // this.appInstance.show()
        this.doCallbackEvent(this.callbackData('fail',msg))
        this.$nextTick(()=>{
          this.appEventType = null
          this.appEventData = null   
        })
      })
    },
    successEvent(msg='success',data){
      // alert('----success--event---'+ JSON.stringify(data))
      this.$nextTick(()=>{
        // this.appInstance.show();
        this.doCallbackEvent(this.callbackData('success',msg, data))
        this.$nextTick(()=>{
          this.appEventType = null
          this.appEventData = null   
        })
      })
    },
    exitTrustEvent(){
      this.exitEvent('cancel trust')
    },
    successTrustEvent(){
      this.successEvent()
    },
    exitSignXDREvent(){
      // alert('----exit---signxdr---')
      this.exitEvent('cancel signxdr')
    },
    successSignXDREvent(data){
      // alert('-----signxdr-success---' + data)
      this.successEvent('success',data)
    },

  },
  components: {
    PasswordSheet,
    Loading,
    Card,
    SendAsset,
    TrustLine,
    RecoveryData,
    BackUpData,
    SignXDR,
    Sign,
  }
}
</script>

