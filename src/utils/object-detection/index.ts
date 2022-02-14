import * as tf from '@tensorflow/tfjs';
import { v3_tiny_anchors, v3_masks, coco_classes, } from './config';
/**
 * 多目标识别
 */
export class ObjectDetection {
  model: tf.GraphModel|tf.LayersModel|undefined;
  canvas = document.createElement('canvas');
  params = {
    maxBoxes: 20, // 最大框数
    scoreThreshold: 0.2, // 显示门槛
    iouThreshold: 0.3, // 识别门槛
    inputSize: 416, // 输入尺寸
    numClasses: coco_classes.length, //识别类数
    classNames: coco_classes, // 分类
    anchors: v3_tiny_anchors // 识别种类
  }; // 参数
  msg:string;
  constructor() {
    this.msg = 'start';
  }
  /**
   * 读取模型
   */
  async init() {
    
  }
  /**
   * 加载模型
   * @param url 模型json地址
   * @returns 模型
   */
  async loadModel(url:string, options?:any) {
    this.model= await tf.loadLayersModel(url, options);
    return this.model;
  }
  /**
   * 预测
   * @param image 图片
   * @returns 具体数据
   */
  async predict(image:HTMLVideoElement) {
    let outputs = tf.tidy(() => {
      this.canvas.width = this.params.inputSize;
      this.canvas.height = this.params.inputSize;
      const ctx = this.canvas.getContext('2d');
      ctx?.drawImage(image, 0, 0, this.params.inputSize, this.params.inputSize);

      let imageTensor = tf.browser.fromPixels(this.canvas, 3);
      imageTensor = imageTensor.expandDims(0).toFloat().div(tf.scalar(255));
  
      const outputs = this.model?.predict(imageTensor);
      return outputs;
    });
    // console.log(123, outputs[0].shape);
    const boxes = await this.postprocess(outputs, [image.videoHeight||image.height, image.videoWidth||image.width]);
  
    tf.dispose(outputs);
    // console.log(boxes);
    return boxes;
  }


  async postprocess(outputs:any, imageShape:[number, number]) {
    const [boxes, boxScores] = this.yoloEval(outputs, imageShape);

    let boxes_:any = [];
    let scores_:any = [];
    let classes_:any = [];

    const _classes = tf.argMax(boxScores, -1);
    const _boxScores = tf.max(boxScores, -1);

    const nmsIndex = await tf.image.nonMaxSuppressionAsync(
      boxes,
      _boxScores,
      this.params.maxBoxes,
      this.params.iouThreshold,
      this.params.scoreThreshold
    );

    if (nmsIndex.size) {
      tf.tidy(() => {
        const classBoxes = tf.gather(boxes, nmsIndex);
        const classBoxScores = tf.gather(_boxScores, nmsIndex);

        classBoxes.split(nmsIndex.size).map(box => {
          boxes_.push(box.dataSync());
        });
        classBoxScores.dataSync().map(score => {
          scores_.push(score);
        });
        classes_ = _classes.gather(nmsIndex).dataSync();
      });
    }
    _boxScores.dispose();
    _classes.dispose();
    nmsIndex.dispose();

    boxes.dispose();
    boxScores.dispose();

    return boxes_.map((box:any, i:any) => {
      const top = Math.max(0, box[0]);
      const left = Math.max(0, box[1]);
      const bottom = Math.min(imageShape[0], box[2]);
      const right = Math.min(imageShape[1], box[3]);
      const height = bottom - top;
      const width = right - left;
      return {
        top,
        left,
        bottom,
        right,
        height,
        width,
        score: scores_[i],
        class: this.params.classNames[classes_[i]]
      }
    });
  }
  yoloEval(outputs:any, imageShape:[number, number]) {
    return tf.tidy(() => {
      let numLayers = 1;
      let inputShape;
      let anchorMask;
  
      numLayers = outputs.length;
      anchorMask = v3_masks[numLayers];
      inputShape = outputs[0].shape.slice(1, 3).map(num => num * 32);
  
      const anchorsTensor = tf.tensor1d(this.params.anchors).reshape([-1, 2]);
      let boxes = [];
      let boxScores = [];
  
      for (let i = 0; i < numLayers; i++) {
        const [_boxes, _boxScores] = this.yoloBoxesAndScores(
          outputs[i],
          anchorsTensor.gather(tf.tensor1d(anchorMask[i], 'int32')),
          inputShape,
          imageShape
        );
  
        boxes.push(_boxes);
        boxScores.push(_boxScores);
      };
  
      boxes = tf.concat(boxes);
      boxScores = tf.concat(boxScores);
  
      return [boxes, boxScores];
    });
  }
  yoloBoxesAndScores(feats:any,anchors:any, inputShape:any, imageShape:[number, number]) {
    const [boxXy, boxWh, boxConfidence, boxClassProbs] = this.yoloHead(feats, anchors, inputShape);
  
    let boxes = this.yoloCorrectBoxes(boxXy, boxWh, imageShape);
    boxes = boxes.reshape([-1, 4]);
    let boxScores = tf.mul(boxConfidence, boxClassProbs);
    boxScores = tf.reshape(boxScores, [-1, this.params.numClasses]);
  
    return [boxes, boxScores];
  }
  yoloHead(feats:any, anchors:any, inputShape:any) {
    const numAnchors = anchors.shape[0];
    // Reshape to height, width, num_anchors, box_params.
    const anchorsTensor = tf.reshape(anchors, [1, 1, numAnchors, 2]);
  
    const gridShape = feats.shape.slice(1, 3); // height, width
  
    const gridY = tf.tile(tf.reshape(tf.range(0, gridShape[0]), [-1, 1, 1, 1]), [1, gridShape[1], 1, 1]);
    const gridX = tf.tile(tf.reshape(tf.range(0, gridShape[1]), [1, -1, 1, 1]), [gridShape[0], 1, 1, 1]);
    const grid = tf.concat([gridX, gridY], 3).cast(feats.dtype);
  
    feats = feats.reshape([gridShape[0], gridShape[1], numAnchors, this.params.numClasses + 5]);
  
    const [xy, wh, con, probs] = tf.split(feats, [2, 2, 1, this.params.numClasses], 3);
    // Adjust preditions to each spatial grid point and anchor size.
    const boxXy = tf.div(tf.add(tf.sigmoid(xy), grid), gridShape.reverse());
    const boxWh = tf.div(tf.mul(tf.exp(wh), anchorsTensor), inputShape.reverse());
    const boxConfidence = tf.sigmoid(con);
  
    let boxClassProbs;
    boxClassProbs = tf.sigmoid(probs);
  
    return [boxXy, boxWh, boxConfidence, boxClassProbs];
  }
  yoloCorrectBoxes(boxXy:any, boxWh:any, imageShape:[number, number]) {
    let boxYx = tf.concat(tf.split(boxXy, 2, 3).reverse(), 3);
    let boxHw = tf.concat(tf.split(boxWh, 2, 3).reverse(), 3);
  
    // Scale boxes back to original image shape.
    const boxMins = tf.mul(tf.sub(boxYx, tf.div(boxHw, 2)), imageShape);
    const boxMaxes = tf.mul(tf.add(boxYx, tf.div(boxHw, 2)), imageShape);
  
    const boxes = tf.concat([
      ...tf.split(boxMins, 2, 3),
      ...tf.split(boxMaxes, 2, 3)
    ], 3);
  
    return boxes;
  }
}