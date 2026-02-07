<template>
  <view v-if="modelValue" class="sheet-mask" @tap="handleCancel" @touchmove.stop>
    <view class="sheet-panel glass-card" @tap.stop @touchmove.stop>
      <view v-if="title" class="sheet-title">{{ title }}</view>
      <scroll-view class="sheet-options" scroll-y @touchmove.stop>
        <view
          v-for="(item, index) in options"
          :key="index"
          class="sheet-item"
          :class="{ danger: item.danger }"
          @tap="handleSelect(index)"
        >
          <text>{{ item.label }}</text>
        </view>
      </scroll-view>
      <view class="sheet-cancel" @tap="handleCancel">
        <text>{{ cancelText }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface SheetOption {
  label: string
  value?: string
  danger?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    options: SheetOption[]
    cancelText?: string
  }>(),
  {
    cancelText: '取消'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', option: SheetOption, index: number): void
  (e: 'cancel'): void
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleSelect = (index: number) => {
  const option = props.options[index]
  emit('update:modelValue', false)
  emit('select', option, index)
}
</script>

<style scoped>
.sheet-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.sheet-panel {
  width: calc(100% - 48rpx);
  margin: 0 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 36rpx;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.sheet-title {
  padding: 28rpx 24rpx;
  font-size: 28rpx;
  color: var(--text-secondary);
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.sheet-options {
  max-height: 50vh;
}

.sheet-item {
  padding: 28rpx 24rpx;
  text-align: center;
  color: var(--text-main);
  font-size: 30rpx;
  border-bottom: 1px solid var(--border-color);
}

.sheet-item:last-of-type {
  border-bottom: none;
}

.sheet-item.danger {
  color: #ef4444;
}

.sheet-cancel {
  margin-top: 20rpx;
  padding: 28rpx 24rpx;
  text-align: center;
  color: var(--text-main);
  font-size: 30rpx;
  border-top: 1px solid var(--border-color);
}
</style>
