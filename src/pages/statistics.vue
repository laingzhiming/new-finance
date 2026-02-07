<template>
  <view class="statistics-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar glass-card slide-in-down">
      <text class="navbar-title">数据统计</text>
      <view class="date-selector" @click="showDatePicker">
        <text>{{ currentMonth }}</text>
        <text class="icon">📅</text>
      </view>
    </view>

    <!-- 概览卡片 -->
    <view class="overview-card glass-card soft-float">
      <view class="overview-item">
        <text class="overview-label">收入</text>
        <text class="overview-value income">+{{ statistics.totalIncome.toFixed(2) }}</text>
      </view>
      <view class="overview-divider"></view>
      <view class="overview-item">
        <text class="overview-label">支出</text>
        <text class="overview-value expense">-{{ statistics.totalExpense.toFixed(2) }}</text>
      </view>
      <view class="overview-divider"></view>
      <view class="overview-item">
        <text class="overview-label">结余</text>
        <text class="overview-value" :class="balanceClass">
          {{ statistics.balance >= 0 ? '+' : '' }}{{ statistics.balance.toFixed(2) }}
        </text>
      </view>
    </view>

    <!-- 图表容器 -->
    <view class="chart-section glass-card slide-in-up">
      <text class="section-title">支出趋势</text>
      <view class="chart-container">
        <canvas type="2d" canvas-id="trendChart" id="trendChart" class="chart-canvas"></canvas>
      </view>
    </view>

    <!-- 分类占比 -->
    <view class="chart-section glass-card slide-in-up">
      <text class="section-title">支出分类占比</text>
      <view class="chart-container">
        <canvas type="2d" canvas-id="pieChart" id="pieChart" class="chart-canvas"></canvas>
      </view>
    </view>

    <!-- 分类统计表 -->
    <view class="category-stats glass-card slide-in-up">
      <text class="section-title">分类统计</text>
      <view class="tabs">
        <view
          class="tab-btn"
          :class="{ active: statsTab === 'expense' }"
          @tap="statsTab = 'expense'"
        >
          <text>支出</text>
        </view>
        <view
          class="tab-btn"
          :class="{ active: statsTab === 'income' }"
          @tap="statsTab = 'income'"
        >
          <text>收入</text>
        </view>
      </view>
      <view v-for="(item, index) in statsData" :key="index" class="stat-item">
        <view class="stat-left">
          <text class="stat-icon">{{ item.icon }}</text>
          <view class="stat-info">
            <text class="stat-label">{{ item.label }}</text>
            <text class="stat-percentage">{{ item.percentage }}%</text>
          </view>
        </view>
        <view class="stat-bar-container">
          <view class="stat-bar">
            <view
              class="stat-bar-fill"
              :style="{ width: item.percentage + '%', background: item.color }"
            ></view>
          </view>
        </view>
        <text class="stat-amount">¥{{ item.amount.toFixed(2) }}</text>
      </view>
    </view>
    <AppActionSheet
      v-model="showMonthSheet"
      title="选择月份"
      :options="monthOptions"
      @select="handleMonthSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, getCurrentInstance, watch, nextTick } from 'vue'
import type { StatisticsData } from '@/types'
import { CategoryConfigMap, BillCategory, BillType } from '@/types'
import { useBillStore } from '@/stores/bill'
import uCharts from '@qiun/ucharts'
import AppActionSheet from '@/components/AppActionSheet.vue'

const billStore = useBillStore()
const instance = getCurrentInstance()
const instanceProxy = instance?.proxy ?? undefined

const statsTab = ref<'expense' | 'income'>('expense')

const getYearMonth = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const formatYearMonthLabel = (value: string) => {
  const [year, month] = value.split('-')
  return `${year}年${Number(month)}月`
}

const selectedMonth = ref<string>(getYearMonth(new Date()))

// 当前月份显示
const currentMonth = computed(() => formatYearMonthLabel(selectedMonth.value))

