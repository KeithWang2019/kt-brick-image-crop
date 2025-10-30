<template>
  <div class="kt-brick-move-layer kt-brick-box-wh" ref="moveLayerRef">
    <div ref="moveCrossRef" class="move-cross" @mousedown="moveLayer.handleDownCross" draggable="false">
      <canvas ref="moveCrossPreviewRef" class="move-cross-preview"></canvas>
    </div>
    <div
      ref="moveResizeArrayRef"
      v-for="index in [1, 2, 3, 4, 5, 6, 7, 8]"
      :key="index"
      :class="'resize-button resize-button-' + index"
      :data-index="index"
      draggable="false"
      @mousedown="moveLayer.handleDownResize"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import type { IPosition, KtAspectRatioType } from "../index.vue";
import ktTool from "kt-brick-tool";

export interface MoveDownInitData {
  clientX: number;
  clientY: number;
  boxHeight: number;
  boxWidth: number;
  moveDivHeight: number;
  moveDivWidth: number;
  moveDivLeft: number;
  moveDivTop: number;
}

export interface MoveParam {
  top: number;
  left: number;
  boxHeight: number;
  boxWidth: number;
  moveDivHeight: number;
  moveDivWidth: number;
}

export interface IMoveLayer {
  selectImage(image: HTMLImageElement): Promise<void>;
  move(moveParam: MoveParam): Promise<void>;
}

const props = defineProps<{
  aspectRatio: KtAspectRatioType;
}>();

const moveLayerRef = ref<HTMLDivElement>();
const moveCrossRef = ref<HTMLDivElement>();
const moveCrossPreviewRef = ref<HTMLCanvasElement>();
const moveResizeArrayRef = ref<Array<HTMLDivElement>>();

const emit = defineEmits<{
  (e: "onPosition", position: IPosition): void;
  (e: "onImage", dataURL: string): void;
  (e: "onCompleted", moveParam: MoveParam): void;
}>();

class MoveLayer implements IMoveLayer {
  isMoveHandle: boolean;
  numberResizeHandle: number;
  moveDownInitData: MoveDownInitData;
  handleDownCross: (e: MouseEvent) => void;
  handleMoveCross: (e: MouseEvent) => void;
  handleUpCross: (e: MouseEvent) => void;
  handleDownResize: (e: MouseEvent) => void;
  handleMoveResize: (e: MouseEvent) => void;
  handleUpResize: (e: MouseEvent) => void;
  idFrame: number;
  image: HTMLImageElement | null;
  newMoveParams: MoveParam | null;

  constructor() {
    this.isMoveHandle = false;
    this.numberResizeHandle = 0;
    this.moveDownInitData = {
      clientX: 0,
      clientY: 0,
      boxHeight: 0,
      boxWidth: 0,
      moveDivHeight: 0,
      moveDivWidth: 0,
      moveDivLeft: 0,
      moveDivTop: 0,
    };
    this.idFrame = 0;

    this.handleDownCross = (e: MouseEvent) => {
      this.mouseDownCross(e);
    };

    this.handleMoveCross = (e: MouseEvent) => {
      cancelAnimationFrame(this.idFrame);
      this.idFrame = requestAnimationFrame(() => {
        this.mouseMoveCross(e);
      });
    };

    this.handleUpCross = (e: MouseEvent) => {
      this.mouseUpCross(e);
    };

    this.handleDownResize = (e: MouseEvent) => {
      this.mouseDownResize(e);
    };

    this.handleMoveResize = (e: MouseEvent) => {
      this.mouseMoveResize(e);
    };

    this.handleUpResize = (e: MouseEvent) => {
      this.mouseUpResize(e);
    };

    this.image = null;
    this.newMoveParams = null;
  }

  selectImage(image: HTMLImageElement): Promise<void> {
    return new Promise<void>((y) => {
      this.image = image;
      y();
    });
  }

  move(moveParam: MoveParam): Promise<void> {
    return new Promise<void>((y) => {
      this.update(moveParam);
      y();
    });
  }

  getDownInitData(ev: MouseEvent) {
    this.moveDownInitData.clientX = ev.clientX;
    this.moveDownInitData.clientY = ev.clientY;
    this.moveDownInitData.boxHeight = moveLayerRef.value!.offsetHeight;
    this.moveDownInitData.boxWidth = moveLayerRef.value!.offsetWidth;
    this.moveDownInitData.moveDivHeight = moveCrossRef.value!.offsetHeight;
    this.moveDownInitData.moveDivWidth = moveCrossRef.value!.offsetWidth;
    this.moveDownInitData.moveDivLeft = moveCrossRef.value!.offsetLeft;
    this.moveDownInitData.moveDivTop = moveCrossRef.value!.offsetTop;
  }

