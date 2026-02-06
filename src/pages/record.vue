<template>
  <view class="record-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar glass-card">
      <text class="navbar-title">{{ isExpense ? '支出记账' : '收入记账' }}</text>
      <view class="type-switch">
        <view
          class="switch-btn"
          :class="{ active: isExpense }"
          @click="switchType(BillType.Expense)"
        >
          <text>支出</text>
        </view>
        <view
          class="switch-btn"
          :class="{ active: !isExpense }"
          @click="switchType(BillType.Income)"
        >
          <text>收入</text>
        </view>
      </view>
    </view>

    <!-- 金额显示 -->
    <view class="amount-display glass-card neon-glow">
      <text class="currency-symbol">¥</text>
      <text class="amount-text">{{ displayAmount || '0.00' }}</text>
    </view>

    <!-- 分类选择 -->
    <view class="category-section glass-card">
      <text class="section-label">选择分类</text>
      <view class="category-grid">
        <view
          v-for="(config, category) in CategoryConfigMap"
          :key="category"
          class="category-item"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >
          <text class="category-icon">{{ config.icon }}</text>
          <text class="category-label">{{ config.label }}</text>
        </view>
      </view>
    </view>

    <!-- 备注输入 -->
    <view class="remark-section glass-card">
      <text class="section-label">备注</text>
      <input
        v-model="remark"
        class="remark-input"
        placeholder="添加备注..."
        placeholder-class="placeholder"
        maxlength="50"
      />
    </view>

    <!-- 自定义数字键盘 -->
    <view class="keyboard glass-card">
      <view class="keyboard-row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
        <view
          v-for="key in row"
          :key="key"
          class="key-btn"
          :class="{
            'key-special': key === '.' || key === 'DEL',
            'key-confirm': key === 'OK'
          }"
          @click="handleKeyPress(key)"
        >
          <text class="key-text">{{ key }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type { BillItem } from '@/types'
import { BillCategory, BillType, CategoryConfigMap } from '@/types'
import { useBillStore } from '@/stores/bill'
import { generateId } from '@/utils/helpers'

const billStore = useBillStore()

// 账单类型
const billType = ref<BillType>(BillType.Expense)
const isExpense = computed(() => billType.value === BillType.Expense)

// 金额输入
const amount = ref<string>('')
const displayAmount = computed(() => {
  if (!amount.value) return ''
  const num = parseFloat(amount.value)
  return isNaN(num) ? amount.value : num.toFixed(2)
})

// 选中的分类
const selectedCategory = ref<BillCategory>(BillCategory.Food)

// 备注
const remark = ref<string>('')

// 键盘布局
const keyboardLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'DEL'],
  ['OK']
]

// 切换收支类型
const switchType = (type: BillType) => {
  billType.value = type
}

// 选择分类
const selectCategory = (category: string) => {
  selectedCategory.value = category as BillCategory
}

// 处理按键
const handleKeyPress = (key: string) => {
  if (key === 'OK') {
    confirmBill()
    return
  }

  if (key === 'DEL') {
    amount.value = amount.value.slice(0, -1)
    return
  }

  // 限制小数点
  if (key === '.') {
    if (amount.value.includes('.')) return
    if (!amount.value) {
      amount.value = '0.'
      return
    }
  }

  // 限制金额长度
  if (amount.value.length >= 10) return

  // 限制小数位数
  if (amount.value.includes('.')) {
    const parts = amount.value.split('.')
    if (parts[1]?.length >= 2) return
  }

  amount.value += key

  // 添加缩放动画效果
  animateKey(key)
}

// 按键动画
const animateKey = (_key: string) => {
  // 触发轻微震动反馈 (仅移动端)
  try {
    uni.vibrateShort({
      type: 'light'
    })
  } catch (e) {
    console.log('Vibration not supported')
  }
}

// 确认添加账单
const confirmBill = () => {
  const amountValue = parseFloat(amount.value)

  if (!amountValue || amountValue <= 0) {
    uni.showToast({
      title: '请输入有效金额',
      icon: 'none'
    })
    return
  }

  if (!selectedCategory.value) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return
  }

  const now = Date.now()
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

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

  billStore.addBill(bill)

  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })

  // 重置表单
  setTimeout(() => {
    resetForm()
  }, 500)
}

// 重置表单
const resetForm = () => {
  amount.value = ''
  remark.value = ''
  selectedCategory.value = BillCategory.Food
}

// 页面加载时获取URL参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.$route?.query || currentPage.options || {}

  if (options.type === 'income') {
    billType.value = BillType.Income
  }
})
</script>

<style scoped>
.record-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
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

.type-switch {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 4px;
}

.switch-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all var(--transition-base);
  cursor: pointer;
}

.switch-btn.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-glow);
}

/* 金额显示 */
.amount-display {
  margin: 0 16px 20px;
  padding: 40px 24px;
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.currency-symbol {
  font-size: 32px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.amount-text {
  font-size: 56px;
  font-weight: bold;
  color: var(--text-main);
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

/* 分类选择 */
.category-section {
  margin: 0 16px 20px;
  padding: 20px;
}

.section-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
}

.category-item:active {
  transform: scale(0.95);
}

.category-item.active {
  border-color: var(--primary-color);
  background: var(--glass-bg);
  box-shadow: var(--shadow-glow);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.category-label {
  font-size: 12px;
  color: var(--text-main);
}

/* 备注输入 */
.remark-section {
  margin: 0 16px 20px;
  padding: 20px;
}

.remark-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  border: 1px solid transparent;
  transition: all var(--transition-base);
}

.remark-input:focus {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-glow);
}

.placeholder {
  color: var(--text-muted);
}

/* 数字键盘 */
.keyboard {
  margin: 0 16px;
  padding: 16px;
}

.keyboard-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.keyboard-row:last-child {
  margin-bottom: 0;
}

.key-btn {
  flex: 1;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.key-btn:active {
  transform: scale(0.95);
  background: var(--glass-bg);
}

.key-special {
  background: var(--bg-secondary);
}

.key-confirm {
  background: var(--gradient-primary);
  box-shadow: var(--shadow-glow);
}

.key-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
}

.key-confirm .key-text {
  color: white;
  font-size: 20px;
}
</style>
