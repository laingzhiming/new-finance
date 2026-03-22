# Proposal: v1.0-大哥-分享组件

## 概要

开发一个可复用的分享海报组件 `AppSharePoster.vue`，用于在应用内生成并展示用于社交分享的海报图片（支持保存到相册和复制分享图像）。

## 目标
- 使用 `<script lang="ts" setup>` 编写，严格 TypeScript 校验
- 样式使用 `glass-card`，适配移动端使用 `rpx` 单位
- 遵循代码风格：单引号、无分号、100 字符行宽
- 提供易用的 Props：`title`、`subtitle`、`imageSrc`、`footer`、`width`/`height`（默认为移动海报尺寸）
- 支持导出为图片并触发保存/分享事件

## 验收标准
- 组件文件 `src/components/AppSharePoster.vue` 存在并使用 `<script lang="ts" setup>` 编写
- UI 按设计使用 `glass-card` 和 `rpx` 单位，无 TS 错误（`npm run type-check` 通过）
- 提供 `save()` 导出并保存图片的公开方法或事件