  mouseDownCross(ev: MouseEvent) {
    this.getDownInitData(ev);
    this.isMoveHandle = true;
    this.numberResizeHandle = 0;
  }

  mouseDownResize(ev: MouseEvent) {
    this.getDownInitData(ev);
    this.isMoveHandle = false;
    moveCrossRef.value!.style.cursor = "default";
    const resizeButton = ev.target as HTMLDivElement;
    this.numberResizeHandle = parseInt(resizeButton.dataset.index!);
  }

  getBoxRange(boxRange: {
    left: number;
    top: number;
    boxHeight: number;
    boxWidth: number;
    moveDivHeight: number;
    moveDivWidth: number;
  }): IPosition {
    const x1 = boxRange.left;
    const y1 = boxRange.top;
    const x2 = x1 + boxRange.moveDivWidth;
    const y2 = y1;
    const x3 = x1 + boxRange.moveDivWidth;
    const y3 = y1 + boxRange.moveDivHeight;
    const x4 = x1;
    const y4 = y1 + boxRange.moveDivHeight;
    const boxHeight = boxRange.boxHeight;
    const boxWidth = boxRange.boxWidth;
    const moveDivHeight = boxRange.moveDivHeight;
    const moveDivWidth = boxRange.moveDivWidth;

    return {
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4,
      boxHeight,
      boxWidth,
      moveDivHeight,
      moveDivWidth,
    };
  }

  update(newParam: MoveParam) {
    if (this.moveRangeInit(newParam)) {
      const newBoxRange = this.getBoxRange(newParam);
      this.resizeButtonInit(newBoxRange);

      if (this.image != null) {
        this.drawImageToCanvas(this.image, moveCrossPreviewRef.value!, {
          top: newBoxRange.y1,
          left: newBoxRange.x1,
          height: newBoxRange.moveDivHeight,
          width: newBoxRange.moveDivWidth,
        });

        ktTool.throttle(
          "kt-cut-image",
          () => {
            const dataURL = moveCrossPreviewRef.value!.toDataURL("image/png", 0.8);

            emit("onImage", dataURL);
          },
          70
        );
      }

      emit("onPosition", newBoxRange);
    }
  }

  mouseMoveCross(ev: MouseEvent) {
    if (this.isMoveHandle) {
      const rangeTop = ev.clientY - this.moveDownInitData.clientY;
      const rangeLeft = ev.clientX - this.moveDownInitData.clientX;

      const newParam = {
        top: this.moveDownInitData.moveDivTop + rangeTop,
        left: this.moveDownInitData.moveDivLeft + rangeLeft,
        boxHeight: this.moveDownInitData.boxHeight,
        boxWidth: this.moveDownInitData.boxWidth,
        moveDivHeight: this.moveDownInitData.moveDivHeight,
        moveDivWidth: this.moveDownInitData.moveDivWidth,
      };

      this.update(newParam);
    }
  }

