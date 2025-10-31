# 积木图片裁剪

<img src="https://brick.cangsg.com/logo.png" alt="" width="120" height="120">

一款轻量、易用的 Vue 图片裁剪开源组件，专注于提供高效且灵活的图片裁剪解决方案。

## 核心特性

- **多格式支持**：完美兼容 PNG、JPG 主流图片格式，满足日常开发需求
- **灵活裁剪模式**：同时支持自由裁剪和比例设置裁剪，可根据场景快速切换
- **精细交互控制**：内置拖拽限制功能，避免裁剪区域超出图片范围，提升操作体验
- **低侵入性集成**：作为积木组件设计，不会污染项目原有代码，无需复杂配置即可引用

## 安装与引用

组件支持 npm 或 yarn 安装，安装后可直接在 Vue 项目中引入使用，具体步骤如下：

1. 安装组件

```bash
# npm 安装
npm install kt-brick-image-crop --save

# yarn 安装
yarn add kt-brick-image-crop
```

2. 项目引用

```js
<template>
  <kt-brick-image-crop ref="imageCropRef" aspect-ratio="free" />
  <!-- 方式一 选择图片 -->
  <input type="button" value="选择图片" @click="handleSelectImage" />
  <!-- 方式二 设置图片 -->
  <input type="file" ref="inputImageRef" accept="image/*" @change="handleLoadImage" />
  <!-- 获取结果 -->
  <input type="button" value="下载图片" @click="handleCompetedImage" />
</template>

<script lang="ts" setup>
import { KtBrickImageCrop, downloadImage, type IKtBrickImageCrop } from "kt-brick-image-crop";
import "kt-brick-image-crop/dist/kt-brick-image-crop.css";

const imageCropRef = ref<IKtBrickImageCrop>();

// 方式一 选择图片
function handleSelectImage() {
  imageCropRef?.imageSelect();
}

// 方式二 设置图片 适用于已经存在了图片数据的情况
function handleLoadImage(e: Event) {
  const input = e.target as HTMLInputElement;

  const file = input.files![0];
  if (!file) return;

  imageCropRef.value?.setImage(await file.arrayBuffer());
}

// 获取编辑结果结果
function handleCompetedImage() {
  imageCropRef.value?.cropImage().then((result) => {
    downloadImage(result.data, result.format);
  });
}
</script>
```

## 组件预览

<img src="https://brick.cangsg.com/images/001.png" width="500" alt="">

<img src="https://brick.cangsg.com/images/002.png" width="500" alt="">

## 组件包装
使用vuetify对组件进行简单包装
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
            >选择图片&nbsp;</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            class="text-none ms-4 text-white"
            color="blue-darken-4"
            rounded="0"
            variant="flat"
            prepend-icon="mdi-alpha-s-box-outline"
            @click="() => handleCompetedImage()"
            >确定&nbsp;</v-btn
          >
          <v-btn
            class="text-none"
            color="blue-darken-4"
            rounded="0"
            variant="outlined"
            prepend-icon="mdi-window-close"
            @click="isActive.value = false"
            >关闭&nbsp;</v-btn
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
