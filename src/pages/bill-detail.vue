<template>
  <view class="detail-container">
    <view class="custom-navbar glass-card slide-in-down">
      <text class="navbar-title">账单详情</text>
    </view>

    <view v-if="bill" class="detail-card glass-card slide-in-up">
      <view class="detail-amount" :class="bill.type === BillType.Expense ? 'expense' : 'income'">
        {{ bill.type === BillType.Expense ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
      </view>

      <view class="detail-row">
        <text class="label">类型</text>
        <text class="value">{{ bill.type === BillType.Expense ? '支出' : '收入' }}</text>
      </view>
      <view class="detail-row">
        <text class="label">分类</text>
        <text class="value">{{ categoryLabel }} {{ categoryIcon }}</text>
      </view>
      <view class="detail-row">
        <text class="label">日期</text>
        <text class="value">{{ bill.date }}</text>
      </view>
      <view class="detail-row">
        <text class="label">备注</text>
        <text class="value">{{ bill.remark || '无备注' }}</text>
      </view>
    </view>

    <view v-else class="empty-card glass-card slide-in-up">
      <text>账单不存在或已删除</text>
    </view>

    <view class="action-bar slide-in-up">
      <view class="action-btn" @tap="goBack">
        <text>返回</text>
      </view>
      <view class="action-btn danger" :class="{ disabled: !bill }" @tap="deleteBill">
        <text>删除</text>
      </view>
    </view>
    <AppModal
      v-model="showModal"
      title="确认删除"
      content="删除后无法恢复，确定继续吗？"
      confirmText="删除"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="handleModalCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { BillItem } from '@/types'
import { BillType, CategoryConfigMap } from '@/types'
import { useBillStore } from '@/stores/bill'
import AppModal from '@/components/AppModal.vue'

const billStore = useBillStore()
const bill = ref<BillItem | null>(null)
const showModal = ref(false)

const categoryLabel = computed(() => {
  if (!bill.value) return ''
  return CategoryConfigMap[bill.value.category]?.label || '其他'
})

const categoryIcon = computed(() => {
  if (!bill.value) return ''
  return CategoryConfigMap[bill.value.category]?.icon || '📝'
})

const goBack = () => {
  uni.navigateBack()
}

const deleteBill = () => {
  if (!bill.value) return
  showModal.value = true
}

const handleModalCancel = () => {
  showModal.value = false
}

const confirmDelete = () => {
  if (!bill.value) return
  showModal.value = false
  billStore.deleteBill(bill.value.id)
  uni.showToast({
    title: '已删除',
    icon: 'success'
  })
  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}

onLoad(options => {
  billStore.loadBills()
  const id = options?.id
  if (!id) return
  bill.value = billStore.bills.find(item => item.id === id) || null
})
</script>

<style scoped>
.detail-container {
  min-height: calc(100vh - 51px);
  background: var(--bg-primary);
  padding-top: 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.custom-navbar {
  padding: calc(var(--status-bar-height) + 24rpx) 40rpx 24rpx;
  margin: 0 32rpx 40rpx;
}

.navbar-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-main);
}

.detail-card {
  margin: 0 32rpx 40rpx;
  padding: 40rpx;
}

.detail-amount {
  font-size: 64rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32rpx;
}

.detail-amount.income {
  color: var(--success-color);
}

.detail-amount.expense {
  color: var(--error-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
  font-size: 26rpx;
}

.value {
  color: var(--text-main);
  font-size: 28rpx;
}

.empty-card {
  margin: 0 32rpx 40rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  color: var(--text-muted);
}

.action-bar {
  margin: 0 32rpx 40rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.action-btn {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: var(--bg-tertiary);
  color: var(--text-main);
  font-size: 28rpx;
  font-weight: 600;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.disabled {
  opacity: 0.5;
}
</style>
