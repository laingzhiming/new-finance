<template>
  <view class="home-container">
    <!-- 搜索和筛选栏 -->
    <view class="search-filter-bar slide-in-down">
      <view class="search-box glass-card">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索账单或备注..."
          placeholder-class="placeholder"
          @input="handleSearch"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <text>✕</text>
        </view>
      </view>
      <view class="filter-scroll glass-card">
        <view
          class="filter-btn"
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          <text>全部</text>
        </view>
        <view
          v-for="(config, category) in CategoryConfigMap"
          :key="category"
          class="filter-btn"
          :class="{ active: activeFilter === category }"
          @click="setFilter(category)"
        >
          <text class="filter-icon">{{ config.icon }}</text>
          <text class="filter-label">{{ config.label }}</text>
        </view>
      </view>
    </view>

    <!-- 余额卡片 - 玻璃拟态 3D 质感 -->
    <view class="balance-card glass-card neon-glow soft-float">
      <view class="balance-header">
        <text class="balance-label">总余额</text>
        <text class="currency">¥</text>
      </view>
      <view class="balance-amount">
        <text class="amount number-animate">{{ animatedBalance }}</text>
      </view>
      <view class="balance-footer">
        <view class="balance-item" @click="goToStatistics">
          <text class="item-label">本月收入</text>
          <text class="item-value income">+{{ statistics.totalIncome.toFixed(2) }}</text>
        </view>
        <view class="balance-divider"></view>
        <view class="balance-item" @click="goToStatistics">
          <text class="item-label">本月支出</text>
          <text class="item-value expense">-{{ statistics.totalExpense.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions slide-in-up">
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
    <view class="category-progress glass-card slide-in-up">
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
    <view class="recent-bills glass-card slide-in-up">
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
import { computed, onMounted, ref } from 'vue'
import type { BillItem, StatisticsData } from '@/types'
import { BillCategory, CategoryConfigMap } from '@/types'
import { useBillStore } from '@/stores/bill'
import { useNumberAnimation } from '@/composables/useNumberAnimation'

const billStore = useBillStore()

// 搜索和筛选状态
const searchKeyword = ref<string>('')
const activeFilter = ref<string>('all')

// 统计数据
const statistics = computed<StatisticsData>(() => billStore.statistics)

// 数字滚动动画
const { animatedValue: animatedBalance } = useNumberAnimation(
  computed(() => statistics.value.balance),
  { duration: 1000, decimals: 2 }
)

// 最近账单
const recentBills = computed<BillItem[]>(() => {
  let filtered = billStore.bills

  // 按分类筛选
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(bill => bill.category === activeFilter.value)
  }

  // 按搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(
      bill =>
        bill.remark.toLowerCase().includes(keyword) ||
        getCategoryLabel(bill.category).toLowerCase().includes(keyword) ||
        bill.amount.toString().includes(keyword)
    )
  }

  return filtered.slice(0, 5)
})

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
    url: '/pages/record?type=expense'
  })
}

const addIncome = () => {
  uni.navigateTo({
    url: '/pages/record?type=income'
  })
}

// 跳转到统计页面
const goToStatistics = () => {
  uni.switchTab({
    url: '/pages/statistics'
  })
}

// 搜索处理
const handleSearch = () => {
  // 实时搜索
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

// 设置筛选
const setFilter = (filter: string) => {
  activeFilter.value = filter
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
}

/* 搜索筛选栏 */
.search-filter-bar {
  padding: calc(var(--status-bar-height) + 8px) 0 12px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-box {
  display: flex;
  align-items: center;
  border-radius: 16px;
  padding: 12px 14px;
  margin: 0 16px 10px;
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.search-icon {
  font-size: 16px;
  margin-right: 10px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  padding: 4px 0;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.placeholder {
  color: var(--text-muted);
}

.clear-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.clear-btn:active {
  transform: scale(0.9);
  background: var(--primary-color);
  color: white;
}

/* 筛选按钮 */
.filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 12px;
  margin: 0 16px;
  border-radius: 16px;
  scroll-behavior: smooth;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.filter-btn {
  min-width: 64px;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border-radius: 14px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  flex-direction: column;
  &:first-child {
    font-size: 16px;
  }
}

.filter-label {
  font-size: 12px;
  line-height: 1;
}

.filter-btn:active {
  transform: scale(0.95);
}

.filter-btn.active {
  background: var(--gradient-primary);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.filter-icon {
  font-size: 22px;
}

.settings-btn {
  margin-left: auto;
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
