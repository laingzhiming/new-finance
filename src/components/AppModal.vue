<template>
  <view v-if="modelValue" class="modal-mask" @tap="handleCancel">
    <view class="modal-panel glass-card" @tap.stop>
      <view class="modal-title">{{ title }}</view>
      <view class="modal-content">{{ content }}</view>
      <view class="modal-actions">
        <view v-if="showCancel" class="modal-btn" @tap="handleCancel">
          <text>{{ cancelText }}</text>
        </view>
        <view class="modal-btn" :class="{ danger }" @tap="handleConfirm">
          <text>{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-panel {
  width: calc(100% - 128rpx);
  border-radius: 36rpx;
  padding: 36rpx 32rpx 32rpx;
  border: 1px solid var(--border-color);
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.modal-content {
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.modal-btn {
  height: 76rpx;
  border-radius: 20rpx;
  background: var(--bg-tertiary);
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.modal-btn.danger {
  background: #ef4444;
  color: #fff;
}
</style>
