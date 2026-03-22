# AGENTS.md — Neo-Finance TS Pro

> 酷炫风多端费用统计系统 — uni-app (Vue 3 + TypeScript + Pinia)

## 构建 / 开发命令

```bash
npm run dev:h5              # H5 开发服务器 (端口 8888)
npm run build:h5            # H5 生产构建
npm run dev:mp-weixin       # 微信小程序开发
npm run build:mp-weixin     # 微信小程序构建
npm run dev:app             # App 开发
npm run build:app           # App 构建
npm run type-check          # vue-tsc 类型检查 (--noEmit)
```

- **未配置测试框架**，不要杜撰测试命令。
- **无独立 lint 脚本**，ESLint 通过 IDE/编辑器集成运行。
- 提交前务必执行 `npm run type-check`。

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | uni-app 3.0 alpha (Vue 3，多端：H5 / 微信小程序 / App) |
| 语言 | TypeScript 5.7，strict 模式 |
| 状态管理 | Pinia 2.x (Options 风格 Store) |
| 样式 | UnoCSS (preset-uno) + scoped SCSS/CSS + CSS 自定义属性 |
| 构建 | Vite 4.x + `@dcloudio/vite-plugin-uni` |

## 项目结构

```
src/
├── pages/          # 页面路由 (index, record, statistics, settings, bill-detail, 404)
├── components/     # 公共组件 (AppModal, AppActionSheet)
├── composables/    # Vue 组合式函数 (useNumberAnimation, useTheme, usePageLifecycle)
├── stores/         # Pinia 状态仓库 (bill, settings)
├── types/          # TypeScript 枚举、接口、常量
├── utils/          # 纯工具函数 (formatDate, debounce, deepClone 等)
├── styles/         # theme.css, variables.scss, uno.css
├── App.vue         # 根组件 + 全局样式
├── main.ts         # 应用入口 (createSSRApp + Pinia)
└── pages.json      # uni-app 路由 & tabBar 配置
```

路径别名：`@/` → `src/`（已在 tsconfig.json 和 vite.config.ts 中配置）。

## 代码风格

### 格式化 (Prettier)

- **无分号** (`"semi": false`)
- **单引号** (`"singleQuote": true`)
- **无尾逗号** (`"trailingComma": "none"`)
- **100 字符** 换行宽度
- **2 空格** 缩进
- **单参数箭头函数不加括号** (`"arrowParens": "avoid"`)
- 使用编辑器的格式化保存，不要手动对齐格式。

### Vue 组件

- 始终使用 **`<script lang="ts" setup>`**（Composition API），禁止 Options API。
- Props：`defineProps<{ ... }>()`，使用 TypeScript 泛型。
- Emits：`defineEmits<{ ... }>()`，使用 TypeScript 泛型。
- 样式：组件用 `<style scoped>`；`App.vue` 中全局样式不加 scoped。
- 组件名：允许单字命名（`"vue/multi-word-component-names": "off"`）。
- 公共组件以 `App` 前缀命名（如 `AppModal`、`AppActionSheet`）。

### TypeScript

- **Strict 模式已开启**，提交前修复所有 `tsc` 错误。
- `noUnusedLocals` 和 `noUnusedParameters` 已启用——故意不用的参数以 `_` 前缀标记。
- `any` 被允许（`"@typescript-eslint/no-explicit-any": "off"`），但优先使用具体类型。
- 枚举：PascalCase 键名，camelCase 值（如 `BillCategory.Food = 'food'`）。
- 接口：PascalCase，统一从 `src/types/index.ts` 导出。
- 类型导入使用 `import type { ... }`。

### 导入顺序

```ts
// 1. Vue 及第三方库
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

// 2. 类型与常量
import type { BillItem } from '@/types'
import { BillType, CategoryConfigMap } from '@/types'

// 3. Store
import { useBillStore } from '@/stores/bill'

// 4. Composables
import { useNumberAnimation } from '@/composables/useNumberAnimation'

// 5. 工具函数
import { formatDate } from '@/utils/helpers'
```

跨目录导入一律使用 `@/` 别名；仅同目录内使用相对路径 `./`。

### 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| Vue 文件 | PascalCase | `AppModal.vue`；页面文件 kebab-case 亦可 `bill-detail.vue` |
| TS 文件 | camelCase | `helpers.ts`, `useNumberAnimation.ts` |
| Store | `use` + 名称 + `Store` | `useBillStore`, `useSettingsStore` |
| Composable | `use` + 功能名 | `useNumberAnimation`, `useTheme` |
| 枚举 | PascalCase 键名 | `BillCategory`, `Theme` |
| 接口 | PascalCase | `BillItem`, `StatisticsData` |
| 常量 | camelCase 对象 | `CategoryConfigMap` |
| CSS 类名 | kebab-case | `glass-card`, `balance-card` |

### 样式

- UnoCSS 快捷方式定义在 `uno.config.ts`：`glass-card`、`neon-glow`、`btn-primary`。
- 使用 `src/styles/theme.css` 中的 CSS 自定义属性（`var(--primary-color)`、`var(--text-main)` 等）。
- SCSS 变量通过 vite 配置自动注入（`@import "@/styles/variables.scss"`）。
- 移动端适配使用 `rpx` 单位。
- 优先使用 UnoCSS 内联工具类；复杂布局回退到 scoped `<style>`。

### 错误处理

- `uni.getStorageSync` / `uni.setStorageSync` 必须用 try-catch 包裹，错误用 `console.error` 记录。
- 用户可见的错误使用 `uni.showToast` 提示。
- 模板中对 null/undefined 做防御，使用 `v-if` 和兜底文案。

### uni-app 要点

- 页面跳转：`uni.navigateTo({ url: '/pages/xxx' })`。
- 本地存储：`uni.getStorageSync` / `uni.setStorageSync`（字符串键名）。
- 生命周期：`App.vue` 中使用 `onLaunch`、`onShow`、`onHide`（来自 `@dcloudio/uni-app`）；页面中使用 `onMounted`。
- TabBar 页面（配置在 `src/pages.json`）**禁止**用 `uni.navigateTo` 跳转，应使用 `uni.switchTab`。

## ESLint 关键规则

- `@typescript-eslint/no-explicit-any`: off
- `@typescript-eslint/no-unused-vars`: warn（`_` 前缀的参数忽略）
- `vue/multi-word-component-names`: off
- `vue/no-v-html`: off

