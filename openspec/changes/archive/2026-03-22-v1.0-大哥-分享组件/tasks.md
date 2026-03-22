# Tasks: 实现步骤清单

1. 新建组件文件
   - [x] 创建 `src/components/AppSharePoster.vue`，使用 `<script lang="ts" setup>` 编写
   - [x] 使用 `glass-card` 类并以 `rpx` 为单位实现样式

2. 实现导出功能
   - [x] 使用 Canvas 或 `uni.canvasToTempFilePath` 生成图片
   - [x] 调用 `uni.saveImageToPhotosAlbum` 保存图片，注意权限处理

3. 暴露 API 与事件
   - [x] 提供 `save()` 方法，Emit `save-success` / `save-fail`

4. 示例页面与手动测试
   - [x] 在任意页面加入示例调用，手动验证保存流程

5. 类型检查与代码风格
   - [x] 运行 `npm run type-check`，确保无 TS 错误
   - [x] 遵循单引号、无分号等代码风格

6. [x] 已实现组件
   - `src/components/AppSharePoster.vue` 已创建并实现基础绘制与保存逻辑

