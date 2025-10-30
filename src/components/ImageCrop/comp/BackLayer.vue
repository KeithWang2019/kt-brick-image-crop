<template>
  <div class="kt-brick-back-layer kt-brick-box-wh">
    <img ref="backImageRef" class="back-image" @load="backLayer.handleLoadedImage()" />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: "imageLoaded", val: HTMLImageElement): void;
}>();

export interface IBackLayer {
  init(src: string): Promise<void>;
}

const backImageRef = ref<HTMLImageElement>();

class BackLayer implements IBackLayer {
  init(src: string): Promise<void> {
    return new Promise<void>((y) => {
      backImageRef.value!.src = src;
      backImageRef.value!.style.display = "block";
      y();
    });
  }

  handleLoadedImage() {
    emit("imageLoaded", backImageRef.value!);
  }
}

const backLayer = new BackLayer();

defineExpose<IBackLayer>(backLayer);
</script>

<style lang="scss">
.kt-brick-image-crop {
  .kt-brick-back-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    background-image: repeating-conic-gradient(
      rgb(204, 204, 204) 0deg,
      rgb(204, 204, 204) 25%,
      rgb(255, 255, 255) 0deg,
      rgb(255, 255, 255) 50%
    );
    background-position: 0px 0px, 0.5rem 0.5rem;
    background-size: 1rem 1rem;
    background-repeat: repeat;

    .back-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      display: none;
    }
  }
}
</style>
