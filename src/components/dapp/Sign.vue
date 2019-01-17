// XDR签名信息确认
<template>
  <div class="sign-xdr-wrapper">
    
    <!-- 显示确认签名界面 -->
    <div class="confirm-wrapper" v-if="!showPwd">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-dialog v-model="showDlg" persistent dark max-width="460">
        <div class="sign-xdr-content">
          <div class="menu-head">
            <div class="menu-row menu-row-2">
              <div class="name">{{account.name}}</div>
              <div class="address">{{account.address | shortaddress}}</div>
            </div>
            <div style="clear:both"></div>
          </div>
          
          <div class="confirm-content">
            <div class="dlg-title text-center">
              <span>{{$t('Sign')}}</span>
            </div>
          </div>

          <div class="confirm-btns flex-row textcenter">
            <div class="confirm-btn cursorpointer flex1" @click="exit">{{$t('Button.Cancel')}}</div>
            <div class="confirm-btn cursorpointer flex1" @click="doSign">{{$t('Button.OK')}}</div>
          </div>
        </div>
      </v-dialog>
      </div>
    </div>

    <password-sheet :lock="showPwd" @ok="doSign" v-else/>

  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { shortAddress,miniAddress, canSend,sendByPathPayment, send } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import { readAccountData } from '@/api/storage'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import { Decimal } from 'decimal.js'
import isJson from '@/libs/is-json'
import PasswordSheet from '@/components/PasswordSheet'

export default {
  data(){
    return {
      showDlg: true,//显示界面
      err: null,
      showPwd: false,
    }
  },
  props: {
    data: {
      type: String,
      required: true
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      address: state => state.accounts.selectedAccount.address,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters(["balances", "reserve", "native", "base_fee",'base_reserve']),
    
  },
  mounted(){
    this.showDlg = true;
    if(!isJson(this.data)){
      this.$emit('exit','data is invalid')
    }
  },
  methods: {
    exit(){
      this.showDlg = false
      this.$emit('exit')
    },
    doSign(){
      if(!this.islogin){
        this.showPwd = true;
        return;
      }
      let data = signToBase64(this.accountData.seed, this.data)
      this.$emit('success',data)
    },
  },
  components: {
    Card,
    Loading,
    PasswordSheet,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.confirm-wrapper
  position: fixed
  bottom: 0
  // bottom: constant(safe-area-inset-bottom)
  // bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  top: 0
  top: constant(safe-area-inset-top)
  top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  opacity: 1
.dlg-title
  color: $primarycolor.green
  text-align: center
  font-size: 16px
.confirm-title
  height: 1rem
  line-height: 1rem
  font-size: 1rem
  padding-left: .4rem
  color: $primarycolor.font
.confirm-amount
  color: $primarycolor.green
  text-align: center
  font-size: 1rem
.confirm-memo
  padding-left: .5rem
  color: $secondarycolor.font
.confirm-content
  font-size: 16px
  .confirm-row
    padding: 8px 8px
    .label
      color: $secondarycolor.font
    .value
      padding-left: 12px
      color: $primarycolor.green
.confirm-btns
  color: $primarycolor.green
  text-align: center
  font-size: 16px
  height: 42px
  line-height: 42px
  .disable-btn
    color: $secondarycolor.font
.menu-head
  display: block
  padding: .6rem .3rem .3rem .3rem
  width: 100%
  .memo-row
    text-align: center
    width: 100%
  .menu-row-1
    display: block
    margin: auto auto
    width: 50px
    height: 50px
    line-height: 50px
    border-radius: 50px
    text-align: center
    vertical-align: middle
    background: $secondarycolor.gray
    .avatar
      font-size: 24px
      color: primary
  .menu-row-2
    padding: 5px 15px
    text-align:center
    .name
      font-size: 24px
      text-align: center
      overflow: hidden
      text-overflow:ellipsis
      white-space: nowrap
      color: $primarycolor.green
    .address
      font-size: 12px
      color: $secondarycolor.font
  


.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 10px 10px
  word-wrap: break-word
  .sheet-title
    .title
      height: 40px
      line-height: 40px
      font-size: 32px
      text-align: center
      color: $primarycolor.green
      padding: 10px 10px
    .label
      color: $secondarycolor.font
    .value
      font-size: 16px
  .sheet-btns
    margin-top: 10px
    display: inline-block
    width: 100%
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green
.confirm-assets
  padding: .2rem .2rem
  .asset-card
    width: 3rem
    height: 3.2rem
    background: $secondarycolor.gray
    margin: .2rem .2rem
    padding: .2rem .2rem
    border-radius: .2rem
    .asset-icon
      .iconfont
        font-size: 1rem
        color: $primarycolor.green
    .asset-code
      color: $primarycolor.green
    .asset-issuer
      font-size: .2rem
      color: $secondarycolor.font
      overflow: hidden
      white-space: nowrap
      word-break: normal
    &.active
      border: 1px solid $primarycolor.green

.tx-opts
  height: 3rem
  overflow-y: auto
  border-bottom: 1px solid #999999
  border-top: 1px solid #999999
.tx-opt-item
  color: $secondarycolor.font
  border-bottom: 1px solid #999999
  &:last-child
    border-bottom: 0px

.sign-xdr-content
  background: $secondarycolor.gray
  padding-top: 8px
  padding-bottom: 8px
  padding-bottom: calc(8px + constant(safe-area-inset-bottom))
  padding-bottom: calc(8px + env(safe-area-inset-bottom))
</style>

