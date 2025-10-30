import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

import AutoImport from "unplugin-auto-import/vite";

import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  build: {    
    sourcemap: true,
    outDir: "dist", // 输出目录
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"), // 入口文件
      name: "KtBrickImageCrop", // 全局变量名
      fileName: (format) => `kt-brick-image-crop.${format}.js`, // 输出文件名
    },
    rollupOptions: {
      // 排除 Vue 本身（避免用户项目重复引入）
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue", // 全局环境中 Vue 的变量名
        },
      },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      dts: "dts/auto-imports.d.ts",
      imports: ["vue"],
      dirs: [],
    })
  ],
});
