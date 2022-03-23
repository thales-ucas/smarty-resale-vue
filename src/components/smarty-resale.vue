<template>
  <div class="ai989">
    <header>
      <img src="@/assets/images/logo.jpeg" />
      <img src="@/assets/images/tflogo.jpg" />
    </header>
    <article>
      <h1>智能转售</h1>
      <p>打开摄像头，开始扫描商品</p>
      <p>iPhone微信有摄像头安全策略，请ios设备用户使用浏览器打开</p>
    </article>
    <fieldset>
      <legend>摄像头多目标识别</legend>
      <div v-if="errMessage">{{errMessage}}</div>
      <van-button v-if="isInit" type="primary" @click.stop="onLaunch">启动</van-button>
      <van-loading v-if="isLoading" type="spinner">模型加载中……({{fraction}})</van-loading>
      <div class="container">
        <div class="wrapper">
          <div class="labels">
            <div v-for="box in labels" class="label" :style="{transform: box.transform, width: box.width, height: box.height, borderColor:box.color}">
              <div class="text" :style="{color: box.color}">{{box.class}} {{box.percent}}</div>
            </div>
          </div>
          <video ref="webcam" autoplay playsinline muted class="webcam"></video>
        </div>
      </div>
    </fieldset>
    <fieldset>
      <legend>源码</legend>
      <ul>
        <li>
          <a href="https://gitee.com/thales-ucas/smarty-resale-vue.git" target="_blank">https://gitee.com/thales-ucas/smarty-resale-vue.git</a>
        </li>
        <li>
          <a href="https://github.com/thales-ucas/smarty-resale-vue.git" target="_blank">https://github.com/thales-ucas/smarty-resale-vue.git</a>
        </li>
      </ul>
    </fieldset>
    <fieldset>
      <legend>参考文献</legend>
      <h2><a href="https://arxiv.org/abs/1506.02640" target="_blank">You Only Look Once: Unified, Real-Time Object Detection</a></h2>
      <h3>
        <span class="descriptor">Authors:</span>
        <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Redmon%2C+J">Joseph Redmon</a>,
        <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Divvala%2C+S">Santosh Divvala</a>,
        <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Girshick%2C+R">Ross Girshick</a>,
        <a href="https://arxiv.org/search/cs?searchtype=author&amp;query=Farhadi%2C+A">Ali Farhadi</a>
      </h3>
      <p>We present YOLO, a new approach to object detection. Prior work on object detection repurposes classifiers to perform detection. Instead, we frame object detection as a regression problem to spatially separated bounding boxes and associated class probabilities. A single neural network predicts bounding boxes and class probabilities directly from full images in one evaluation. Since the whole detection pipeline is a single network, it can be optimized end-to-end directly on detection performance. </p>
      <p>Our unified architecture is extremely fast. Our base YOLO model processes images in real-time at 45 frames per second. A smaller version of the network, Fast YOLO, processes an astounding 155 frames per second while still achieving double the mAP of other real-time detectors. Compared to state-of-the-art detection systems, YOLO makes more localization errors but is far less likely to predict false detections where nothing exists. Finally, YOLO learns very general representations of objects. It outperforms all other detection methods, including DPM and R-CNN, by a wide margin when generalizing from natural images to artwork on both the Picasso Dataset and the People-Art Dataset. </p>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useYolo } from '@/store';
import '@/utils/user-media';
const store = useYolo();
const isInit = computed(() => store.isInit); // 初始状态
const isLoading = computed(() => store.isLoading); // 加载中
const fraction = computed(() => store.loadingPercent); // 加载百分比
const webcam = ref<HTMLVideoElement>(); // 摄像头视频
const errMessage = ref<string|null>(null) // 摄像头错误代码
const labels = computed(() => store.labels);
/**
 * 开始创建
 */
function onLaunch(e:MouseEvent) {
  store.load().then(res=> { // 加载模型
    store.start(); // 开始检测
  });
  // 打开摄像头
  navigator?.mediaDevices?.getUserMedia({
    'audio': false,
    'video': { facingMode: 'environment' }
  })
  .then(stream => {
    if(webcam.value) {
      if ("srcObject" in webcam.value) {
        webcam.value.srcObject = stream;
        errMessage.value = null;
      } else {
        // window.stream = stream;
        // webcam.value.src = window.URL.createObjectURL(stream);
        errMessage.value = 'srcObject属性缺失';
      }
    } else {
      errMessage.value = 'video元素不存在';
    }
  })
  .catch(err => {
    errMessage.value = err.message;
  }).finally(() => {
    window._hmt.push(['_trackEvent', 'video', errMessage.value?'fail':'success', errMessage.value]);
  });
}

onMounted(() => {
  if(webcam.value) store.init(webcam.value); // 摄像头初始化
});
</script>


<style lang="scss">
$width: 400px;
$maxWidth: 600px;
.ai989 {
  header {
    display: flex;
    justify-content: space-between;
    img {
      height: 5em;
    }
  }
  article {
    padding: 0 12px;
    h1 {
      text-align: center;
    }
  }
  .container {
    display: flex;
    justify-content: center;
    .wrapper {
      position: relative;
      margin: 0 auto;
      .labels {
        .label {
          position: absolute;
          border: 1px dashed;
          .text {
            font-size: 1em;
            padding: 5px;
            @media screen and (max-width: $maxWidth) {
              font-size: .8em;
            }
          }
        }
      }
      .webcam {
        background: url('@/assets/images/rob.jpg') no-repeat center center;
        background-size: contain;
        width: 100%;
        z-index: -100;
      }
    }
  }
}
</style>
