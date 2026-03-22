# Design: AppSharePoster 组件设计

## 概览

`AppSharePoster.vue` 用于在页面内渲染一张分享海报，支持把海报导出为图片并保存到相册或供分享使用。组件应尽量纯 UI，复杂的图片合成可使用 Canvas 或将 DOM 转为图片的工具。

## Props

- `title: string` — 主标题
- `subtitle?: string` — 副标题
- `imageSrc?: string` — 背景或主图的 URL
- `footer?: string` — 底部文案
- `width?: number` — 海报宽（px），默认 750（对应 750rpx 设计稿）
- `height?: number` — 海报高（px），默认 1334
- `backgroundColor?: string` — 背景色

## API / Emits

- `save()` — 方法：将海报导出为图片并保存到相册，成功/失败通过事件 `save-success` / `save-fail` 通知
- `download()` — 下载图片到文件（可选）
- Emits: `update:busy`, `save-success`, `save-fail`

## 实现细节

- 使用 `<script lang="ts" setup>`，类型导入 `BillItem` 示例（若需要）采用 `import type` 语法
- 模板使用 `div`/`view` 结构，外层容器使用 `glass-card` 类
- 样式使用 `rpx` 单位；内部元素使用 CSS 变量和 UnoCSS 快捷类优先
- 导出图片时使用 `uni.canvasToTempFilePath` + `uni.saveImageToPhotosAlbum`（注意平台权限），并在所有 `uni` 存储或 API 调用处包裹 `try-catch` 并记录 `console.error`

## 可访问性与国际化

- 文本内容应支持插值并保持可读取性（对比度），关键操作需要可通过屏幕阅读器访问（aria-like 提示）

## 验收标准

- 组件存在于 `src/components/AppSharePoster.vue`，并通过 `npm run type-check` 无报错
- 在示例页面能渲染并通过 `save()` 成功保存到相册（手动测试或说明如何测试）
