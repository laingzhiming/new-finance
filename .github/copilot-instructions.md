# Neo-Finance TS Pro - Copilot 指令

## ✅ 项目已完成搭建

这是一个基于 uni-app + Vue 3 + TypeScript 的酷炫风多端费用统计系统。

## 📁 项目结构

```
neo-finance/
├── src/
│   ├── pages/           # 页面组件
│   │   ├── index/       # 首页 - 玻璃拟态仪表盘
│   │   ├── record/      # 记账页 - 自定义键盘
│   │   ├── statistics/  # 统计页 - ECharts图表
│   │   └── settings/    # 设置页 - 主题切换
│   ├── components/      # 可复用组件
│   ├── types/           # TypeScript 类型定义
│   ├── stores/          # Pinia 状态管理
│   ├── composables/     # Vue 组合式函数
│   ├── utils/           # 工具函数
│   └── styles/          # 主题样式
├── .vscode/             # VSCode 配置
├── QUICKSTART.md        # 快速开始指南
├── FEATURES.md          # 功能特性详解
└── DEPLOYMENT.md        # 部署指南
```

## 🛠️ 技术栈

- **框架**: uni-app + Vue 3
- **语言**: TypeScript (严格模式)
- **样式**: UnoCSS (Tailwind 兼容)
- **状态管理**: Pinia
- **可视化**: ECharts
- **主题**: Design Tokens (Dark/Cyberpunk/Light)

## 🎨 核心功能

1. **玻璃拟态 UI** - Glassmorphism 设计风格
2. **三种主题** - 支持 Dark、Cyberpunk、Light 切换
3. **数字动画** - 余额滚动动画效果
4. **数据可视化** - ECharts 折线图、饼图
5. **类型安全** - 完整的 TypeScript 接口定义
6. **多端适配** - 支持 H5、小程序、App

## 📝 开发规范

- 所有组件使用 `<script lang="ts" setup>` 语法
- 严格遵循 TypeScript 类型定义
- 使用 Pinia 进行状态管理
- CSS 使用 Design Tokens 变量
- 组件样式使用 scoped

## 🚀 快速开始

1. 安装依赖: `npm install`
2. 运行 H5: `npm run dev:h5`
3. 构建生产: `npm run build:h5`

查看 [QUICKSTART.md](../QUICKSTART.md) 了解更多。
