<template>
  <div class="kt-brick-line-layer kt-brick-box-wh">
    <div ref="lineLayerArrayRef" v-for="index in [1, 2, 3, 4]" :key="index" :class="'box-line box-line-' + index"></div>
  </div>
</template>

<script lang="ts" setup>
import type { IPosition } from "../index.vue";

export interface ILineLayer {
  init(src: string): Promise<void>;
  move(position: IPosition): Promise<void>;
}

const lineLayerArrayRef = ref<Array<HTMLDivElement>>();

class LineLayer implements ILineLayer {
  init(src: string): Promise<void> {
    return new Promise<void>((y) => {
      console.log(src);
      y();
    });
  }
  move(position: IPosition): Promise<void> {
    return new Promise<void>((y) => {
      for (let i = 1; i <= 4; i++) {
        switch (i) {
          case 1:
            lineLayerArrayRef.value![i - 1]!.style.left = position.x1 + "px";
            break;
          case 2:
            lineLayerArrayRef.value![i - 1]!.style.left = position.x2 + "px";
            break;
          case 3:
            lineLayerArrayRef.value![i - 1]!.style.top = position.y1 + "px";
            break;
          case 4:
            lineLayerArrayRef.value![i - 1]!.style.top = position.y4 + "px";
            break;
        }
      }
      y();
    });
  }
}

const lineLayer = new LineLayer();

defineExpose<LineLayer>(lineLayer);
</script>

<style lang="scss">
.kt-brick-image-crop {
  .kt-brick-line-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;

    .box-line {
      position: absolute;
      will-change: left, top;
    }

    .box-line-1 {
      width: 0;
      height: 100%;
      border-left: 1px dashed #fff;
    }

    .box-line-2 {
      width: 0;
      height: 100%;
      border-left: 1px dashed #fff;
    }

    .box-line-3 {
      width: 100%;
      height: 0;
      border-top: 1px dashed #fff;
    }

    .box-line-4 {
      width: 100%;
      height: 0;
      border-top: 1px dashed #fff;
    }
  }
}
</style>
