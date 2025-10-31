# Brick Image Crop

<img src="https://brick.cangsg.com/logo.png" alt="" width="120" height="120">

A lightweight and easy-to-use Vue image cropping open-source component, focusing on providing efficient and flexible image cropping solutions.

## Core Features

- **Multi-format Support**：Perfectly compatible with mainstream image formats like PNG and JPG, meeting daily development needs
- **Flexible Cropping Modes**：Supports both free cropping and aspect ratio-based cropping, allowing quick switching according to scenarios
- **Precise Interaction Control**：Built-in drag restriction to prevent cropping area from exceeding image boundaries, enhancing user experience
- **Low-intrusive Integration**：Designed as a brick component, it won't pollute existing project code and can be referenced without complex configuration

## Installation and Usage

The component supports installation via npm or yarn. After installation, it can be directly imported and used in Vue projects. The specific steps are as follows:

1. Install the component

```bash
# Install via npm
npm install kt-brick-image-crop --save

# Install via yarn
yarn add kt-brick-image-crop
```

2. Project Reference

```js
<template>
  <kt-brick-image-crop ref="imageCropRef" aspect-ratio="free" />
  <!-- Method 1: Select Image -->
  <input type="button" value="选择图片" @click="handleSelectImage" />
  <!-- Method 2: Set Image -->
  <input type="file" ref="inputImageRef" accept="image/*" @change="handleLoadImage" />
  <!-- Get Result -->
  <input type="button" value="下载图片" @click="handleCompetedImage" />
</template>

<script lang="ts" setup>
import { KtBrickImageCrop, downloadImage, type IKtBrickImageCrop } from "kt-brick-image-crop";
import "kt-brick-image-crop/dist/kt-brick-image-crop.css";

const imageCropRef = ref<IKtBrickImageCrop>();

// Method 1: Select Image
function handleSelectImage() {
  imageCropRef?.imageSelect();
}

// Method 2: Set Image (suitable for cases where image data already exists)
function handleLoadImage(e: Event) {
  const input = e.target as HTMLInputElement;

  const file = input.files![0];
  if (!file) return;

  imageCropRef.value?.setImage(await file.arrayBuffer());
}

// Get editing result
function handleCompetedImage() {
  imageCropRef.value?.cropImage().then((result) => {
    downloadImage(result.data, result.format);
  });
}
</script>
```

## Component Preview

<img src="https://brick.cangsg.com/images/001.png" width="500" alt="">

<img src="https://brick.cangsg.com/images/002.png" width="500" alt="">

## Component Wrapping
Simple wrapping of the component using Vuetify
```js
<template>
  <v-dialog width="800" v-model="dialogRef.isActive" persistent >
    <template v-slot:default="{ isActive }">
      <v-card title="图片裁剪" prepend-icon="mdi-image-size-select-large">
        <v-row no-gutters>
          <v-col>
            <kt-brick-image-crop ref="imageCropRef" aspect-ratio="free"></kt-brick-image-crop>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-btn
            class="text-none text-white"
            color="success"
            rounded="0"
            variant="flat"
            prepend-icon="mdi-progress-upload"
            style="align-self: flex-start"
            @click="() => imageCropRef?.selectImage()"
            >Select Image&nbsp;</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            class="text-none ms-4 text-white"
            color="blue-darken-4"
            rounded="0"
            variant="flat"
            prepend-icon="mdi-alpha-s-box-outline"
            @click="() => handleCompetedImage()"
            >Confirm&nbsp;</v-btn
          >
          <v-btn
            class="text-none"
            color="blue-darken-4"
            rounded="0"
            variant="outlined"
            prepend-icon="mdi-window-close"
            @click="isActive.value = false"
            >Close&nbsp;</v-btn
          >
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<script lang="ts" setup>
import { KtBrickImageCrop, downloadImage, type IKtBrickImageCrop } from "kt-brick-image-crop";
import "kt-brick-image-crop/dist/kt-brick-image-crop.css";

const dialogRef = ref<{
  isActive: boolean;
}>({
  isActive: false,
});

const imageCropRef = ref<IKtBrickImageCrop>();

function handleCompetedImage() {
  imageCropRef.value?.cropImage().then((result) => {
    downloadImage(result.data, result.format);
  });
}

export interface IKtUploadImageCut {
  showDialog(): Promise<void>;
}

class KtUploadImageCut implements IKtUploadImageCut {
  showDialog(): Promise<void> {
    return new Promise<void>((y, n) => {
      dialogRef.value.isActive = true;
      y();
    });
  }
}

const uploadImageCut = new KtUploadImageCut();

defineExpose<IKtUploadImageCut>(uploadImageCut);
</script>
```

<img src="https://brick.cangsg.com/images/003.png" width="500" alt="">

<img src="https://brick.cangsg.com/images/004.png" width="500" alt="">

## License

[MIT](LICENSE)
