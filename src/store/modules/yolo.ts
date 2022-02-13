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
    colors: <any>{},
    scaleW: 0,
    scaleH: 0,
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
      boxes.forEach(box => {
        if (!(box['class'] in this.colors)) {
          this.colors[box['class']] = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
        box.transform = `translate(${box['top'] * this.scaleH}px, ${box['left'] * this.scaleW}px)`;
        box.width = `${box['width'] * this.scaleW - 4}px`;
        box.height = `${box['height'] * this.scaleH - 4}px`;    
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
      await objDetection.loadModel(MODELS['v3tiny']);
      this.status = MODEL_STATUS.ready;
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
     * 初始化
     */
    init(image:HTMLVideoElement) {
      const cw = image.clientWidth;
      const ch = image.clientHeight;
      const vw = image.videoWidth;
      const vh = image.videoHeight;
      this.scaleW = cw / vw;
      this.scaleH = ch / vh;
    
      objDetection.init();
    }
  }
});
export default useYolo;