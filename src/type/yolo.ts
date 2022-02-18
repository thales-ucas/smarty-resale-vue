import { GraphModel } from '@tensorflow/tfjs';

export interface IModelURL {
  path: string; // 本地地址
  indexedDB: string; // 浏览器储存
}
export const MODELS = { // 模型
  v3tiny: {
    path: 'models/yolov3-tiny/model.json',
    indexedDB: 'indexeddb://yolov3-tiny'
  }
}
export type IModelsKey = keyof typeof MODELS; // 模型key
export interface IModelCache { // 模型缓存
  [porpName:string]:GraphModel;
}
