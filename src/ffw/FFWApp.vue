// 第三方应用列表界面
<template>
  <div class="page" dark >

    <v-toolbar :height="`60px`" fixed dark class="primary itoolbar" dense :clipped-left='true'>
        <v-toolbar-title class="white--text">{{$t('AppName')}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <span>{{showname}}</span>
    </v-toolbar>

    <f-f-w-c></f-f-w-c>
    
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import defaultsDeep  from 'lodash/defaultsDeep'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,
   FFW_EVENT_TYPE_SIGNXDR, FFW_EVENT_TYPE_SHARE,FFW_EVENT_TYPE_BALANCES,
   FFW_EVENT_TYPE_SCAN } from '@/api/ffw'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'
const COLOR_GREEN = '#21CE90'
import FFWC from './FFWC'

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
       islogin: state => state.accounts.accountData.seed ? true : false
     }),
     showname(){
       let account = this.$store.state.accounts.selectedAccount
       if(account && account.address){
         let address = account.address;
         return address.substring(0,4)+"..."+address.substring(address.length-4,address.length)
          +"(" + account.name +")";
       }
       return null;
     }
  },
  beforeMount(){
    
  },
  methods: {
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },

  },
  components: {
    Loading,
    Card,
    FFWC
  }
}
</script>