const buildStatisticsForMonth = (yearMonth: string): StatisticsData => {
  const [yearStr, monthStr] = yearMonth.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr) - 1

  const monthlyBills = billStore.bills.filter(bill => {
    const billDate = new Date(bill.date)
    return billDate.getFullYear() === year && billDate.getMonth() === month
  })

  let totalIncome = 0
  let totalExpense = 0
  const categoryExpense: Record<string, number> = {}
  const categoryIncome: Record<string, number> = {}

  monthlyBills.forEach(bill => {
    if (bill.type === BillType.Income) {
      totalIncome += bill.amount
      categoryIncome[bill.category] = (categoryIncome[bill.category] || 0) + bill.amount
    } else {
      totalExpense += bill.amount
      categoryExpense[bill.category] = (categoryExpense[bill.category] || 0) + bill.amount
    }
  })

  const dailyMap = new Map<string, { expense: number; income: number }>()
  monthlyBills.forEach(bill => {
    const existing = dailyMap.get(bill.date) || { expense: 0, income: 0 }
    if (bill.type === BillType.Income) {
      existing.income += bill.amount
    } else {
      existing.expense += bill.amount
    }
    dailyMap.set(bill.date, existing)
  })

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryExpense: categoryExpense as Record<BillCategory, number>,
    categoryIncome: categoryIncome as Record<BillCategory, number>,
    dailyData
  }
}

// 统计数据
const statistics = computed<StatisticsData>(() => buildStatisticsForMonth(selectedMonth.value))

// 余额样式类
const balanceClass = computed(() => {
  return statistics.value.balance >= 0 ? 'income' : 'expense'
})

// 分类统计（支持支出和收入切换）
const statsData = computed(() => {
  const categoryData =
    statsTab.value === 'expense' ? statistics.value.categoryExpense : statistics.value.categoryIncome
  const total = statsTab.value === 'expense' ? statistics.value.totalExpense : statistics.value.totalIncome

  return Object.entries(categoryData)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as BillCategory,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0',
      ...CategoryConfigMap[category as BillCategory]
    }))
    .sort((a, b) => b.amount - a.amount)
})

const getRecentMonths = (count: number) => {
  const list: { label: string; value: string }[] = []
  const now = new Date()
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = getYearMonth(date)
    list.push({ label: formatYearMonthLabel(value), value })
  }
  return list
}

// 显示日期选择器
const showMonthSheet = ref(false)

const monthOptions = computed(() => getRecentMonths(12))

const handleMonthSelect = (option: { label: string; value?: string }) => {
  if (option.value) {
    selectedMonth.value = option.value
  }
}

const showDatePicker = () => {
  showMonthSheet.value = true
}

const trendChart = ref<unknown>(null)
const pieChart = ref<unknown>(null)

const getCanvasSize = (canvasId: string, callback: (width: number, height: number) => void) => {
  if (!instanceProxy) return
  const query = uni.createSelectorQuery().in(instanceProxy)
  query
    .select(`#${canvasId}`)
    .fields({ size: true }, () => {})
    .exec(res => {
      if (!res || !res[0]) {
        console.warn(`Canvas ${canvasId} not found`)
        return
      }
      let { width, height } = res[0]
      if (!width || !height) {
        // 备用方案：使用窗口宽度
        const systemInfo = uni.getSystemInfoSync()
        width = systemInfo.windowWidth - 32 // 减去 padding
        height = canvasId === 'trendChart' ? 280 : 280
      }
      callback(width, height)
    })
}

