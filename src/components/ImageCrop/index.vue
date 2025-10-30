<template>
  <div class="kt-brick-image-crop">
    <div class="kt-brick-box-align">
      <div ref="boxRef" class="kt-left-box kt-brick-box-wh" draggable="false">
        <BackLayer ref="backLayerRef" @image-loaded="(val) => uploadImageCut.handleMoveImageLoaded(val)"></BackLayer>
        <MaskLayer ref="maskLayerRef"></MaskLayer>
        <LineLayer ref="lineLayerRef"></LineLayer>
        <MoveLayer
          ref="moveLayerRef"
          @on-position="(val) => uploadImageCut.handleMoveLayerPosition(val)"
          @on-image="uploadImageCut.handleMoveLayerImage"
          @on-completed="(val) => uploadImageCut.handleMoveCompleted(val)"
          :aspect-ratio="props.aspectRatio"
        ></MoveLayer>
      </div>
    </div>
    <div class="kt-brick-box-align">
      <div class="kt-right-box kt-brick-box-wh" draggable="false">
        <img ref="previewRef" class="kt-brick-box-wh kt-preview" draggable="false" />
      </div>
    </div>
  </div>

  <input type="file" ref="inputImageRef" accept="image/*" @change="(ev) => uploadImageCut.handleImageSelect(ev)" style="display: none" />
</template>
<script lang="ts" setup>
import BackLayer, { type IBackLayer } from "./comp/BackLayer.vue";
import MaskLayer, { type IMaskLayer } from "./comp/MaskLayer.vue";
import LineLayer, { type ILineLayer } from "./comp/LineLayer.vue";
import MoveLayer, { type IMoveLayer, type MoveParam } from "./comp/MoveLayer.vue";

// 导入工厂函数
import { initWasm, downloadImage } from "kt-brick-image";

export interface IResult {
  success: boolean;
  size: number;
  error: string;
  /**
   * 结果图片数据
   */
  data: Uint8Array<ArrayBuffer>;
  format: string;
}

export interface IPosition {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  moveDivHeight: number;
  moveDivWidth: number;
  boxHeight: number;
  boxWidth: number;
}

export interface IKtBrickImageCrop {
  imageSelect(): void;
  completedImage(): Promise<IResult>;
}

export type KtAspectRatioType = "free" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";

const props = defineProps<{
  aspectRatio: KtAspectRatioType;
}>();

const boxRef = ref<HTMLDivElement>();
const backLayerRef = ref<IBackLayer>();
const maskLayerRef = ref<IMaskLayer>();
const lineLayerRef = ref<ILineLayer>();
const moveLayerRef = ref<IMoveLayer>();
const inputImageRef = ref<HTMLDivElement>();
const previewRef = ref<HTMLImageElement>();

class KtBrickImageCrop implements IKtBrickImageCrop {
  currentFile: ArrayBuffer | null;
  moveParam: MoveParam | null;

  constructor() {
    this.currentFile = null;
    this.moveParam = null;
  }

  imageSelect() {
    inputImageRef.value?.click();
  }

  // 处理图片选择
  handleImageSelect(e: Event) {
    const input = e.target as HTMLInputElement;

    const file = input.files![0];
    if (!file) return;

    // 显示文件信息
    console.log(`已选择: ${file.name} (${file.size})`);

    // 读取图片文件
    const reader = new FileReader();
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const result = event.target;
      backLayerRef.value?.init(result?.result as string);
    };
    reader.readAsDataURL(file);

    file.arrayBuffer().then((arrayBuffer) => {
      this.currentFile = arrayBuffer;
    });
  }

  handleMoveLayerPosition(position: IPosition) {
    maskLayerRef.value!.move(position);
    lineLayerRef.value!.move(position);
  }

  handleMoveCompleted(moveParam: MoveParam) {
    this.moveParam = moveParam;
  }

  handleMoveImageLoaded(val: HTMLImageElement) {
    moveLayerRef.value!.selectImage(val);
    this.moveCenter();
  }

  handleMoveLayerImage(dataUrl: string) {
    previewRef.value!.style.display = "block";
    previewRef.value!.src = dataUrl;
  }

  completedImage(): Promise<IResult> {
    return new Promise<IResult>((y, n) => {
      initWasm().then((intance) => {
        console.log(intance.ImageCompressor.hi());
        if (this.currentFile != null && this.moveParam != null) {
          const uint8Array = new Uint8Array(this.currentFile!);

          let top = 0;
          let left = 0;
          let height = this.moveParam.moveDivHeight;
          let width = this.moveParam.moveDivWidth;

          if (this.moveParam.top > 0) {
            top = this.moveParam.top;
          } else {
            height = this.moveParam.moveDivHeight + this.moveParam.top;
          }
          if (this.moveParam.left > 0) {
            left = this.moveParam.left;
          } else {
            width = this.moveParam.moveDivWidth + this.moveParam.left;
          }

          const result = intance.ImageCompressor.crop(uint8Array, top, left, height, width);

          y(result);
        }
      });
    });
  }

  moveCenter(): { top: number; left: number } {
    const width = boxRef.value!.offsetWidth;
    const height = boxRef.value!.offsetHeight;

    let moveDivWidth = 120;
    let moveDivHeight = 90;

    switch (props.aspectRatio) {
      case "free":
        break;
      case "16:9":
        moveDivWidth = 160;
        moveDivHeight = 90;
        break;
      case "1:1":
        moveDivWidth = 100;
        moveDivHeight = 100;
        break;
      case "3:4":
        moveDivWidth = 90;
        moveDivHeight = 120;
        break;
      case "4:3":
        moveDivWidth = 120;
        moveDivHeight = 90;
        break;
      case "9:16":
        moveDivWidth = 90;
        moveDivHeight = 160;
        break;
    }

    const top = (height - moveDivHeight) / 2;
    const left = (width - moveDivWidth) / 2;

    moveLayerRef.value!.move({
      top,
      left,
      boxHeight: height,
      boxWidth: width,
      moveDivHeight,
      moveDivWidth,
    });

    return { top, left };
  }
}

const uploadImageCut = new KtBrickImageCrop();

onMounted(() => {
  uploadImageCut.moveCenter();
});

defineExpose<IKtBrickImageCrop>(uploadImageCut);
</script>
<style lang="scss">
.kt-brick-image-crop {
  user-select: none;
  display: flex;
  flex-direction: row;

  .kt-brick-box-align {
    display: flex;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .kt-brick-box-wh {
    width: 400px !important;
    height: 300px !important;
  }

  .kt-left-box {
    transform: translate3d(0, 0, 0);
    position: relative;
  }

  .kt-right-box {
    background-color: rgb(228, 228, 236);

    .kt-preview {
      position: relative;
      object-fit: contain;
      display: none;

      background-image: repeating-conic-gradient(
        rgb(204, 204, 204) 0deg,
        rgb(204, 204, 204) 25%,
        rgb(255, 255, 255) 0deg,
        rgb(255, 255, 255) 50%
      );
      background-position: 0px 0px, 0.5rem 0.5rem;
      background-size: 1rem 1rem;
      background-repeat: repeat;
    }
  }
}
</style>
