import { GraphModel } from '@tensorflow/tfjs';

export const MODELS = { // 模型
  v3tiny: 'models/yolov3-tiny/model.json'
}
export type IModelsKey = keyof typeof MODELS; // 模型key
export interface IModelCache { // 模型缓存
  [porpName:string]:GraphModel;
}