const buildTrendChartData = () => {
  const dailyData = statistics.value.dailyData.slice(-7)
  const categories = dailyData.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}-${date.getDate()}`
  })
  const expenses = dailyData.map(item => item.expense)
  const incomes = dailyData.map(item => item.income)

  return {
    categories,
    series: [
      { name: '支出', data: expenses, color: '#EF4444' },
      { name: '收入', data: incomes, color: '#10B981' }
    ]
  }
}

const buildPieChartData = () => {
  const categoryExpense = statistics.value.categoryExpense
  const total = statistics.value.totalExpense

  const categoryList = Object.entries(categoryExpense)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as BillCategory,
      amount,
      ...CategoryConfigMap[category as BillCategory]
    }))
    .sort((a, b) => b.amount - a.amount)

  const series = categoryList.map(item => ({
    name: item.label,
    data: Number(item.amount.toFixed(2)),
    color: item.color
  }))

  if (series.length === 0) {
    return {
      series: [{ name: '暂无数据', data: 1, color: '#334155' }],
      hasData: false
    }
  }

  return { series, hasData: true }
}

// 初始化趋势图表
const initTrendChart = () => {
  const { categories, series } = buildTrendChartData()
  getCanvasSize('trendChart', (width, height) => {
    const context = uni.createCanvasContext('trendChart', instanceProxy)
    const pixelRatio = uni.getSystemInfoSync().pixelRatio || 1
    trendChart.value = new uCharts({
      type: 'line',
      canvasId: 'trendChart',
      context,
      width,
      height,
      categories,
      series,
      legend: {
        show: true,
        position: 'bottom',
        float: 'center',
        fontSize: 10
      },
      xAxis: {
        disableGrid: true,
        axisLine: true,
        fontSize: 10,
      },
      yAxis: {
        gridType: 'dash',
        fontSize: 10
      },
      dataLabel: false,
      dataPointShape: false,
      extra: {
        line: {
          type: 'curve'
        }
      },
      animation: true,
      background: 'rgba(0,0,0,0)',
      pixelRatio,
      clickable: true
    })
  })
}

// 初始化圆环图
const initPieChart = () => {
  const { series, hasData } = buildPieChartData()
  getCanvasSize('pieChart', (width, height) => {
    const context = uni.createCanvasContext('pieChart', instanceProxy)
    const pixelRatio = uni.getSystemInfoSync().pixelRatio || 1
    pieChart.value = new uCharts({
      type: 'ring',
      canvasId: 'pieChart',
      context,
      width,
      height,
      series,
      legend: {
        show: hasData,
        position: 'bottom',
        float: 'center',
        fontSize: 10
      },
      dataLabel: hasData,
      padding: [0, 0, 0, 0],
      extra: {
        ring: {
          activeRadius: 8
        }
      },
      animation: true,
      background: 'rgba(0,0,0,0)',
      pixelRatio,
      clickable: true
    })
  })
}

watch(
  [selectedMonth, () => billStore.bills],
  async () => {
    await nextTick()
    setTimeout(() => {
      initTrendChart()
      initPieChart()
    }, 50)
  },
  { deep: true }
)

onMounted(() => {
  billStore.loadBills()

  setTimeout(() => {
    initTrendChart()
    initPieChart()
  }, 200)

  // 监听屏幕方向改变
  uni.onWindowResize(() => {
    setTimeout(() => {
      initTrendChart()
      initPieChart()
    }, 100)
  })
})
</script>

<style scoped>
.statistics-container {
  min-height: calc(100vh - 51px);
  background: var(--bg-primary);
  padding-top: 32rpx;
}

/* 导航栏 */
.custom-navbar {
  padding: calc(var(--status-bar-height) + 24rpx) 40rpx 24rpx;
  margin: 0 32rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-main);
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: var(--bg-tertiary);
  border-radius: 16rpx;
  cursor: pointer;
  color: var(--text-main);
  font-size: 28rpx;
}

/* 概览卡片 */
.overview-card {
  margin: 0 32rpx 48rpx;
  padding: 48rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.overview-item {
  flex: 1;
  text-align: center;
}

.overview-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.overview-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
}

.overview-value.income {
  color: var(--success-color);
}

.overview-value.expense {
  color: var(--error-color);
}

.overview-divider {
  width: 1px;
  height: 80rpx;
  background: var(--border-color);
}

/* 图表区域 */
.chart-section {
  margin: 0 32rpx 48rpx;
  padding: 32rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 24rpx;
}

.chart-container {
  width: 100%;
  height: 560rpx;
  overflow: hidden;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 分类统计 */
.category-stats {
  margin: 0 32rpx 48rpx;
  padding: 40rpx;
}

.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.tab-btn {
  flex: 1;
  padding: 20rpx 24rpx;
  background: var(--bg-tertiary);
  border-radius: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  gap: 24rpx;
}

.stat-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 120rpx;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 48rpx;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-main);
  font-weight: 500;
}

.stat-percentage {
  font-size: 20rpx;
  color: var(--text-secondary);
}

.stat-bar-container {
  flex: 1;
  height: 24rpx;
}

.stat-bar {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  border-radius: 12rpx;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 12rpx;
  transition: width var(--transition-base);
}

.stat-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  width: 120rpx;
  text-align: right;
  flex-shrink: 0;
}
</style>
