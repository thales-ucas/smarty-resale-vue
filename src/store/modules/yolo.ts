import { defineStore } from 'pinia';
import { MODELS } from '@/type/yolo';
import { ObjectDetection } from '@/utils/object-detection';
import { MODEL_STATUS } from '@/type/base';

const objDetection:ObjectDetection = new ObjectDetection(); // 多目标识别
/**
 * yolo数据
 */
const useYolo= defineStore({
  id: 'Yolo',
  state: () => ({
    status: MODEL_STATUS.none, // 状态
    fraction: 0.0, // 加载进度
    colors: <any>{},
    scaleW: 0,
    scaleH: 0,
    animateId: 0, // 动画id
    duration: 100, // 检测间隔
    expire: 100, // 期限
    image: <HTMLVideoElement>{},
    boxes: <any[]>[], // 框
    msg: <string>('') // 消息
  }),
  getters: {
    /**
     * 初始状态
     */
    isInit():boolean {
      return this.status === MODEL_STATUS.none || this.status === MODEL_STATUS.error;
    },
    /**
     * 加载中
     */
    isLoading(): boolean {
      return this.status === MODEL_STATUS.loading;
    },
    /**
     * 加载进度
     */
    loadingPercent(): string {
      return `${(this.fraction*100).toFixed(2)}%`;
    },
    /**
     * 执行中
     */
    isExecuting(): boolean {
      return this.status === MODEL_STATUS.executing;
    },
    /**
     * 序列化的标签
     */
    labels():any[] {
      const boxes = this.boxes;
      const cw = this.image.clientWidth;
      const ch = this.image.clientHeight;
      const vw = this.image.videoWidth;
      const vh = this.image.videoHeight;
      const scaleW = cw / vw;
      const scaleH = ch / vh;

      boxes.forEach(box => {
        if (!(box['class'] in this.colors)) {
          this.colors[box['class']] = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
        box.transform = `translate(${box['left'] * scaleW}px, ${box['top'] * scaleH}px)`;
        box.width = `${box['width'] * scaleW - 4}px`;
        box.height = `${box['height'] * scaleH - 4}px`;    
        box.color = this.colors[box['class']];
      })
      return boxes;
    },
    /**
     * 模型列表
     */
    models():any {
      return MODELS;
    }
  },
  actions: {
    /**
     * 加载模型(加载模型)
     */
    async load() {
      this.status = MODEL_STATUS.loading;
      await objDetection.loadModel(MODELS['v3tiny'], {onProgress:(fraction:number) => this.fraction = fraction});
      this.status = MODEL_STATUS.ready;
      return true;
    },
    /**
     * 检测(多目标识别)
     * @param image 要识别的图片
     */
    async detect(image:HTMLVideoElement) {
      this.status = MODEL_STATUS.executing;
      const cw = image.clientWidth;
      const ch = image.clientHeight;
      const vw = image.videoWidth;
      const vh = image.videoHeight;
      this.scaleW = cw / vw;
      this.scaleH = ch / vh;
      this.boxes = await objDetection.predict(image);
      this.status = MODEL_STATUS.ready;
    },
    /**
     * 检测开始
     * @param duration 间隔
     */
    start(duration:number = 100) {
      this.duration = duration;
      this.animateId = requestAnimationFrame( this.animate );
    },
    /**
     * 检测结束
     */
    stop() {
      cancelAnimationFrame(this.animateId);
    },
    /**
     * 检测动画
     * @param time 
     */
    animate() {
      const t = Date.now();
      if(t > this.expire) {
        objDetection.predict(this.image).then(boxex => {
          this.boxes = boxex;
          this.expire = Date.now() + this.duration;
          this.animateId = requestAnimationFrame( this.animate );
        });
      } else {
        this.animateId = requestAnimationFrame( this.animate );
      }
    },
    /**
     * 初始化
     */
    init(image:HTMLVideoElement) {
      this.image = image;
      objDetection.init();
    }
  }
});
export default useYolo;