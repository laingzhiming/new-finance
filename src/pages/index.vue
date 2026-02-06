<template>
  <view class="home-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar glass-card">
      <text class="navbar-title">Neo-Finance</text>
      <view class="navbar-right" @click="goToSettings">
        <text class="icon">⚙️</text>
      </view>
    </view>

    <!-- 余额卡片 - 玻璃拟态 3D 质感 -->
    <view class="balance-card glass-card neon-glow">
      <view class="balance-header">
        <text class="balance-label">总余额</text>
        <text class="currency">¥</text>
      </view>
      <view class="balance-amount">
        <text class="amount number-animate">{{ animatedBalance }}</text>
      </view>
      <view class="balance-footer">
        <view class="balance-item">
          <text class="item-label">本月收入</text>
          <text class="item-value income">+{{ statistics.totalIncome.toFixed(2) }}</text>
        </view>
        <view class="balance-divider"></view>
        <view class="balance-item">
          <text class="item-label">本月支出</text>
          <text class="item-value expense">-{{ statistics.totalExpense.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn glass-card" @click="addExpense">
        <text class="action-icon">💸</text>
        <text class="action-text">支出</text>
      </view>
      <view class="action-btn glass-card" @click="addIncome">
        <text class="action-icon">💰</text>
        <text class="action-text">收入</text>
      </view>
      <view class="action-btn glass-card" @click="goToStatistics">
        <text class="action-icon">📊</text>
        <text class="action-text">统计</text>
      </view>
    </view>

    <!-- 分类支出进度 -->
    <view class="category-progress glass-card">
      <text class="section-title">分类支出</text>
      <view v-for="(item, index) in topCategories" :key="index" class="progress-item">
        <view class="progress-header">
          <view class="category-info">
            <text class="category-icon">{{ item.icon }}</text>
            <text class="category-name">{{ item.label }}</text>
          </view>
          <text class="category-amount">¥{{ item.amount.toFixed(2) }}</text>
        </view>
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: item.percentage + '%', background: item.color }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 最近账单 -->
    <view class="recent-bills glass-card">
      <text class="section-title">最近账单</text>
      <view
        v-for="bill in recentBills"
        :key="bill.id"
        class="bill-item"
        @click="viewBillDetail(bill)"
      >
        <view class="bill-left">
          <text class="bill-icon">{{ getCategoryIcon(bill.category) }}</text>
          <view class="bill-info">
            <text class="bill-category">{{ getCategoryLabel(bill.category) }}</text>
            <text class="bill-remark">{{ bill.remark || '无备注' }}</text>
          </view>
        </view>
        <view class="bill-right">
          <text class="bill-amount" :class="bill.type === 'expense' ? 'expense' : 'income'">
            {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
          </text>
          <text class="bill-date">{{ formatDate(bill.date) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import type { BillItem, StatisticsData } from '@/types'
import { BillCategory, CategoryConfigMap } from '@/types'
import { useBillStore } from '@/stores/bill'
import { useNumberAnimation } from '@/composables/useNumberAnimation'

const billStore = useBillStore()

// 统计数据
const statistics = computed<StatisticsData>(() => billStore.statistics)

// 数字滚动动画
const { animatedValue: animatedBalance } = useNumberAnimation(
  computed(() => statistics.value.balance),
  { duration: 1000, decimals: 2 }
)

// 最近账单
const recentBills = computed<BillItem[]>(() => billStore.bills.slice(0, 5))

// 分类支出 Top 3
const topCategories = computed(() => {
  const categoryExpense = statistics.value.categoryExpense
  const total = statistics.value.totalExpense

  return Object.entries(categoryExpense)
    .map(([category, amount]) => ({
      category: category as BillCategory,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      ...CategoryConfigMap[category as BillCategory]
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
})

// 获取分类图标
const getCategoryIcon = (category: BillCategory): string => {
  return CategoryConfigMap[category]?.icon || '📝'
}

// 获取分类名称
const getCategoryLabel = (category: BillCategory): string => {
  return CategoryConfigMap[category]?.label || '其他'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

// 跳转到记账页面
const addExpense = () => {
  uni.navigateTo({
    url: '/pages/record/record?type=expense'
  })
}

const addIncome = () => {
  uni.navigateTo({
    url: '/pages/record/record?type=income'
  })
}

// 跳转到统计页面
const goToStatistics = () => {
  uni.switchTab({
    url: '/pages/statistics/statistics'
  })
}

// 跳转到设置页面
const goToSettings = () => {
  uni.switchTab({
    url: '/pages/settings/settings'
  })
}

// 查看账单详情
const viewBillDetail = (bill: BillItem) => {
  console.log('查看账单详情:', bill)
  // TODO: 实现账单详情页
}

onMounted(() => {
  // 加载数据
  billStore.loadBills()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

/* 导航栏 */
.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--status-bar-height) + 12px) 20px 12px;
  margin: 16px 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-title {
  font-size: 24px;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.navbar-right {
  padding: 8px;
}

.icon {
  font-size: 20px;
}

/* 余额卡片 */
.balance-card {
  margin: 0 16px 24px;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
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

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.balance-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.currency {
  font-size: 20px;
  color: var(--text-secondary);
}

.balance-amount {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.amount {
  font-size: 48px;
  font-weight: bold;
  color: var(--text-main);
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.balance-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  z-index: 1;
}

.balance-item {
  flex: 1;
  text-align: center;
}

.item-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.item-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
}

.item-value.income {
  color: var(--success-color);
}

.item-value.expense {
  color: var(--error-color);
}

.balance-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: space-between;
  margin: 0 16px 24px;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

.action-text {
  display: block;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

/* 分类进度 */
.category-progress {
  margin: 0 16px 24px;
  padding: 20px;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20px;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 20px;
}

.category-name {
  font-size: 14px;
  color: var(--text-main);
}

.category-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

/* 最近账单 */
.recent-bills {
  margin: 0 16px 24px;
  padding: 20px;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-item:active {
  background: var(--glass-bg);
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 8px;
}

.bill-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bill-icon {
  font-size: 28px;
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bill-category {
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

.bill-remark {
  font-size: 12px;
  color: var(--text-secondary);
}

.bill-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.bill-amount {
  font-size: 16px;
  font-weight: 600;
}

.bill-amount.income {
  color: var(--success-color);
}

.bill-amount.expense {
  color: var(--error-color);
}

.bill-date {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
