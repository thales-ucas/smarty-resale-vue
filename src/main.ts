import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import Vant from 'vant';
import 'vant/lib/index.css';

var _hmt:any = _hmt || [];
window._hmt = _hmt;
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?0528a768a473de754ad408b884a48bc5";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode?.insertBefore(hm, s);
})();

createApp(App).use(createPinia()).use(Vant).mount('#app');
