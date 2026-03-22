# Spec: AppSharePoster 组件

## 简要

为 H5 / 小程序 提供 `AppSharePoster.vue` 组件的规范，包含 Props、方法、事件和实现约定，作为变更的 delta spec，归档/同步时可并入全局 `openspec/specs`。

## 文件位置

`src/components/AppSharePoster.vue`

## Props

- `title: string` — 必填，主标题
- `subtitle?: string` — 可选，副标题
- `imageSrc?: string` — 可选，主图地址
- `footer?: string` — 可选，底部文案
- `width?: number` — 可选，海报宽（px），默认 750
- `height?: number` — 可选，海报高（px），默认 1334

## Methods / API

- `save(): Promise<void>` — 导出并保存海报图片；成功 resolve 并触发 `save-success`，失败 reject 并触发 `save-fail`

## Events

- `save-success` — 返回 `{ filePath: string }`
- `save-fail` — 返回 `{ error: any }`
- `update:busy` — 在导出过程中用于通知父组件

## 实现约定

- 使用 `<script lang="ts" setup>` 与 `import type` 导入类型
- 模板容器需使用 `glass-card` 类，所有尺寸使用 `rpx` 单位
- 所有 `uni` API 调用需包裹在 `try-catch` 中，错误通过 `console.error` 记录
- 遵循项目的代码风格（单引号、无分号）

## 验收标准

- 组件存在且通过 `npm run type-check`
- 手动测试可以在 H5 或真机小程序上成功保存图片到相册
