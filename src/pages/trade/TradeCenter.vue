/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="false" menuName="TradeCenter" ref="toolbar">
      <v-btn icon @click.native="showAccounts" slot="left-tool">
          <i class="material-icons font28">menu</i>
      </v-btn>
    
       <v-btn icon slot='right-tool' @click="pickershow()">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <accounts-nav :show="showaccountsview" @close="closeView"/>

    
    <m-layout>
    <v-layout class="mt-2">
      <v-flex xs8>
        <card class="secondarygray">

          <!--底部工具条-->
          <div class="tbar flex-row pa-2 pt-3 pb-3">
            <div class="flex2 pl-2">{{$t('Menu.TradeCenter')}}</div>
            <div class="flex4 textright">
              <span v-for="(item,index) in allTags" :key="index" @click="tagIndex = index"
                :class="'pt-1 pb-1 pl-4 pr-4 tag cursorpointer ' + (tagIndex === index ? 'active':'')" 
                > {{allTagsLabel[index]}}</span>
            </div>
            <div class="flex1 textright flex-row" style="flex-direction:row-reverse;">
                <v-progress-circular class="pr-2" indeterminate size=24 v-if="refreshing" color="primary"></v-progress-circular>
                <v-icon class="cursorpointer pr-2" @click="reloadTradePairs" v-if="!refreshing">refresh</v-icon>
                <v-icon class="cursorpointer pr-2"  @click="pickershow">add</v-icon>
            </div>
          </div>


              <div class="pa-2" v-for="(item,index) in allTags" :key="index" v-show="tagIndex === index">
                <ul class="tradepairs-ul">
                  <li class="tradepair-li">
                    <v-layout class="pair-wrapper textcenter" row>
                      <v-flex xs2 class="pa1 pt-2 pb-2">{{$t('Asset')}}</v-flex>
                      <v-flex xs9>
                        <div class="flex-row">
                          <div class="flex1 pa1 pt-2 pb-2">{{$t('open_price')}}</div>
                          <div class="flex1 pa1 pt-2 pb-2">{{$t('high_price')}}</div>
                          <div class="flex1 pa1 pt-2 pb-2">{{$t('low_price')}}</div>
                          <div class="flex1 pa1 pt-2 pb-2">{{$t('Trade.Price')}}</div>
                          <div class="flex1 pa1 pt-2 pb-2">{{$t('change_price')}}</div>
                        </div>
                      </v-flex>
                      <v-flex xs1></v-flex>
                    </v-layout>
                  </li>
                  <li class="tradepair-li" v-for="(pair,index) in pairItems[item]" :key="index">
                    <v-layout class="pair-wrapper" row>
                      <v-flex xs2>
                        <div class="flex-row">
                          <div class="choose-icon-wrapper pr-2" v-if="!pair.custom">
                            <v-icon color="primary" @click.stop="delPairFromCustom(pair)" v-if="pair.isChoosed">star</v-icon>
                            <v-icon color="primary" @click.stop="choosePairToCustom(pair)" v-else>star_border</v-icon>
                          </div>
                          <div class="choose-icon-wrapper pr-2" v-else>
                            <v-icon color="primary" @click.stop="del(index,pair)">delete_forever</v-icon>
                          </div>
                          <div class="from-wrapper" @click="trade(index,pair)">
                            <div class="code">{{pair.from.code}}/{{pair.to.code}}</div>
                            <div class="issuer" v-if="assethosts[pair.from.code]">{{assethosts[pair.from.code]}}</div>
                            <div class="issuer" v-else-if="assethosts[pair.from.issuer]">{{assethosts[pair.from.issuer]}}</div>
                            <div class="issuer" v-else>{{pair.from.issuer | miniaddress}}</div>
                          </div>
                        </div>
                      </v-flex>
                      <v-flex xs9 @click="showChart(index,pair)">
                        <k-line 
                          :base="pair.from" :counter="pair.to" 
                          :height="56" :timeout="10*index"
                          :tradepairIndex="pair.tradepairIndex"
                          :ref="'kline'+pair.tradepairIndex"
                          ></k-line>
                      </v-flex>
                      <v-flex xs1 class="textcenter">
                        <v-btn color="primary" block flat @click="trade(index,pair)">{{$t('Trade')}}</v-btn>
                      </v-flex>
                    </v-layout>
                    <div class="operate-box" v-if="pair.custom">
                      <div class="del" @click="del(index,pair)">
                        <div class="refreshimg" v-if="delworking"></div>
                        <div v-else>{{$t('Delete')}}</div>
                      </div>
                      <div class="trade" @click="trade(index,pair)">{{$t('Trade.Trade')}}</div>
                    </div>
                  </li>
                  
                </ul>
              </div>

        </card>
      </v-flex>
      <v-flex xs4 class="pl-2">
        <trade-pair-details ref="tpdInstance" v-if="selectTradePair" :base="selectedBase" :counter="selectedCounter" />
      </v-flex>


      </v-layout>
    </m-layout>

       <picker @select="pairchosen" 
              :data="items" 
              :selected-index="[itemsInitOrder,itemsInitOrder]"
              ref="picker1"
              title="" 
              :cancelTxt="$t('Cancel')"
              :confirmTxt="$t('Confirm')"
      ></picker>

     <v-snackbar
      :timeout="5000"
      bottom
      vertical
      v-model="snackbar"
      :color = 'snackbarColor'
      >
      {{ snackbarText }}
        <v-btn flat  dark small @click.native="snackbar = false">{{$t('Close')}}</v-btn>
      </v-snackbar>
      <!-- <tab-bar/> -->
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Picker from "@/components/picker"
import AccountsNav from '@/components/AccountsNav'
import { mapState, mapActions,mapGetters} from 'vuex'
import { miniAddress } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import KLine from '@/components/KLine'
import TabBar from '@/components/TabBar'
import { getTradeAggregation,getTradeAggregation1day,RESOLUTION_1HOUR } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { getTrades } from '@/api/trade'
var moment = require('moment')
import {Decimal} from 'decimal.js'
import Scroll from '@/components/Scroll'
import { REMOVE_TRADEPAIR_KLINE_DATA } from '@/store/modules/AccountsStore' 
import { ZH_CN } from '@/locales/index'
import TradePairDetails from '@/components/TradePairDetails'

