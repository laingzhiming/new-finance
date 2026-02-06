# Neo-Finance TS Pro 快速开始指南

## 🎯 项目简介

Neo-Finance 是一个基于 uni-app + Vue 3 + TypeScript 的现代化多端费用管理系统，具有：

- ✨ 玻璃拟态设计风格
- 🌈 三种主题切换（Dark、Cyberpunk、Light）
- 📊 ECharts 数据可视化
- 💎 完整的 TypeScript 类型定义
- 📱 支持 H5、小程序、App 多端

## 📁 项目结构说明

```
neo-finance/
├── src/
│   ├── pages/              # 页面文件
│   │   ├── index/          # 首页 - 3D质感仪表盘
│   │   ├── record/         # 记账页 - 自定义键盘
│   │   ├── statistics/     # 统计页 - ECharts图表
│   │   └── settings/       # 设置页 - 主题切换
│   ├── components/         # 公共组件
│   ├── types/              # TypeScript 类型定义
│   │   ├── index.ts        # BillItem、Theme等核心接口
│   │   └── global.d.ts     # 全局类型声明
│   ├── stores/             # Pinia 状态管理
│   │   ├── bill.ts         # 账单数据管理
│   │   └── settings.ts     # 设置数据管理
│   ├── composables/        # Vue 组合式函数
│   │   └── useNumberAnimation.ts  # 数字滚动动画
│   ├── utils/              # 工具函数
│   │   └── helpers.ts      # 通用工具方法
│   ├── styles/             # 样式文件
│   │   ├── theme.css       # Design Tokens 主题系统
│   │   └── variables.scss  # SCSS 变量
│   ├── App.vue             # 应用根组件
│   ├── main.ts             # 应用入口
│   ├── manifest.json       # uni-app 应用配置
│   └── pages.json          # 页面路由配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── uno.config.ts           # UnoCSS 配置
├── package.json            # 项目依赖
├── Dockerfile              # Docker 镜像配置
├── docker-compose.yml      # Docker Compose 配置
└── nginx.conf              # Nginx 配置
```

## 🚀 快速开始

### 1. 克隆/下载项目

```bash
git clone <your-repo-url>
cd neo-finance
```

### 2. 安装依赖

```bash
npm install
```

如果遇到安装问题，可使用淘宝镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 3. 运行开发环境

#### H5 开发

```bash
npm run dev:h5
```

访问: http://localhost:5173

#### 微信小程序

```bash
npm run dev:mp-weixin
```

使用微信开发者工具打开 `dist/dev/mp-weixin` 目录

### 4. 生产构建

```bash
# H5 构建
npm run build:h5

# 小程序构建
npm run build:mp-weixin
```

## 🎨 核心功能说明

### 1. 首页 - 玻璃拟态仪表盘

**文件:** `src/pages/index/index.vue`

**特性:**

- 余额卡片带有 3D 旋转背景动画
- 数字滚动动画 (使用 `useNumberAnimation`)
- 发光进度条显示分类支出
- 最近账单列表

**关键代码:**

```typescript
// 数字滚动动画
const { animatedValue: animatedBalance } = useNumberAnimation(
  computed(() => statistics.value.balance),
  { duration: 1000, decimals: 2 }
)
```

### 2. 记账模块 - 类型安全录入

**文件:** `src/pages/record/record.vue`

**特性:**

- 自定义数字键盘，带按键动画
- 分类图标选择
- 支持收入/支出切换
- TypeScript 严格类型检查

**关键代码:**

```typescript
const bill: BillItem = {
  id: generateId(),
  amount: amountValue,
  category: selectedCategory.value,
  type: billType.value,
  timestamp: now,
  date: dateStr,
  remark: remark.value,
  createdAt: now,
  updatedAt: now
}
```

### 3. 统计模块 - ECharts 可视化

**文件:** `src/pages/statistics/statistics.vue`

**特性:**

- 折线图显示收支趋势
- 饼图显示分类占比
- 分类明细列表
- 响应式图表设计

**关键代码:**

```typescript
// 初始化 ECharts
const chart = echarts.init(canvas, null, {
  width: res[0].width,
  height: res[0].height,
  devicePixelRatio: dpr
})
```

### 4. 主题系统

**文件:** `src/styles/theme.css`

**主题切换:**

```typescript
// 在设置页切换主题
settingsStore.setTheme(Theme.Cyberpunk)

// 自动应用到根元素
document.documentElement.setAttribute('data-theme', 'cyberpunk')
```

**CSS 变量:**

```css
:root {
  --primary-color: #6366f1;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --text-main: #f8f9fa;
}

[data-theme='cyberpunk'] {
  --primary-color: #00f0ff;
  /* ... */
}
```

## 📚 TypeScript 类型定义

### BillItem 接口

```typescript
interface BillItem {
  id: string // 唯一标识
  amount: number // 金额
  category: BillCategory // 分类
  type: BillType // 收入/支出
  timestamp: number // 时间戳
  date: string // 日期 YYYY-MM-DD
  remark: string // 备注
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
}
```

### Theme 枚举

```typescript
enum Theme {
  Dark = 'dark',
  Cyberpunk = 'cyberpunk',
  Light = 'light'
}
```

## 🎯 开发技巧

### 1. 添加新页面

1. 在 `src/pages/` 创建新目录和 `.vue` 文件
2. 在 `src/pages.json` 中注册页面
3. 使用 `<script lang="ts" setup>` 语法

### 2. 使用 Pinia Store

```typescript
import { useBillStore } from '@/stores/bill'

const billStore = useBillStore()
billStore.addBill(newBill)
```

### 3. 应用 Tailwind/UnoCSS 样式

```vue
<view class="glass-card neon-glow">
  <!-- 内容 -->
</view>
```

### 4. 数字动画

```typescript
import { useNumberAnimation } from '@/composables/useNumberAnimation'

const { animatedValue } = useNumberAnimation(targetValue, { duration: 1000, decimals: 2 })
```

## 🐛 常见问题

### Q1: 页面显示空白

**A:** 检查控制台错误，确保依赖已正确安装

### Q2: 主题切换不生效

**A:** 确保 `theme.css` 已在 `index.html` 中引入

### Q3: ECharts 不显示

**A:** 检查 canvas 元素是否正确初始化，确保 DOM 已渲染

### Q4: 数据持久化问题

**A:** uni-app 使用 `uni.setStorageSync` 存储数据，检查存储配额

## 📖 相关文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [UnoCSS 文档](https://unocss.dev/)
- [ECharts 文档](https://echarts.apache.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

## 🚀 下一步

1. 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解部署流程
2. 查看各页面组件源码理解实现细节
3. 根据需求自定义主题和功能
4. 添加更多图表和数据分析功能
5. 接入后端 API 实现云端数据同步

## 💡 提示

- 使用 TypeScript 的严格模式可以避免很多运行时错误
- 玻璃拟态效果在深色背景下效果最佳
- 数字滚动动画可以提升用户体验
- 定期备份数据以防丢失

祝开发愉快！🎉
