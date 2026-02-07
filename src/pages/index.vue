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
        <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
          <text>✕</text>
        </view>
      </view>
      <view class="filter-scroll glass-card">
        <view
          class="filter-btn"
          :class="{ active: activeFilter === 'all' }"
          @tap="setFilter('all')"
        >
          <text>全部</text>
        </view>
        <view
          v-for="(config, category) in CategoryConfigMap"
          :key="category"
          class="filter-btn"
          :class="{ active: activeFilter === category }"
          @tap="setFilter(category)"
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

    <!-- 最近账单 / 筛选结果 -->
    <view class="recent-bills glass-card slide-in-up">
      <text class="section-title">{{
        activeFilter === 'all' && !searchKeyword ? '最近账单' : '筛选结果'
      }}</text>
      <view
        v-for="bill in displayBills"
        :key="bill.id"
        class="bill-item"
        @tap="viewBillDetail(bill)"
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
      <view v-if="displayBills.length === 0" class="empty-state">
        <text>暂无符合条件的账单</text>
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
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { BillItem, StatisticsData } from '@/types'
import { BillCategory, CategoryConfigMap, BillType } from '@/types'
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

const filteredBills = computed<BillItem[]>(() => {
  let filtered = [...billStore.bills]

  filtered.sort((a, b) => b.timestamp - a.timestamp)

  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(bill => bill.category === activeFilter.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(bill => {
      const remark = bill.remark ? bill.remark.toLowerCase() : ''
      const categoryLabel = getCategoryLabel(bill.category).toLowerCase()
      return (
        remark.includes(keyword) ||
        categoryLabel.includes(keyword) ||
        bill.amount.toString().includes(keyword)
      )
    })
  }

  return filtered
})

const displayBills = computed<BillItem[]>(() => filteredBills.value.slice(0, 5))

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

// 搜索处理
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const detailValue = (event as { detail?: { value?: string } }).detail?.value
  searchKeyword.value = detailValue ?? target?.value ?? ''
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
  uni.navigateTo({
    url: `/pages/bill-detail?id=${bill.id}`
  })
}

onMounted(() => {
  // 加载数据
  billStore.loadBills()
})
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 51px);
  background: var(--bg-primary);
}

/* 搜索筛选栏 */
.search-filter-bar {
  padding: calc(var(--status-bar-height) + 16rpx) 0 24rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-box {
  display: flex;
  align-items: center;
  border-radius: 32rpx;
  padding: 24rpx 28rpx;
  margin: 0 32rpx 20rpx;
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 28rpx;
  padding: 8rpx 0;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.placeholder {
  color: var(--text-muted);
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 24rpx;
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
  gap: 16rpx;
  overflow-x: auto;
  padding: 20rpx 24rpx;
  margin: 0 32rpx;
  border-radius: 32rpx;
  scroll-behavior: smooth;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.filter-btn {
  width: 149rpx;
  padding: 16rpx 20rpx;
  background: var(--bg-tertiary);
  border-radius: 28rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  flex-shrink: 0;
  flex-direction: column;
  &:first-child {
    font-size: 32rpx;
  }
}

.filter-label {
  font-size: 24rpx;
  line-height: 1;
}

.filter-btn:active {
  transform: scale(0.95);
}

.filter-btn.active {
  background: var(--gradient-primary);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 12rpx 32rpx rgba(99, 102, 241, 0.35);
}

.filter-icon {
  font-size: 44rpx;
}

.settings-btn {
  margin-left: auto;
}

/* 余额卡片 */
.balance-card {
  margin: 0 32rpx 48rpx;
  padding: 64rpx 48rpx;
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
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.balance-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.currency {
  font-size: 40rpx;
  color: var(--text-secondary);
}

.balance-amount {
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

.amount {
  font-size: 96rpx;
  font-weight: bold;
  color: var(--text-main);
  text-shadow: 0 0 40rpx rgba(99, 102, 241, 0.3);
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
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.item-value {
  display: block;
  font-size: 36rpx;
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
  height: 80rpx;
  background: var(--border-color);
}

/* 分类进度 */
.category-progress {
  margin: 0 32rpx 48rpx;
  padding: 40rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 40rpx;
}

.progress-item {
  margin-bottom: 40rpx;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.category-icon {
  font-size: 40rpx;
}

.category-name {
  font-size: 28rpx;
  color: var(--text-main);
}

.category-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

/* 最近账单 */
.recent-bills {
  margin: 0 32rpx 48rpx;
  padding: 40rpx;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-item:active {
  background: var(--glass-bg);
  margin: 0 -24rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
  border-radius: 16rpx;
}

.bill-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.bill-icon {
  font-size: 56rpx;
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bill-category {
  font-size: 28rpx;
  color: var(--text-main);
  font-weight: 500;
}

.bill-remark {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.bill-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.bill-amount {
  font-size: 32rpx;
  font-weight: 600;
}

.bill-amount.income {
  color: var(--success-color);
}

.bill-amount.expense {
  color: var(--error-color);
}

.bill-date {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.empty-state {
  padding: 40rpx 0 16rpx;
  text-align: center;
  color: var(--text-muted);
  font-size: 24rpx;
}
</style>
