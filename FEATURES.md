# Neo-Finance TS Pro 功能特性详解

## 🎨 设计系统

### Glassmorphism (玻璃拟态)

**实现原理:**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
```

**特点:**

- 半透明背景
- 高斯模糊效果
- 细腻的边框和阴影
- 层次分明的视觉效果

### Design Tokens 主题系统

**三种主题:**

1. **Dark (深色)** - 默认主题
   - 主色: #6366F1 (靛蓝)
   - 背景: #0f0f1e (深蓝黑)
   - 适合夜间使用

2. **Cyberpunk (赛博朋克)**
   - 主色: #00F0FF (青色)
   - 次要色: #FF00FF (品红)
   - 强烈的霓虹光效

3. **Light (浅色)**
   - 主色: #4F46E5 (深靛蓝)
   - 背景: #FFFFFF (白色)
   - 适合日间使用

**切换实现:**

```typescript
// 设置主题
settingsStore.setTheme(Theme.Cyberpunk)

// CSS 自动切换
document.documentElement.setAttribute('data-theme', 'cyberpunk')
```

## 💫 动画效果

### 1. 数字滚动动画

**使用场景:** 余额变动时的平滑过渡

**实现方式:**

```typescript
export function useNumberAnimation(
  target: Ref<number>,
  options: { duration: number; decimals: number }
) {
  // 使用 requestAnimationFrame 实现平滑动画
  // 支持自定义缓动函数
}
```

**效果:**

- 从旧值平滑过渡到新值
- 可自定义动画时长和小数位数
- 使用 easeInOutQuad 缓动函数

### 2. 发光效果 (Neon Glow)

**CSS 实现:**

```css
.neon-glow {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 25px var(--primary-color);
  }
}
```

**效果:** 持续的呼吸灯光效果

### 3. 按键动画

**记账键盘特效:**

- 点击时缩放效果 `transform: scale(0.95)`
- 震动反馈 `uni.vibrateShort()`
- 背景色过渡

### 4. 3D 旋转背景

**余额卡片动画:**

```css
.balance-card::before {
  content: '';
  background: radial-gradient(...);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## 📊 数据可视化

### ECharts 集成

**折线图 - 收支趋势:**

```typescript
{
  type: 'line',
  data: [100, 200, 150, ...],
  smooth: true,
  areaStyle: {
    color: {
      type: 'linear',
      colorStops: [
        { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
        { offset: 1, color: 'rgba(239, 68, 68, 0)' }
      ]
    }
  }
}
```

**饼图 - 分类占比:**

```typescript
{
  type: 'pie',
  radius: ['40%', '70%'],  // 环形图
  label: {
    formatter: '{b}\n{d}%'
  }
}
```

**特点:**

- 响应式设计，适配不同屏幕
- 支持触摸交互
- 渐变色彩
- 平滑动画

## 🔒 TypeScript 类型安全

### 核心接口定义

**账单接口:**

```typescript
interface BillItem {
  id: string
  amount: number
  category: BillCategory // 枚举类型
  type: BillType // 枚举类型
  timestamp: number
  date: string
  remark: string
  createdAt: number
  updatedAt: number
}
```

**枚举类型:**

```typescript
enum BillCategory {
  Food = 'food',
  Shopping = 'shopping',
  Transport = 'transport'
  // ...
}

enum BillType {
  Expense = 'expense',
  Income = 'income'
}
```

**类型检查优势:**

- 编译时错误检测
- IDE 智能提示
- 重构安全性
- 文档自动生成

## 📱 多端适配

### uni-app 跨平台

**支持平台:**

- H5 (网页版)
- 微信小程序
- App (iOS/Android)
- 支付宝小程序
- 其他小程序平台

**条件编译:**

```typescript
// #ifdef H5
console.log('H5 平台')
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序')
// #endif
```

**API 兼容:**

```typescript
// uni-app 统一 API
uni.showToast({ title: '提示' })
uni.navigateTo({ url: '/pages/...' })
uni.setStorageSync('key', 'value')
```

## 💾 数据持久化

### Pinia Store + LocalStorage

**账单存储:**

```typescript
// 保存
saveBills() {
  uni.setStorageSync('bills', JSON.stringify(this.bills))
}

// 加载
loadBills() {
  const data = uni.getStorageSync('bills')
  if (data) this.bills = JSON.parse(data)
}
```

**优势:**

- 自动序列化/反序列化
- 类型安全
- 响应式更新
- 支持多端

## 🎯 用户体验优化

### 1. 触觉反馈

```typescript
uni.vibrateShort({ type: 'light' })
```

### 2. 加载状态

```typescript
uni.showLoading({ title: '加载中...' })
uni.hideLoading()
```

### 3. 错误提示

```typescript
uni.showToast({
  title: '请输入有效金额',
  icon: 'none'
})
```

### 4. 确认对话框

```typescript
uni.showModal({
  title: '确认删除',
  content: '此操作不可恢复',
  success: res => {
    if (res.confirm) {
      // 执行删除
    }
  }
})
```

## 🚀 性能优化

### 1. 懒加载

- 图表按需加载
- 路由懒加载
- 图片懒加载

### 2. 虚拟滚动

- 长列表优化
- 只渲染可见项

### 3. 防抖节流

```typescript
import { debounce, throttle } from '@/utils/helpers'

const handleSearch = debounce(keyword => {
  // 搜索逻辑
}, 300)
```

### 4. 缓存策略

- 静态资源缓存
- API 数据缓存
- 计算结果缓存

## 🎨 可扩展性

### 1. 添加新分类

```typescript
// src/types/index.ts
export enum BillCategory {
  // ...existing
  Travel = 'travel' // 新增
}

// 更新配置
export const CategoryConfigMap = {
  // ...
  [BillCategory.Travel]: {
    label: '旅游',
    icon: '✈️',
    color: '#FF6B9D'
  }
}
```

### 2. 添加新主题

```css
/* src/styles/theme.css */
[data-theme='custom'] {
  --primary-color: #YOUR_COLOR;
  --glass-bg: rgba(...);
  /* ... */
}
```

```typescript
// src/types/index.ts
export enum Theme {
  // ...
  Custom = 'custom'
}
```

### 3. 添加新图表

```typescript
// src/pages/statistics/statistics.vue
const initCustomChart = () => {
  // ECharts 配置
}
```

## 🔐 安全性

### 1. 输入验证

```typescript
export function validateAmount(amount: string): boolean {
  const regex = /^\d+(\.\d{1,2})?$/
  return regex.test(amount) && parseFloat(amount) > 0
}
```

### 2. XSS 防护

- Vue 自动转义
- 避免使用 v-html
- Content-Security-Policy

### 3. 数据加密

```typescript
// 可选：敏感数据加密存储
import CryptoJS from 'crypto-js'

const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
```

## 📈 未来规划

### 计划功能

1. **云端同步**
   - 用户登录/注册
   - 多设备数据同步
   - 备份恢复

2. **智能分析**
   - AI 消费建议
   - 预算提醒
   - 趋势预测

3. **社交功能**
   - 账单分享
   - 群组记账
   - 好友对比

4. **更多图表**
   - 年度报告
   - 月度对比
   - 自定义图表

5. **国际化**
   - 多语言支持
   - 多币种支持
   - 汇率转换

---

**持续更新中...** 欢迎贡献代码和建议！
