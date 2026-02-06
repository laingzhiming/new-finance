<template>
  <view class="statistics-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar glass-card">
      <text class="navbar-title">数据统计</text>
      <view class="date-selector" @click="showDatePicker">
        <text>{{ currentMonth }}</text>
        <text class="icon">📅</text>
      </view>
    </view>

    <!-- 概览卡片 -->
    <view class="overview-card glass-card">
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
    <view class="chart-section glass-card">
      <text class="section-title">支出趋势</text>
      <view class="chart-container">
        <canvas type="2d" id="trendChart" class="chart-canvas"></canvas>
      </view>
    </view>

    <!-- 分类占比 -->
    <view class="chart-section glass-card">
      <text class="section-title">分类占比</text>
      <view class="chart-container">
        <canvas type="2d" id="pieChart" class="chart-canvas"></canvas>
      </view>
    </view>

    <!-- 分类明细 -->
    <view class="category-detail glass-card">
      <text class="section-title">分类明细</text>
      <view v-for="(item, index) in categoryDetails" :key="index" class="detail-item">
        <view class="detail-left">
          <text class="detail-icon">{{ item.icon }}</text>
          <text class="detail-label">{{ item.label }}</text>
        </view>
        <view class="detail-right">
          <text class="detail-amount">¥{{ item.amount.toFixed(2) }}</text>
          <text class="detail-percentage">{{ item.percentage }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type { StatisticsData } from '@/types'
import { CategoryConfigMap, BillCategory } from '@/types'
import { useBillStore } from '@/stores/bill'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'

// 注册 ECharts 组件
echarts.use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const billStore = useBillStore()

// 当前月份
const currentMonth = ref<string>('')

// 统计数据
const statistics = computed<StatisticsData>(() => billStore.statistics)

// 余额样式类
const balanceClass = computed(() => {
  return statistics.value.balance >= 0 ? 'income' : 'expense'
})

// 分类明细
const categoryDetails = computed(() => {
  const categoryExpense = statistics.value.categoryExpense
  const total = statistics.value.totalExpense

  return Object.entries(categoryExpense)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as BillCategory,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0',
      ...CategoryConfigMap[category as BillCategory]
    }))
    .sort((a, b) => b.amount - a.amount)
})

// 显示日期选择器
const showDatePicker = () => {
  // TODO: 实现日期选择器
  uni.showToast({
    title: '日期选择功能开发中',
    icon: 'none'
  })
}

// 初始化趋势图表
const initTrendChart = () => {
  const query = uni.createSelectorQuery()
  query
    .select('#trendChart')
    .fields({ node: true, size: true }, () => {})
    .exec(res => {
      if (!res || !res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')

      // 设置 canvas 尺寸
      const dpr = uni.getSystemInfoSync().pixelRatio || 1
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr

      // 初始化 ECharts
      const chart = echarts.init(canvas, null, {
        width: res[0].width,
        height: res[0].height,
        devicePixelRatio: dpr
      })

      // 准备数据
      const dailyData = statistics.value.dailyData.slice(-7) // 最近7天
      const dates = dailyData.map(item => {
        const date = new Date(item.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
      const expenses = dailyData.map(item => item.expense)
      const incomes = dailyData.map(item => item.income)

      // 配置图表
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: 10,
          right: 10,
          top: 30,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          },
          axisLabel: {
            color: '#ADB5BD',
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#ADB5BD',
            fontSize: 10
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '支出',
            type: 'line',
            data: expenses,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#EF4444',
              width: 3
            },
            itemStyle: {
              color: '#EF4444'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                  { offset: 1, color: 'rgba(239, 68, 68, 0)' }
                ]
              }
            }
          },
          {
            name: '收入',
            type: 'line',
            data: incomes,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#10B981',
              width: 3
            },
            itemStyle: {
              color: '#10B981'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                  { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                ]
              }
            }
          }
        ]
      }

      chart.setOption(option)
    })
}

// 初始化饼图
const initPieChart = () => {
  const query = uni.createSelectorQuery()
  query
    .select('#pieChart')
    .fields({ node: true, size: true }, () => {})
    .exec(res => {
      if (!res || !res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')

      const dpr = uni.getSystemInfoSync().pixelRatio || 1
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr

      const chart = echarts.init(canvas, null, {
        width: res[0].width,
        height: res[0].height,
        devicePixelRatio: dpr
      })

      // 准备数据
      const data = categoryDetails.value.map(item => ({
        name: item.label,
        value: item.amount,
        itemStyle: {
          color: item.color
        }
      }))

      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['50%', '50%'], // 确保居中
            data,
            avoidLabelOverlap: true, // 防止标签重叠
            label: {
              show: true,
              color: '#F8F9FA',
              fontSize: 12,
              formatter: '{b}\n{d}%',
              position: 'outside', // 文字移到外部
              lineHeight: 16
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      chart.setOption(option)
    })
}

// 更新当前月份显示
const updateCurrentMonth = () => {
  const now = new Date()
  currentMonth.value = `${now.getFullYear()}年${now.getMonth() + 1}月`
}

onMounted(() => {
  updateCurrentMonth()
  billStore.loadBills()

  // 延迟初始化图表，确保DOM渲染完成
  setTimeout(() => {
    initTrendChart()
    initPieChart()
  }, 500)
})
</script>

<style scoped>
.statistics-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

/* 导航栏 */
.custom-navbar {
  padding: calc(var(--status-bar-height) + 12px) 20px 12px;
  margin: 16px 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-main);
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-main);
  font-size: 14px;
}

/* 概览卡片 */
.overview-card {
  margin: 0 16px 24px;
  padding: 24px;
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
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.overview-value {
  display: block;
  font-size: 20px;
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
  height: 40px;
  background: var(--border-color);
}

/* 图表区域 */
.chart-section {
  margin: 0 16px 24px;
  padding: 16px;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12px;
}

.chart-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 分类明细 */
.category-detail {
  margin: 0 16px 24px;
  padding: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 24px;
}

.detail-label {
  font-size: 14px;
  color: var(--text-main);
}

.detail-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.detail-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.detail-percentage {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