  mouseMoveResize(ev: MouseEvent) {
    if (this.numberResizeHandle > 0) {
      const rangeTopLeft = {
        rangeTop: ev.clientY - this.moveDownInitData.clientY,
        rangeLeft: ev.clientX - this.moveDownInitData.clientX,
      };

      let newParam: MoveParam | null = null;

      switch (this.numberResizeHandle) {
        case 1:
          newParam = {
            top: this.moveDownInitData.moveDivTop + rangeTopLeft.rangeTop,
            left: this.moveDownInitData.moveDivLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight - rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth,
          };
          break;
        case 2:
          newParam = {
            top: this.moveDownInitData.moveDivTop + rangeTopLeft.rangeTop,
            left: this.moveDownInitData.moveDivLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight - rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth + rangeTopLeft.rangeLeft,
          };
          break;
        case 3:
          newParam = {
            top: this.moveDownInitData.moveDivTop,
            left: this.moveDownInitData.moveDivLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight,
            moveDivWidth: this.moveDownInitData.moveDivWidth + rangeTopLeft.rangeLeft,
          };
          break;
        case 4:
          newParam = {
            top: this.moveDownInitData.moveDivTop,
            left: this.moveDownInitData.moveDivLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight + rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth + rangeTopLeft.rangeLeft,
          };
          break;
        case 5:
          newParam = {
            top: this.moveDownInitData.moveDivTop,
            left: this.moveDownInitData.moveDivLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight + rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth,
          };
          break;
        case 6:
          newParam = {
            top: this.moveDownInitData.moveDivTop,
            left: this.moveDownInitData.moveDivLeft + rangeTopLeft.rangeLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight + rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth - rangeTopLeft.rangeLeft,
          };
          break;
        case 7:
          newParam = {
            top: this.moveDownInitData.moveDivTop,
            left: this.moveDownInitData.moveDivLeft + rangeTopLeft.rangeLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight,
            moveDivWidth: this.moveDownInitData.moveDivWidth - rangeTopLeft.rangeLeft,
          };
          break;
        case 8:
          newParam = {
            top: this.moveDownInitData.moveDivTop + rangeTopLeft.rangeTop,
            left: this.moveDownInitData.moveDivLeft + rangeTopLeft.rangeLeft,
            boxHeight: this.moveDownInitData.boxHeight,
            boxWidth: this.moveDownInitData.boxWidth,
            moveDivHeight: this.moveDownInitData.moveDivHeight - rangeTopLeft.rangeTop,
            moveDivWidth: this.moveDownInitData.moveDivWidth - rangeTopLeft.rangeLeft,
          };
          break;
      }

      this.update(newParam!);
    }
  }

  compareFourElement(newParam: MoveParam): boolean {
    switch (props.aspectRatio) {
      case "free":
        if (!this.limitWidthHeight(newParam)) {
          return false;
        }
        break;
      case "16:9":
        if (!this.limitWidthHeight(newParam, { width: 16, height: 9 })) {
          return false;
        }
        break;
      case "1:1":
        if (!this.limitWidthHeight(newParam, { width: 1, height: 1 })) {
          return false;
        }
        break;
      case "3:4":
        if (!this.limitWidthHeight(newParam, { width: 3, height: 4 })) {
          return false;
        }
        break;
      case "4:3":
        if (!this.limitWidthHeight(newParam, { width: 4, height: 3 })) {
          return false;
        }
        break;
      case "9:16":
        if (!this.limitWidthHeight(newParam, { width: 9, height: 16 })) {
          return false;
        }
        break;
    }

    return true;
  }

