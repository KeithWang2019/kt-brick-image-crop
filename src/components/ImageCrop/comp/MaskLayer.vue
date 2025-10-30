<template>
  <div class="kt-brick-mask-layer kt-brick-box-wh">
    <div class="mask-left-top" ref="maskLeftTopRef"></div>
    <div class="mask-top-right" ref="maskTopRight"></div>
    <div class="mask-right-bottom" ref="maskRightBottom"></div>
    <div class="mask-bottom-left" ref="maskBottomLeft"></div>
  </div>
</template>

<script lang="ts" setup>
import type { IPosition } from "../index.vue";

export interface IMaskLayer {
  init(src: string): Promise<void>;
  move(position: IPosition): Promise<void>;
}

const maskLeftTopRef = ref<HTMLDivElement>();
const maskTopRight = ref<HTMLDivElement>();
const maskRightBottom = ref<HTMLDivElement>();
const maskBottomLeft = ref<HTMLDivElement>();

class MaskLayer implements IMaskLayer {
  init(src: string): Promise<void> {
    return new Promise<void>((y) => {
      console.log(src);
      y();
    });
  }

  move(position: IPosition): Promise<void> {
    return new Promise<void>((y) => {
      maskLeftTopRef.value!.style.top = "0";
      maskLeftTopRef.value!.style.left = "0";
      maskLeftTopRef.value!.style.width = position.x2 + "px";
      maskLeftTopRef.value!.style.height = position.y2 + "px";

      maskTopRight.value!.style.top = "0";
      maskTopRight.value!.style.left = position.x2 + "px";
      maskTopRight.value!.style.width = position.boxWidth - position.x2 + "px";
      maskTopRight.value!.style.height = position.y3 + "px";

      maskRightBottom.value!.style.top = position.y4 + "px";
      maskRightBottom.value!.style.left = position.x4 + "px";
      maskRightBottom.value!.style.width = position.boxWidth - position.x4 + "px";
      maskRightBottom.value!.style.height = position.boxHeight - position.y4 + "px";

      maskBottomLeft.value!.style.top = position.y1 + "px";
      maskBottomLeft.value!.style.left = "0";
      maskBottomLeft.value!.style.width = position.x1 + "px";
      maskBottomLeft.value!.style.height = position.boxHeight - position.y1 + "px";
      y();
    });
  }
}

const maskLayer = new MaskLayer();

defineExpose<IMaskLayer>(maskLayer);
</script>

<style lang="scss">
.kt-brick-image-crop {
  .kt-brick-mask-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;

    .mask-left-top,
    .mask-top-right,
    .mask-right-bottom,
    .mask-bottom-left {
      position: absolute;
      will-change: top, left, height, width;
      background-color: #000;

      opacity: var(--v-overlay-opacity);
    }
  }
}
</style>
