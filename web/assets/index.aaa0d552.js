var U=Object.defineProperty;var T=(a,e,o)=>e in a?U(a,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):a[e]=o;var b=(a,e,o)=>(T(a,typeof e!="symbol"?e+"":e,o),o);import{l as I,t as z,f as ee,s as te,d as se,a as ae,m as oe,i as ie,g as N,b as L,c as f,e as F,r as B,h as Y,j as q,k as y,n as M,o as H,p as O,q as re,u as ne,v as ce,w as X,x as D,y as S,z as le,A as R,B as v,C as _,D as p,E as P,F as A,G as j,H as W,I as $,J as de,K as he,L as ue,M as pe,N as K,O as G,P as me,Q as ge,R as ve,S as fe}from"./vendor.1427d59d.js";const be=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerpolicy&&(s.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?s.credentials="include":t.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}};be();var ye="./assets/logo.031fa3c3.jpeg",_e="./assets/tflogo.45a905ce.jpg";const V={v3tiny:{path:"models/yolov3-tiny/model.json",indexedDB:"indexeddb://yolov3-tiny"}},xe=[10,14,23,27,37,58,81,82,135,169,344,319],we={"3":[[6,7,8],[3,4,5],[0,1,2]],"2":[[3,4,5],[1,2,3]]},J=["person","bicycle","car","motorbike","aeroplane","bus","train","truck","boat","traffic light","fire hydrant","stop sign","parking meter","bench","bird","cat","dog","horse","sheep","cow","elephant","bear","zebra","giraffe","backpack","umbrella","handbag","tie","suitcase","frisbee","skis","snowboard","sports ball","kite","baseball bat","baseball glove","skateboard","surfboard","tennis racket","bottle","wine glass","cup","fork","knife","spoon","bowl","banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake","chair","sofa","pottedplant","bed","diningtable","toilet","tvmonitor","laptop","mouse","remote","keyboard","cell phone","microwave","oven","toaster","sink","refrigerator","book","clock","vase","scissors","teddy bear","hair drier","toothbrush"];class ke{constructor(){b(this,"model");b(this,"canvas",document.createElement("canvas"));b(this,"params",{maxBoxes:20,scoreThreshold:.2,iouThreshold:.3,inputSize:416,numClasses:J.length,classNames:J,anchors:xe});b(this,"msg");this.msg="start"}async init(){}async loadModel(e,o){try{this.model=await I(e.indexedDB,o),window._hmt.push(["_trackEvent","load","indexedDB"])}catch{this.model=await I(e.path,o),this.model.save(e.indexedDB),window._hmt.push(["_trackEvent","load","path"])}return this.model}async predict(e){let o=z(()=>{var i;this.canvas.width=this.params.inputSize,this.canvas.height=this.params.inputSize;const t=this.canvas.getContext("2d");t==null||t.drawImage(e,0,0,this.params.inputSize,this.params.inputSize);let s=ee(this.canvas,3);return s=s.expandDims(0).toFloat().div(te(255)),(i=this.model)==null?void 0:i.predict(s)});const n=await this.postprocess(o,[e.videoHeight||e.height,e.videoWidth||e.width]);return se(o),n}async postprocess(e,o){const[n,t]=this.yoloEval(e,o);let s=[],r=[],i=[];const u=ae(t,-1),c=oe(t,-1),l=await ie.nonMaxSuppressionAsync(n,c,this.params.maxBoxes,this.params.iouThreshold,this.params.scoreThreshold);return l.size&&z(()=>{const d=N(n,l),m=N(c,l);d.split(l.size).map(h=>{s.push(h.dataSync())}),m.dataSync().map(h=>{r.push(h)}),i=u.gather(l).dataSync()}),c.dispose(),u.dispose(),l.dispose(),n.dispose(),t.dispose(),s.map((d,m)=>{const h=Math.max(0,d[0]),x=Math.max(0,d[1]),w=Math.min(o[0],d[2]),k=Math.min(o[1],d[3]),C=w-h,Z=k-x;return{top:h,left:x,bottom:w,right:k,height:C,width:Z,score:r[m],classIndex:i[m],class:this.params.classNames[i[m]]}})}yoloEval(e,o){return z(()=>{let n=1,t,s;n=e.length,s=we[n],t=e[0].shape.slice(1,3).map(c=>c*32);const r=L(this.params.anchors).reshape([-1,2]);let i=[],u=[];for(let c=0;c<n;c++){const[l,d]=this.yoloBoxesAndScores(e[c],r.gather(L(s[c],"int32")),t,o);i.push(l),u.push(d)}return i=f(i),u=f(u),[i,u]})}yoloBoxesAndScores(e,o,n,t){const[s,r,i,u]=this.yoloHead(e,o,n);let c=this.yoloCorrectBoxes(s,r,t);c=c.reshape([-1,4]);let l=F(i,u);return l=B(l,[-1,this.params.numClasses]),[c,l]}yoloHead(e,o,n){const t=o.shape[0],s=B(o,[1,1,t,2]),r=e.shape.slice(1,3),i=Y(B(q(0,r[0]),[-1,1,1,1]),[1,r[1],1,1]),u=Y(B(q(0,r[1]),[1,-1,1,1]),[r[0],1,1,1]),c=f([u,i],3).cast(e.dtype);e=e.reshape([r[0],r[1],t,this.params.numClasses+5]);const[l,d,m,h]=y(e,[2,2,1,this.params.numClasses],3),x=M(H(O(l),c),r.reverse()),w=M(F(re(d),s),n.reverse()),k=O(m);let C;return C=O(h),[x,w,k,C]}yoloCorrectBoxes(e,o,n){let t=f(y(e,2,3).reverse(),3),s=f(y(o,2,3).reverse(),3);const r=F(ne(t,M(s,2)),n),i=F(H(t,M(s,2)),n);return f([...y(r,2,3),...y(i,2,3)],3)}}var g=(a=>(a[a.none=0]="none",a[a.error=1]="error",a[a.loading=2]="loading",a[a.ready=3]="ready",a[a.executing=4]="executing",a))(g||{});const E=new ke,Ce=ce({id:"Yolo",state:()=>({status:g.none,fraction:0,colors:{},scaleW:0,scaleH:0,animateId:0,duration:100,expire:100,image:{},boxes:[],msg:""}),getters:{isInit(){return this.status===g.none||this.status===g.error},isLoading(){return this.status===g.loading},loadingPercent(){return`${(this.fraction*100).toFixed(2)}%`},isExecuting(){return this.status===g.executing},labels(){const a=this.boxes,e=this.image.clientWidth,o=this.image.clientHeight,n=this.image.videoWidth,t=this.image.videoHeight,s=e/n,r=o/t;return a.forEach(i=>{i.class in this.colors||(this.colors[i.class]="#"+Math.floor(Math.random()*16777215).toString(16)),i.transform=`translate(${i.left*s}px, ${i.top*r}px)`,i.width=`${i.width*s-4}px`,i.height=`${i.height*r-4}px`,i.percent=`${(i.score*100).toFixed(2)}%`,i.color=this.colors[i.class],window._hmt.push(["_trackEvent","detect",i.class,i.score])}),a},models(){return V}},actions:{async load(){return this.status=g.loading,await E.loadModel(V.v3tiny,{onProgress:a=>this.fraction=a}),this.status=g.ready,!0},start(a=100){this.duration=a,this.animateId=requestAnimationFrame(this.animate)},stop(){cancelAnimationFrame(this.animateId)},animate(){Date.now()>this.expire?E.predict(this.image).then(e=>{this.boxes=e,this.expire=Date.now()+this.duration,this.animateId=requestAnimationFrame(this.animate)}):this.animateId=requestAnimationFrame(this.animate)},init(a){this.image=a,E.init()}}});navigator.mediaDevices===void 0&&(navigator.mediaDevices={});navigator.mediaDevices.getUserMedia===void 0&&(navigator.mediaDevices.getUserMedia=function(a){var e=navigator.webkitGetUserMedia||navigator.mozGetUserMedia;return e?new Promise(function(o,n){e.call(navigator,a,o,n)}):Promise.reject(new Error("getUserMedia is not implemented in this browser"))});const Fe={class:"ai989"},Be=p("header",null,[p("img",{src:ye}),p("img",{src:_e})],-1),Me=p("article",null,[p("h1",null,"\u667A\u80FD\u8F6C\u552E"),p("p",null,"\u6253\u5F00\u6444\u50CF\u5934\uFF0C\u5F00\u59CB\u626B\u63CF\u5546\u54C1")],-1),De=p("legend",null,"\u6444\u50CF\u5934\u591A\u76EE\u6807\u8BC6\u522B",-1),Pe={key:0},je=K("\u542F\u52A8"),ze={class:"container"},Oe={class:"wrapper"},Ae={class:"labels"},Ee=pe('<fieldset><legend>\u6E90\u7801</legend><ul><li><a href="https://gitee.com/thales-ucas/smarty-resale-vue.git" target="_blank">https://gitee.com/thales-ucas/smarty-resale-vue.git</a></li><li><a href="https://github.com/thales-ucas/smarty-resale-vue.git" target="_blank">https://github.com/thales-ucas/smarty-resale-vue.git</a></li></ul></fieldset><fieldset><legend>\u53C2\u8003\u6587\u732E</legend><h2><a href="https://arxiv.org/abs/1506.02640" target="_blank">You Only Look Once: Unified, Real-Time Object Detection</a></h2><h3><span class="descriptor">Authors:</span><a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Redmon%2C+J">Joseph Redmon</a>, <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Divvala%2C+S">Santosh Divvala</a>, <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Girshick%2C+R">Ross Girshick</a>, <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Farhadi%2C+A">Ali Farhadi</a></h3><p>We present YOLO, a new approach to object detection. Prior work on object detection repurposes classifiers to perform detection. Instead, we frame object detection as a regression problem to spatially separated bounding boxes and associated class probabilities. A single neural network predicts bounding boxes and class probabilities directly from full images in one evaluation. Since the whole detection pipeline is a single network, it can be optimized end-to-end directly on detection performance. </p><p>Our unified architecture is extremely fast. Our base YOLO model processes images in real-time at 45 frames per second. A smaller version of the network, Fast YOLO, processes an astounding 155 frames per second while still achieving double the mAP of other real-time detectors. Compared to state-of-the-art detection systems, YOLO makes more localization errors but is far less likely to predict false detections where nothing exists. Finally, YOLO learns very general representations of objects. It outperforms all other detection methods, including DPM and R-CNN, by a wide margin when generalizing from natural images to artwork on both the Picasso Dataset and the People-Art Dataset. </p></fieldset>',2),Ie=X({setup(a){const e=Ce(),o=D(()=>e.isInit),n=D(()=>e.isLoading),t=D(()=>e.loadingPercent),s=S(),r=S(null),i=D(()=>e.labels);function u(c){var l;e.load().then(d=>{e.start()}),(l=navigator==null?void 0:navigator.mediaDevices)==null||l.getUserMedia({audio:!1,video:{facingMode:"environment"}}).then(d=>{s.value?"srcObject"in s.value?(s.value.srcObject=d,r.value=null):r.value="srcObject\u5C5E\u6027\u7F3A\u5931":r.value="video\u5143\u7D20\u4E0D\u5B58\u5728"}).catch(d=>{r.value=d.message}).finally(()=>{window._hmt.push(["_trackEvent","video",r.value?"fail":"success",r.value])})}return le(()=>{s.value&&e.init(s.value)}),(c,l)=>{const d=R("van-button"),m=R("van-loading");return v(),_("div",Fe,[Be,Me,p("fieldset",null,[De,r.value?(v(),_("div",Pe,P(r.value),1)):A("",!0),j(o)?(v(),W(d,{key:1,type:"primary",onClick:de(u,["stop"])},{default:$(()=>[je]),_:1},8,["onClick"])):A("",!0),j(n)?(v(),W(m,{key:2,type:"spinner"},{default:$(()=>[K("\u6A21\u578B\u52A0\u8F7D\u4E2D\u2026\u2026("+P(j(t))+")",1)]),_:1})):A("",!0),p("div",ze,[p("div",Oe,[p("div",Ae,[(v(!0),_(he,null,ue(j(i),h=>(v(),_("div",{class:"label",style:G({transform:h.transform,width:h.width,height:h.height,borderColor:h.color})},[p("div",{class:"text",style:G({color:h.color})},P(h.class)+" "+P(h.percent),5)],4))),256))]),p("video",{ref_key:"webcam",ref:s,autoplay:"",playsinline:"",muted:"",class:"webcam"},null,512)])])]),Ee])}}}),Ne=X({setup(a){return(e,o)=>(v(),_("div",null,[me(Ie)]))}});var Q=Q||[];window._hmt=Q;(function(){var o;var a=document.createElement("script");a.src="https://hm.baidu.com/hm.js?0528a768a473de754ad408b884a48bc5";var e=document.getElementsByTagName("script")[0];(o=e.parentNode)==null||o.insertBefore(a,e)})();ge(Ne).use(ve()).use(fe).mount("#app");