  limitWidthHeight(
    newParam: MoveParam,
    aspectRatio: {
      width: number;
      height: number;
    } | null = null
  ): boolean {
    if (this.numberResizeHandle) {
      let top = 0;
      let left = 0;
      let width = 0;
      let height = 0;

      const oldTop = newParam.top;
      const oldLeft = newParam.left;
      const oldWidth = newParam.moveDivWidth;
      const oldHeight = newParam.moveDivHeight;

      let maxWidth = 0;
      let maxHeight = 0;

      switch (this.numberResizeHandle) {
        case 1:
          maxHeight = newParam.moveDivHeight + newParam.top;
          maxWidth = newParam.moveDivWidth;

          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
        case 2:
          maxWidth = newParam.boxWidth - newParam.left;
          maxHeight = newParam.moveDivHeight + newParam.top;

          if (newParam.moveDivWidth < 20) {
            newParam.moveDivWidth = 20;
          }
          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
        case 3:
          maxWidth = newParam.boxWidth - newParam.left;
          maxHeight = newParam.moveDivHeight;

          if (newParam.moveDivWidth < 20) {
            newParam.moveDivWidth = 20;
          }
          break;
        case 4:
          maxWidth = newParam.boxWidth - newParam.left;
          maxHeight = newParam.boxHeight - newParam.top;

          if (newParam.moveDivWidth < 20) {
            newParam.moveDivWidth = 20;
          }
          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
        case 5:
          maxHeight = newParam.boxHeight - newParam.top;
          maxWidth = newParam.moveDivWidth;

          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
        case 6:
          maxWidth = newParam.moveDivWidth + newParam.left;
          maxHeight = newParam.boxHeight - newParam.top;

          if (newParam.moveDivWidth < 20) {
            newParam.left = newParam.left + newParam.moveDivWidth - 20;
            newParam.moveDivWidth = 20;
          }
          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
        case 7:
          maxWidth = newParam.moveDivWidth + newParam.left;
          maxHeight = newParam.moveDivHeight;

          if (newParam.moveDivWidth < 20) {
            newParam.left = newParam.left + newParam.moveDivWidth - 20;
            newParam.moveDivWidth = 20;
          }
          break;
        case 8:
          maxWidth = newParam.moveDivWidth + newParam.left;
          maxHeight = newParam.moveDivHeight + newParam.top;

          if (newParam.moveDivWidth < 20) {
            newParam.left = newParam.left + newParam.moveDivWidth - 20;
            newParam.moveDivWidth = 20;
          }
          if (newParam.moveDivHeight < 20) {
            newParam.moveDivHeight = 20;
          }
          break;
      }

      if (aspectRatio != null) {
        width = newParam.moveDivWidth;
        height = this.parseIntValue((newParam.moveDivWidth / aspectRatio.width) * aspectRatio.height);

        if (width >= maxWidth && height < maxHeight) {
          // 宽超了，高没有超，使用最大宽度确定大小
          width = maxWidth;
          height = this.parseIntValue((maxWidth / aspectRatio.width) * aspectRatio.height);
        } else if (height >= maxHeight && width < maxWidth) {
          // 高超了，宽没有超，使用最大高度确定大小
          height = maxHeight;
          width = this.parseIntValue((maxHeight / aspectRatio.height) * aspectRatio.width);
        } else if (height >= maxHeight && width >= maxWidth) {
          // 长宽都超了
          if ((maxWidth / aspectRatio.width) * aspectRatio.height > maxHeight) {
            // 判断最大长和最大高哪个更大，选择小的那个确定大小
            width = this.parseIntValue((maxHeight / aspectRatio.height) * aspectRatio.width);
            height = maxHeight;
          } else {
            height = this.parseIntValue((maxWidth / aspectRatio.width) * aspectRatio.height);
            width = maxWidth;
          }
        }
      } else {
        width = newParam.moveDivWidth;
        height = newParam.moveDivHeight;

        if (width >= maxWidth) {
          // 宽超了，高没有超，使用最大宽度确定大小
          width = maxWidth;
        }
        if (height >= maxHeight) {
          // 高超了，宽没有超，使用最大高度确定大小
          height = maxHeight;
        }
      }

      switch (this.numberResizeHandle) {
        case 1:
          top = oldHeight - height + oldTop;
          left = oldLeft;
          break;
        case 2:
          top = oldHeight - height + oldTop;
          left = oldLeft;
          break;
        case 3:
          top = oldHeight - height + oldTop;
          left = oldLeft;
          break;
        case 4:
          top = oldTop;
          left = oldLeft;
          break;
        case 5:
          top = oldTop;
          left = oldLeft;
          break;
        case 6:
          top = oldTop;
          left = oldWidth - width + oldLeft;
          break;
        case 7:
          top = oldTop;
          left = oldWidth - width + oldLeft;
          break;
        case 8:
          top = oldHeight - height + oldTop;
          left = oldWidth - width + oldLeft;
          break;
      }

      newParam.top = top;
      newParam.left = left;
      newParam.moveDivWidth = width;
      newParam.moveDivHeight = height;
    }

    if (newParam.top < 0) {
      newParam.top = 0;
    }
    if (newParam.left < 0) {
      newParam.left = 0;
    }
    if (newParam.top + newParam.moveDivHeight > newParam.boxHeight) {
      newParam.top = newParam.boxHeight - newParam.moveDivHeight;
    }
    if (newParam.left + newParam.moveDivWidth > newParam.boxWidth) {
      newParam.left = newParam.boxWidth - newParam.moveDivWidth;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseUpCross(ev: MouseEvent) {
    this.isMoveHandle = false;
    this.numberResizeHandle = 0;

    if (this.image != null) {
      // const dataURL = moveCrossPreviewRef.value!.toDataURL("image/png", 0.8);
      moveCrossPreviewRef.value!.toBlob(
        (blob) => {
          // Blob 可直接用于下载、上传或预览
          const url = URL.createObjectURL(blob!);
          // const a = document.createElement("a");
          // a.href = url;
          // a.download = "compressed.png";
          // a.click();
          // URL.revokeObjectURL(url); // 释放内存
          emit("onImage", url);
        },
        "image/png",
        0.9
      );

      emit("onCompleted", this.newMoveParams!);
      // emit("onImage", dataURL);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseUpResize(ev: MouseEvent) {
    this.isMoveHandle = false;
    moveCrossRef.value!.style.cursor = "move";
    this.numberResizeHandle = 0;

    if (this.image != null) {
      const dataURL = moveCrossPreviewRef.value!.toDataURL("image/png", 0.8);
      emit("onImage", dataURL);
      emit("onCompleted", this.newMoveParams!);
    }
  }

  moveRangeInit(newParam: {
    top: number;
    left: number;
    boxHeight: number;
    boxWidth: number;
    moveDivHeight: number;
    moveDivWidth: number;
  }): boolean {
    // 计算top left width height四要素，里面禁止读取dom的图形信息，避免重排的性能损失
    if (!this.compareFourElement(newParam)) {
      return false;
    }

    // 在这里统一设置四要素，禁止其它地方设置
    moveCrossRef.value!.style.top = newParam.top + "px";
    moveCrossRef.value!.style.left = newParam.left + "px";
    moveCrossRef.value!.style.height = newParam.moveDivHeight + "px";
    moveCrossRef.value!.style.width = newParam.moveDivWidth + "px";
    return true;
  }

  resizeButtonInit(position: IPosition) {
    // 设置按钮
    for (let i = 1; i <= 8; i++) {
      switch (i) {
        case 1:
          if (props.aspectRatio != "free") {
            moveResizeArrayRef.value![i - 1]!.style.display = "none";
          } else {
            moveResizeArrayRef.value![i - 1]!.style.top = position.y1 + "px";
            moveResizeArrayRef.value![i - 1]!.style.left = this.parseIntValue((position.x2 + position.x1) / 2) + "px";
          }
          break;
        case 2:
          moveResizeArrayRef.value![i - 1]!.style.top = position.y2 + "px";
          moveResizeArrayRef.value![i - 1]!.style.left = position.x2 + "px";
          break;
        case 3:
          if (props.aspectRatio != "free") {
            moveResizeArrayRef.value![i - 1]!.style.display = "none";
          } else {
            moveResizeArrayRef.value![i - 1]!.style.top = this.parseIntValue((position.y2 + position.y3) / 2) + "px";
            moveResizeArrayRef.value![i - 1]!.style.left = position.x2 + "px";
          }
          break;
        case 4:
          moveResizeArrayRef.value![i - 1]!.style.top = position.y3 + "px";
          moveResizeArrayRef.value![i - 1]!.style.left = position.x3 + "px";
          break;
        case 5:
          if (props.aspectRatio != "free") {
            moveResizeArrayRef.value![i - 1]!.style.display = "none";
          } else {
            moveResizeArrayRef.value![i - 1]!.style.top = position.y3 + "px";
            moveResizeArrayRef.value![i - 1]!.style.left = this.parseIntValue((position.x3 + position.x4) / 2) + "px";
          }
          break;
        case 6:
          moveResizeArrayRef.value![i - 1]!.style.top = position.y4 + "px";
          moveResizeArrayRef.value![i - 1]!.style.left = position.x4 + "px";
          break;
        case 7:
          if (props.aspectRatio != "free") {
            moveResizeArrayRef.value![i - 1]!.style.display = "none";
          } else {
            moveResizeArrayRef.value![i - 1]!.style.top = this.parseIntValue((position.y4 + position.y1) / 2) + "px";
            moveResizeArrayRef.value![i - 1]!.style.left = position.x4 + "px";
          }
          break;
        case 8:
          moveResizeArrayRef.value![i - 1]!.style.top = position.y1 + "px";
          moveResizeArrayRef.value![i - 1]!.style.left = position.x1 + "px";
          break;
      }
    }
  }

  calculateGraphicInfo(
    imageInfo: {
      naturalWidth: number;
      naturalHeight: number;
      width: number;
      height: number;
    },
    selectRangeInfo: {
      top: number;
      left: number;
      height: number;
      width: number;
    }
  ): {
    sl: number;
    st: number;
    sw: number;
    sh: number;
  } {
    const naturalRange = {
      width: imageInfo.naturalWidth,
      height: imageInfo.naturalHeight,
      pWidth: 0,
      pHeight: 0,
    };

    const boxRange = {
      width: imageInfo.width,
      height: imageInfo.height,
    };

    // 图片的实际高度naturalRange.height对应box的比例的实际宽度nWidth
    const nWidth = this.parseIntValue((naturalRange.height * boxRange.width) / boxRange.height);
    // 不能比较图片实际的长、宽哪个大，这样计算的话相当于使用了box 1：1的情况，需要通过上面的方法转换为同等比例宽度
    if (naturalRange.width > nWidth) {
      naturalRange.pWidth = naturalRange.width;
      naturalRange.pHeight = this.parseIntValue((naturalRange.width * boxRange.height) / boxRange.width);
    } else {
      naturalRange.pHeight = naturalRange.height;
      naturalRange.pWidth = nWidth;
    }

    // 将box坐标映射到图片上，需要减去两边的空白，让图片剧中
    const sl = this.parseIntValue(
      (naturalRange.pWidth * selectRangeInfo.left) / boxRange.width - (naturalRange.pWidth - naturalRange.width) / 2
    );
    const st = this.parseIntValue(
      (naturalRange.pHeight * selectRangeInfo.top) / boxRange.height - (naturalRange.pHeight - naturalRange.height) / 2
    );

    const sw = this.parseIntValue((selectRangeInfo.width * naturalRange.pWidth) / boxRange.width);
    const sh = this.parseIntValue((selectRangeInfo.height * naturalRange.pHeight) / boxRange.height);

    return {
      sl,
      st,
      sw,
      sh,
    };
  }

  // 绘制图片到Canvas
  drawImageToCanvas(
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    selectRange: {
      top: number;
      left: number;
      height: number;
      width: number;
    }
  ) {
    const graphicInfo = this.calculateGraphicInfo(
      {
        naturalHeight: img.naturalHeight,
        naturalWidth: img.naturalWidth,
        width: img.width,
        height: img.height,
      },
      selectRange
    );

    // 获取设备像素比
    // const dpr = window.devicePixelRatio || 1;

    canvas.width = graphicInfo.sw;
    canvas.height = graphicInfo.sh;

    const ctx = canvas.getContext("2d")!;

    // 清除并绘制图片
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, graphicInfo.sl, graphicInfo.st, graphicInfo.sw, graphicInfo.sh, 0, 0, canvas.width, canvas.height);

    this.newMoveParams = {
      top: graphicInfo.st,
      left: graphicInfo.sl,
      moveDivWidth: graphicInfo.sw,
      moveDivHeight: graphicInfo.sh,
      boxWidth: canvas.width,
      boxHeight: canvas.height,
    };
    // ctx.scale(dpr, dpr);
  }

  mounted(): Promise<void> {
    return new Promise<void>((y) => {
      document.addEventListener("mousemove", this.handleMoveCross, false);
      document.addEventListener("mouseup", this.handleUpCross, false);
      document.addEventListener("mousemove", this.handleMoveResize, false);
      document.addEventListener("mouseup", this.handleUpResize, false);
      y();
    });
  }

  parseIntValue(val: number) {
    // return Math.round(val);
    return val;
  }

  unMounted(): Promise<void> {
    return new Promise<void>((y) => {
      document.removeEventListener("mousemove", this.handleMoveCross, false);
      document.removeEventListener("mouseup", this.handleUpCross, false);
      document.removeEventListener("mousemove", this.handleMoveResize, false);
      document.removeEventListener("mouseup", this.handleUpResize, false);
      y();
    });
  }
}

const moveLayer = new MoveLayer();

onMounted(() => {
  moveLayer.mounted();
});

onBeforeUnmount(() => {
  moveLayer.unMounted();
});

defineExpose<IMoveLayer>(moveLayer);
</script>

<style lang="scss">
.kt-brick-image-crop {
  .kt-brick-move-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 4;
    transform: translate3d(0, 0, 0);

    .move-cross {
      position: absolute;
      width: 60px;
      height: 30px;
      cursor: move;
      user-select: none;

      // background-color: red;
      // opacity: 0.5;

      will-change: top, left, height, width;

      .move-cross-preview {
        width: 100%;
        height: 100%;

        visibility: hidden;
      }
    }

    .resize-button {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: red;
      margin-top: -3px;
      margin-left: -3px;
      background-color: #301af7;
      opacity: 0.8;
      will-change: left, top;
      user-select: none;

      &:hover {
        opacity: 1;
        background-color: #d87373;
      }
    }

    .resize-button-1 {
      cursor: n-resize;
    }

    .resize-button-2 {
      cursor: ne-resize;
    }

    .resize-button-3 {
      cursor: w-resize;
    }

    .resize-button-4 {
      cursor: se-resize;
    }

    .resize-button-5 {
      cursor: s-resize;
    }

    .resize-button-6 {
      cursor: sw-resize;
    }

    .resize-button-7 {
      cursor: w-resize;
    }

    .resize-button-8 {
      cursor: nw-resize;
    }
  }
}
</style>
