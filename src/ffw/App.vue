// 第三方应用列表界面
<template>
  <div class="page" dark >

    <v-toolbar :height="`60px`" fixed dark class="primary itoolbar" dense :clipped-left='true'>
        <v-toolbar-side-icon @click="showAccounts"></v-toolbar-side-icon>
        <v-toolbar-title class="white--text">{{$t('AppName')}}</v-toolbar-title>
        <v-spacer></v-spacer>
    </v-toolbar>

    <accounts-nav :show="showaccountsview" @close="closeView"/>
    
    <sign v-if="appEventType === 'sign'&& !showPassword" 
        :data="appEventData.data" >
    </sign>
    
    <send-asset v-if="(appEventType === 'pay' || appEventType === 'pathPayment')&& appEventData && !showPassword" 
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
    
    <trust-line v-if="appEventType === 'trust' && appEventData&& !showPassword" 
      :appname="appEventData.title" 
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      @exit="exitTrustEvent" @success="successTrustEvent" />

    <sign-x-d-r v-if="appEventType === 'signXDR' && appEventData&& !showPassword" 
      :appname="appEventData.title"
      :message="appEventData.message"
      :xdr="appEventData.data"
      @exit="exitSignXDREvent"
      @success="successSignXDREvent"
      />
    
    <password-sheet :lock="`true`" v-if="showPassword"/>
    
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import PasswordSheet from '@/components/PasswrodSheet';
import Sign from '@/components/Sign';
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
      
      appEventType: null,//接收到的appevent事件
      appEventData: null,//接收的appevent的data

      showaccountsview: false,

      showPassword: false,


    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      myaddresses: state => state.app.myaddresses||[],
      locale: state => state.app.locale,
      balances: state=> state.account.data.balances,
    }),
  },
  beforeMount(){
    //从url地址获取相应的参数
    var url = location.search; //获取url中"?"符后的字串  
    console.log('url0-000---' + url);
    this.appEventData = {};  
    if (url.indexOf("?") != -1) {  
      var str = url.substr(1);  
      strs = str.split("&");  
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
  },
  methods: {
    ...mapActions(['getAccountInfo']),
    
    // getBalances(){
    //   this.getAccountInfo(this.account.address)
    //     .then(data=>{

    //       this.doCallbackEvent(this.callbackData('success', 'success', this.balances))
    //     })
    //     .catch(err=>{
    //       this.doCallbackEvent(this.callbackData('fail',err.message))
    //     })
    // },
    // doSign(d){
    //   //签名
    //   let data = d.data
    //   if(!isJson(data)){
    //     return this.doCallbackEvent(this.callbackData('fail','data is invalid'))
    //   }
    //   if(data){
    //     let cdata = signToBase64(this.accountData.seed, data)
    //     console.log('---------------encrypt data---' + cdata)
    //    // alert('sign---'+cdata)
    //     this.doCallbackEvent(this.callbackData('success', 'success', cdata))
    //   }else{
    //    // alert('sign-fail--')
    //     this.doCallbackEvent(this.callbackData('fail','no data to sign'))
    //   }
    // },
    
    doCallbackEvent(data){
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let params = { type: 'apicallback', callback: cb, data: data}
          //window.chrome.runtime.sendMessage(params,()=>{});
          var bg = window.chrome.extension.getBackgroundPage();
          console.log(bg);
          bg.callffwapi(params);
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
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
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
    AccountsNav,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $secondarycolor.gray
.app-title
  padding: .1rem .1rem
  overflow: hidden
  white-space: nowrap
  font-size: 14px
.card-content
  padding: 20px 10px
.t2
  font-size: 16px
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray
  color: $primarycolor.red

.server-apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px

.apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px
.app-card
  background: $secondarycolor.gray!important
.app-card-wrapper
  border: 1px solid $primarycolor.gray!important
.app-avatar
  border-radius: 50%!important
.dapp-subtitle
  color: $secondarycolor.font
.add-app-avatar
  background: $secondarycolor.gray!important
.hidebackground
  background: none!important

.dapp--container
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  overflow-y: auto
  background: $primarycolor.gray
  z-index: 9
  .dapp__progress
    width:375px
    margin: 0 auto
  .dapp__toolbar
    margin: auto auto
    height: 48px
    line-height: 48px
    .dapp__t__bar
      line-height: 48px
      background: $primarycolor.green
      width:375px
      margin: 0 auto
      .material-icons
        cursor: pointer
  .webView
    width:375px
    height:667px
    margin: auto auto
    background: #ffffff

.app-icon-del
  position: absolute
  top: 4px
  right: 4px
  cursor: pointer
  .material-icons
    font-size: 20px
    color: #999999
.app-icon-edit
  position: absolute
  cursor: pointer
  top: 4px
  right: 28px
  .material-icons
    font-size: 20px
    color: #999999
</style>