const TAG_ALL = 'All', TAG_XCN = 'XCN', TAG_XLM = 'XLM', TAG_BTC = 'BTC', TAG_ETH = 'ETH', TAG_CUSTOM = '_CUSTOM', TAG_XFF = 'XFF'

const TAGS_ZH_CN = [TAG_CUSTOM, TAG_XCN, TAG_BTC, TAG_XLM]
const TAGS_OTHER = [TAG_CUSTOM, TAG_BTC, TAG_XLM, TAG_XCN]

export default {
  data(){
    return {
      title: 'Menu.TradeCenter',
      showbackicon: false,
      showmenuicon: true,
      working: false,
      delworking: false,//正在删除
      isadd: false,//打开新增窗口
      addpair:null,
      snackbarText: '',
      snackbar: false,
      snackbarColor: 'primary',
      filterTag: TAG_XCN,
      tagIndex: 0,

      showaccountsview: false,
      selectedItem: null,
      allTags: [],
      allTagsLabel: [],

      refreshing: false,

      selectedTradePair:null,
      selectedBase: null,
      selectedCounter: null,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      tradepairs: state => state.accounts.tradepairs,
      islogin: state => state.accounts.accountData.seed ? true:false,
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding,
      tradePairKLineData: state => state.accounts.tradePairKLineData,
      sysTradePairs: state => state.accounts.defaultTradePairs,
      tradePairsStat: state => state.accounts.tradePairsStat,
      lastUpdateTradePairStatTime: state => state.accounts.lastUpdateTradePairStatTime,
      app: state => state.app
    }),
    ...mapGetters([
      'balances',
    ]),
    readLabelTxt(){
      if(this.lastUpdateTradePairStatTime){
        return this.$t('lastUpdate')+':' + new moment(this.lastUpdateTradePairStatTime).format('YYYY-MM-DD HH:mm:ss')
      }else{
        return 'ReleaseToRefresh'  
      }
    },
    
    pairItems(){
      let custom=[];
      let custom_ids = []
      this.tradepairs.custom.forEach((item,index) => {
          custom.push(Object.assign({}, item,{tradepairIndex: 'custom_'+index, custom: true,index}))
          let idf = isNativeAsset(item.from) ? 'XLM' : item.from.code+'-'+item.from.issuer
          let idt = isNativeAsset(item.to) ? 'XLM' : item.to.code +'-'+item.to.issuer
          custom_ids.push(idf+'_'+idt)
          custom_ids.push(idt+'_'+idf)
      })

      custom.sort((a,b)=>{
        return a.from.code.localeCompare(b.from.code)
      })

      let syspairs = Object.assign({}, this.sysTradePairs)
      
      let copypairs = {}
      for(let key  in syspairs){
        let arr=  syspairs[key]
        let copyarr = []
        for(let i=0,n=arr.length; i<n; i++){
          let item = arr[i]
          let idf = isNativeAsset(item.from) ? 'XLM' : item.from.code+'-'+item.from.issuer
          let idt = isNativeAsset(item.to) ? 'XLM' : item.to.code +'-'+item.to.issuer
          let isChoosed = false
          let ida = idf +'_'+idt
          let idb = idt +'_'+idf
          if(custom_ids.indexOf(ida) >= 0 || custom_ids.indexOf(idb) >= 0){
            isChoosed = true
          }
          copyarr.push(Object.assign({},item,{tradepairIndex: 'sys_'+i, custom: false, isChoosed}) )
       }
       copyarr.sort((item1,item2)=> {return item1.from.code.localeCompare(item2.from.code)})
       copypairs[key] = copyarr
      }
      copypairs[TAG_CUSTOM] = custom
      return copypairs;
    },
    pairs(){
      let result = []
      if(this.filterTag === TAG_CUSTOM){
        this.tradepairs.custom.forEach((item,index)=>{
          result.push(Object.assign({}, item,{tradepairIndex: 'custom_'+index, custom: true}))
        })
        return result
      }
      this.tradepairs.sys.forEach((item,index)=>{        
        if(this.filterTag === TAG_ALL || item.to.code === this.filterTag){
          result.push(Object.assign({},item,{tradepairIndex: 'sys_'+index, custom: false}))
        }
      })
      return result
    },
    items(){
      if(!this.balances)return []
      let values = [], hosts = [], issuers = []
      this.balances.forEach((element) => {
        values.push(element.code)
        if(isNativeAsset(element)){
          hosts.push(this.assethosts[element.code])
          issuers.push(undefined);
        }else{
          if(this.assethosts[element.issuer]){
            hosts.push(this.assethosts[element.issuer])
          }else{
            hosts.push(miniAddress(element.issuer))
          }
          issuers.push(element.issuer);
        }
      })
      var x = []
      this.balances.forEach((element,i)=>{
        let y = {'value':i,text:{'code':element.code,host:hosts[i], issuer: issuers[i]}}
        x.push(y)
      })     
      return x
      // return [{values,hosts},{values,hosts}]
    },
    itemsInitOrder(){
      if(!this.items.length) return
      return parseInt((this.items.length-1)/2)
    },

  },
  watch:{
  },
  beforeMount(){
    this.selectedTradePair = this.pairItems[TAG_CUSTOM][0]
    let locale = this.app.locale
    if(locale && locale.key !== ZH_CN.key){
      this.allTags = TAGS_OTHER
      this.allTagsLabel = [this.$t('custom'),TAG_BTC, TAG_XLM, TAG_XCN]
      if(!this.selectedTradePair){
        this.selectedTradePair = this.pairItems[TAGS_OTHER[1]][0]
      }
    }else{
      this.allTags = TAGS_ZH_CN
      this.allTagsLabel = [this.$t('custom'),TAG_XCN, TAG_BTC, TAG_XLM]
      if(!this.selectedTradePair){
        this.selectedTradePair = this.pairItems[TAGS_ZH_CN[1]][0]
      }
    }
    this.selectedBase = this.selectedTradePair.from
    this.selectedCounter = this.selectedTradePair.to
    
    this.filterTag = TAGS_OTHER[0]

   
    
    //保存默认的交易对
    // this.saveDefaultTradePairs()
    // let custom = this.tradepairs.custom
    // if( custom && custom.length > 0){
    //   this.filterTag = TAG_CUSTOM
    //   this.tagIndex = TAGS.indexOf(TAG_CUSTOM).toString()
    // }
    // this.allTagsLabel = [TAG_XCN, TAG_BTC, TAG_XLM, this.$t('custom')]
    this.reloadTradePairs().then(data=>{}).catch(err=>{});
  },
  mounted(){
    // if(!this.islogin){
    //   this.$refs.toolbar.showPasswordLogin()
    //   return
    // }

  },
  methods: {
    ...mapActions({
      deleteTradePair: 'deleteTradePair',
      createNewTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      getAssetsAccount: 'assetsAccount',
      saveDefaultTradePairs: 'saveDefaultTradePairs',
      saveDefaultTradePairsStat: 'saveDefaultTradePairsStat',
      saveTradePairStat: 'saveTradePairStat',

    }),
    reloadTradePairs(){
      this.refreshing = true
      let promises = [this.saveDefaultTradePairsStat()]
      let custom = this.tradepairs.custom
      let ids = this.getSysPairIds()
      for(let i=0,n=custom.length;i<n;i++){
        let item = custom[i]
        let idf = isNativeAsset(item.from) ? 'XLM' : item.from.code+'-'+item.from.issuer
        let idt = isNativeAsset(item.to) ? 'XLM' : item.to.code +'-'+item.to.issuer
        if(ids.indexOf(idf+'_'+idt) >=0)continue;
        promises.push(this.saveTradePairStat({base: getAsset(custom[i].from), counter: getAsset(custom[i].to)}))
      }
      return new Promise((resolve,reject)=>{
        Promise.all(promises).then(()=>{
          this.refreshing = false
          this.$store.commit('SET_TRADEPAIR_UPDATETIME', new Date().getTime())
          resolve()
        }).catch(err=>{
          this.refreshing = false
          this.$store.commit('SET_TRADEPAIR_UPDATETIME', new Date().getTime())
          resolve()
        })
      })
    },
    getSysPairIds(){
      let ids = []
      for(let key  in this.sysTradePairs){
        let arr = this.sysTradePairs[key]
        for(let i=0,n=arr.length;i<n;i++){
          let item = arr[i]
          let idf = isNativeAsset(item.from) ? 'XLM' : item.from.code+'-'+item.from.issuer
          let idt = isNativeAsset(item.to) ? 'XLM' : item.to.code +'-'+item.to.issuer
          let ida = idf +'_'+idt
          ids.push(ida)
        }
      }
      return ids;
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
    pickershow(){
      if(this.notfunding){
        this.snackbarText = this.$t('Error.AccountNotFund')
        this.snackbarColor = 'primary'
        this.snackbar = true
        return
      }
      this.$refs.picker1.show()
    },
    pairchosen(pickerSelectedIndex){
      console.log("selectedIndex" + pickerSelectedIndex)
      if(pickerSelectedIndex[0] === pickerSelectedIndex[1]){
        this.snackbarText = this.$t('Error.AddTradePair.SameAsset')
        this.snackbarColor = 'error'
        this.snackbar = true
        return
      }
      this.checkTradePair(pickerSelectedIndex)
    },
    checkTradePair(indexPair){
      let from_code  = this.balances[indexPair[0]].code
      let from_issuer = this.balances[indexPair[0]].issuer
      let to_code = this.balances[indexPair[1]].code
      let to_issuer = this.balances[indexPair[1]].issuer
      let pair =  { from: {code:from_code,issuer:from_issuer}, 
              to: { code: to_code, issuer: to_issuer}  }
      let key = from_code + (from_issuer||'stellar.org') + to_code + (to_issuer||'stellar.org')
      for (let tp of this.tradepairs.custom){
        let key1 = tp.from.code + (tp.from.issuer||'stellar.org')+tp.to.code + (tp.to.issuer||'stellar.org')
        let key2 = tp.to.code + (tp.to.issuer||'stellar.org')+tp.from.code + (tp.from.issuer||'stellar.org')
        if(key === key1 || key === key2){
          this.$toasted.error(this.$t('Error.AddTradePair.ExistPair'))
          return 
        }
      }
      return this.addOK(pair)
    },
    onPicker(v1,v2){
      let issuer1 = null
      let issuer2 = null
      this.balances.forEach(ele=>{
        if(ele.code === v1){
          issuer1 = ele.issuer
        }else if(ele.code === v2){
          issuer2 = ele.issuer
        }
      })
      this.addpair = { from: {code: v1, issuer: issuer1}, to: { code: v2, issuer: issuer2}  }
    },
    add(){
      this.isadd = true
    },
    addCancel(){
      this.addpair = null
      this.isadd = false
    },
    addOK(pair){
      console.log('pair adding')
      if(this.working)return
      this.working = true
      //判断是否可行，保存
      if(pair){
        this.isadd =  false
      }else{
        console.log('------------------------')
      }
      this.createNewTradePair(pair)
        .then(data=>{
          this.working = false
          this.$toasted.show(this.$t('Trade.AddTradePairSuccess'))
        })
        .catch(err=>{
          this.$toasted.error(this.$t('Error.AddTradePairFailed'))
          this.working = false
        })

    },
    del(index,pair){
      if(this.working)return
      if(this.delworking)return
      this.working = true
      this.delworking = true
      this.deleteTradePair({custom: pair.custom, index: pair.index, tradepair: pair})
          .then(data=>{
            this.$toasted.show(this.$t('Trade.DeleteTradePairSuccess'))
            this.working = false
            this.delworking = false
            this.selectedItem = null
            // this.$store.commit('REMOVE_TRADEPAIR_KLINE_DATA', pair.index)
          })
          .catch(err=>{
            this.working = false
            this.delworking = false
            this.$toasted.error(this.$t('Error.DeleteTradePairFailed'))
          })
    },
    switchPair(index,pair){
      if(this.working)return
      this.working = true
      let tradepair = { from: pair.to, to: pair.from }
      this.switchTradePair({custom: pair.custom, index: pair.index, tradepair})
        .then(data=>{
            this.$toasted.show(this.$t('Trade.SwitchTradePairSuccess'))
            this.working = false
            try{
              let doms = window.document.querySelectorAll('.pair-wrapper')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }
        })
        .catch(err=>{
          this.working = false
          this.$toasted.error(this.$t('Error.SwitchTradePairFailed'))
        })
    },
    trade(index,tradepair){
      console.log('------------------------trade----')
      console.log(tradepair)
      this.selectTradePair({custom: tradepair.custom, index: tradepair.tradepairIndex, tradepair})
      console.log('-------111-----22---')
      this.$router.push({name: 'Trade'})
    },
    doFilter(tag){
      this.filterTag = tag
    },
    refresh(){
      let funcs = []
      this.pairs.forEach(item=>{
        let key = 'kline'+item.tradepairIndex
        funcs.push(this.$refs[key][0].reload())
      })
      console.log('-----')
      console.log(funcs)
      return Promise.all(funcs)
    },
    choosePairToCustom(pair){
      this.addOK({from: pair.from, to: pair.to})
      this.working = true
      setTimeout(()=>{
        this.working = false
      },1000)
    },
    delPairFromCustom(pair){
      let idf1 = isNativeAsset(pair.from) ? 'XLM' : pair.from.code+'-'+pair.from.issuer
      let idt1 = isNativeAsset(pair.to) ? 'XLM' : pair.to.code +'-'+pair.to.issuer 
      let key1 = idf1 + "_" + idt1;
      let key2 = idt1 + "_" + idf1;
      let index = -1
      let data = this.tradepairs.custom
      let tradepair = null
      for(let i=0,n=data.length;i<n;i++){
        let item = data[i]
        let idf2 = isNativeAsset(item.from) ? 'XLM' : item.from.code+'-'+item.from.issuer
        let idt2 = isNativeAsset(item.to) ? 'XLM' : item.to.code +'-'+item.to.issuer
        let key = idf2 + '_' + idt2
        if(key === key1 || key === key2){
          index = i;
          tradepair = item
          break;
        }
      }
      if(index>-1){
        tradepair = Object.assign({}, tradepair, {index, custom: true})
        this.del(index,tradepair);
      }
    },
    showChart(index,pair){

      this.selectedTradePair = pair
      this.selectedBase = pair.from
      this.selectedCounter = pair.to
      this.$refs.tpdInstance.reload()


      // this.selectedTradePair = null
      // this.selectedBase = null
      // this.selectedCounter = null
      // this.$nextTick(()=>{
      //   this.selectedTradePair = pair
      //   this.selectedBase = pair.from
      //   this.selectedCounter = pair.to
      //   console.log('-------------show chart------')
      //   console.log( this.selectTradePair)
      //   console.log(this.selectedBase)
      //   console.log(this.selectedCounter)
      //   this.$refs.tpdInstance.reload()
      // })

    }

   
  },
  components: {
    Toolbar,
    Card,
    Picker,
    KLine,
    TabBar,
    //draggable,
    AccountsNav,
    TradePairDetails,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'

.trade-card-content
  position: relative
  // border: 1px solid $secondarycolor.gray
  padding: 5px 5px
  background: $primarycolor.gray
  border-radius: 5px
  color: $secondarycolor.font
.tradepairs-ul
  padding: 0px 0px
  color: $secondarycolor.font
.tradepair-li
  overflow: hidden
  position: relative
  cursor: pointer
  .pair-wrapper
    position: relative
    z-index: 2
    padding: 2px 2px 
    padding-bottom: 0px
    background: $secondarycolor.gray
    width: 100%
    overflow:hidden
    .from-wrapper
      width: 100%
      overflow: hidden
      .code
        font-size: 14px
        color: $secondarycolor.font
        text-align: left
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: left
        font-size: 12px
        overflow: hidden
    .to-wrapper
      width: 100%
      overflow: hidden
      .code
        font-size: 16px
        color: $secondarycolor.font
        text-align: center
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: center
        font-size: 14px
        overflow: hidden
    .exchange-wrapper
      .exchange
        text-align: center
        .icons.material-icons
          font-size: 20px
          color: $secondarycolor.font
          padding-top: 10px
    .choose-icon-wrapper
      margin: 0px auto
      padding: 8px 5px

.tradepair-li
  border-bottom: 1px solid $primarycolor.gray
  // background: $primarycolor.gray
.tradepair-li:last-child
  border-bottom: 0px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  padding: 1px 1px
  .trade
  .del
    display: flex
    justify-content: center
    align-items: center
    background-color: $primarycolor.gray
    color: $primarycolor.green
    padding: 0 12px
  .del
    //background-color: $secondarycolor.red
    //border-right: 1px solid $secondarycolor.gray
    color: $primarycolor.red
    text-align:center
    vertical-align: middle
    .refreshimg
      display: block
      width: 20px
      height: 20px
      background: url(../../assets/img/refresh-icon.png) no-repeat center center
      background-size: 16px 16px
      animation: rotate 2s infinite
      animation-timing-function: linear
      margin: auto auto
.mask
  position: fixed
  top: 0
  bottom: 0
  background:$secondarycolor.gray
  opacity: 0.8
  z-index: 9
  left:0
  right:0
.picker
  z-index: 10
  position: fixed
  bottom: 0
.btn-group
  background:$secondarycolor.gray
  display: flex
  .btn-cancel
  .btn-ok
    flex: 1
    text-align: center
    height: 48px
    line-height: 48px
    font-size: 16px
    color: $primarycolor.green
.selected
  -webkit-transform: translate(-50%, 0)
  -webkit-transition: 0.3s
  transform: translate(-50%, 0)
  transition: 0.3s
.filter-tag.active
  color: $primarycolor.green

.refresh
  position:absolute
  right: 10px
  top: 0px
  color: $primarycolor.green
  cursor: pointer
  z-index: 9

.tag
  background: rgb(79,82,91)
  border-radius: 20px
  margin: auto 5px
  font-size: 14px
  &.active
    color: $primarycolor.green
.tbar
  border-bottom: 1px solid $primarycolor.gray
</style>

