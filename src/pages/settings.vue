<template>
  <view class="settings-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar glass-card slide-in-down">
      <text class="navbar-title">设置</text>
    </view>

    <!-- 主题切换 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">主题设置</text>
      <view class="theme-options">
        <view
          v-for="themeOption in themeOptions"
          :key="themeOption.value"
          class="theme-option"
          :class="{ active: currentTheme === themeOption.value }"
          @click="changeTheme(themeOption.value)"
        >
          <view class="theme-preview" :style="{ background: themeOption.color }">
            <text class="theme-icon">{{ themeOption.icon }}</text>
          </view>
          <text class="theme-name">{{ themeOption.label }}</text>
        </view>
      </view>
    </view>

    <!-- 货币设置 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">货币设置</text>
      <view class="setting-item" @click="showCurrencyPicker">
        <text class="setting-label">货币符号</text>
        <view class="setting-value">
          <text>{{ settings.currency }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">通知设置</text>
      <view class="setting-item">
        <text class="setting-label">启用通知</text>
        <switch
          :checked="settings.notificationEnabled"
          @change="toggleNotification"
          color="#6366F1"
        />
      </view>
    </view>

    <!-- 超支预警设置 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">超支预警</text>
      <view class="setting-item">
        <text class="setting-label">启用月度预警</text>
        <switch :checked="overspendEnabled" @change="toggleOverspend" color="#FF6B6B" />
      </view>
      <view class="setting-item threshold-row">
        <text class="setting-label">月度阈值</text>
        <view class="threshold-input-wrap">
          <input class="threshold-input" type="number" v-model.number="overspendThreshold" placeholder="输入阈值（元）" />
          <text class="threshold-unit">元</text>
        </view>
      </view>
      <view class="setting-item">
        <button class="btn-primary" @click="saveOverspendSettings">保存超支设置</button>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">数据管理</text>
      <view class="setting-item" @click="exportData">
        <text class="setting-label">导出数据</text>
        <text class="arrow">›</text>
      </view>
      <view class="setting-item" @click="importData">
        <text class="setting-label">导入数据</text>
        <text class="arrow">›</text>
      </view>
      <view class="setting-item danger" @click="clearData">
        <text class="setting-label">清空数据</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="settings-section glass-card slide-in-up">
      <text class="section-title">关于</text>
      <view class="about-info">
        <text class="app-name">Neo-Finance TS Pro</text>
        <text class="app-version">版本 1.0.0</text>
        <text class="app-desc">酷炫风多端费用统计系统</text>
      </view>
    </view>
    <AppActionSheet
      v-model="showCurrencySheet"
      title="选择货币"
      :options="currencyOptions"
      @select="handleCurrencySelect"
    />
    <AppModal
      v-model="showModal"
      :title="modalTitle"
      :content="modalContent"
      :confirmText="modalConfirmText"
      :cancelText="modalCancelText"
      :showCancel="modalShowCancel"
      :danger="modalDanger"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import { Theme } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import { useBillStore } from '@/stores/bill'
import AppActionSheet from '@/components/AppActionSheet.vue'
import AppModal from '@/components/AppModal.vue'

const settingsStore = useSettingsStore()
const billStore = useBillStore()

// 当前主题
const currentTheme = computed(() => settingsStore.settings.theme)

// 设置
const settings = computed(() => settingsStore.settings)

const showModal = ref(false)
const modalTitle = ref('')
const modalContent = ref('')
const modalConfirmText = ref('确定')
const modalCancelText = ref('取消')
const modalShowCancel = ref(true)
const modalDanger = ref(false)
let modalConfirmHandler: (() => void) | null = null

const openModal = (options: {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  danger?: boolean
  onConfirm?: () => void
}) => {
  modalTitle.value = options.title
  modalContent.value = options.content
  modalConfirmText.value = options.confirmText ?? '确定'
  modalCancelText.value = options.cancelText ?? '取消'
  modalShowCancel.value = options.showCancel ?? true
  modalDanger.value = options.danger ?? false
  modalConfirmHandler = options.onConfirm ?? null
  showModal.value = true
}

const handleModalConfirm = () => {
  const handler = modalConfirmHandler
  modalConfirmHandler = null
  showModal.value = false
  handler?.()
}

const handleModalCancel = () => {
  modalConfirmHandler = null
  showModal.value = false
}

// 主题选项
const themeOptions = [
  {
    value: Theme.Dark,
    label: '深色',
    icon: '🌙',
    color: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
  },
  {
    value: Theme.Cyberpunk,
    label: '赛博朋克',
    icon: '⚡',
    color: 'linear-gradient(135deg, #00F0FF 0%, #FF00FF 100%)'
  },
  {
    value: Theme.Light,
    label: '浅色',
    icon: '☀️',
    color: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
  }
]

// 切换主题
const changeTheme = (theme: Theme) => {
  settingsStore.setTheme(theme)

  uni.showToast({
    title: '主题已切换',
    icon: 'success'
  })
}

const showCurrencySheet = ref(false)
const currencyOptions = [
  { label: '¥ 人民币', value: '¥' },
  { label: '$ 美元', value: '$' },
  { label: '€ 欧元', value: '€' },
  { label: '£ 英镑', value: '£' }
]

// 显示货币选择器
const showCurrencyPicker = () => {
  showCurrencySheet.value = true
}

const handleCurrencySelect = (option: { value?: string }) => {
  if (option.value) {
    settingsStore.setCurrency(option.value)
  }
}

// 切换通知
const toggleNotification = (e: any) => {
  settingsStore.setNotification(e.detail.value)
}

const buildExportPayload = () => {
  return {
    version: 1,
    exportedAt: Date.now(),
    bills: billStore.bills,
    settings: settingsStore.settings
  }
}

// 导出数据
const exportData = () => {
  const payload = buildExportPayload()
  uni.setClipboardData({
    data: JSON.stringify(payload),
    success: () => {
      openModal({
        title: '导出成功',
        content: '数据已复制到剪贴板，可保存到安全位置。',
        showCancel: false,
        confirmText: '知道了'
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  })
}

const applyImportedData = (payload: any) => {
  if (!payload || !Array.isArray(payload.bills)) {
    uni.showToast({
      title: '导入数据格式不正确',
      icon: 'none'
    })
    return
  }

  billStore.bills = payload.bills
  billStore.saveBills()

  if (payload.settings) {
    settingsStore.replaceSettings(payload.settings)
  }

  uni.showToast({
    title: '导入成功',
    icon: 'success'
  })
}

// 导入数据
const importData = () => {
  uni.getClipboardData({
    success: res => {
      let payload: any
      try {
        payload = JSON.parse(res.data)
      } catch (e) {
        uni.showToast({
          title: '剪贴板内容不是有效JSON',
          icon: 'none'
        })
        return
      }

      openModal({
        title: '确认导入',
        content: '导入将覆盖当前账单数据，是否继续？',
        confirmText: '继续',
        onConfirm: () => applyImportedData(payload)
      })
    },
    fail: () => {
      uni.showToast({
        title: '读取剪贴板失败',
        icon: 'none'
      })
    }
  })
}

// 清空数据
const clearData = () => {
  openModal({
    title: '确认清空',
    content: '此操作将删除所有账单数据，且无法恢复。确定继续吗？',
    confirmText: '确定',
    danger: true,
    onConfirm: () => {
      billStore.clearAllBills()
      uni.showToast({
        title: '数据已清空',
        icon: 'success'
      })
    }
  })
}

// 超支预警配置相关
const overspendEnabled = ref(false)
const overspendThreshold = ref(0)

onMounted(() => {
  // 加载账单与超支配置
  billStore.loadBills()
  billStore.loadOverspendConfig()
  const cfg = billStore.overspendConfig
  if (cfg) {
    overspendEnabled.value = !!cfg.enabled
    // cfg.monthlyThreshold 存为分，UI 显示元
    overspendThreshold.value = (cfg.monthlyThreshold || 0) / 100
  }
})

const saveOverspendSettings = () => {
  const cfg = {
    enabled: overspendEnabled.value,
    // 存为分（整数）以提高精度
    monthlyThreshold: Math.round((Number(overspendThreshold.value) || 0) * 100),
    lastNotifiedMonth: billStore.overspendConfig?.lastNotifiedMonth
  }
  billStore.saveOverspendConfig(cfg)
  uni.showToast({ title: '已保存超支设置', icon: 'success' })
}

const toggleOverspend = (e: any) => {
  overspendEnabled.value = e.detail?.value ?? !!e.detail
}
</script>

<style scoped>
.settings-container {
  min-height: calc(100vh - 51px);
  background: var(--bg-primary);
  padding-top: 32rpx;
}

/* 导航栏 */
.custom-navbar {
  padding: calc(var(--status-bar-height) + 24rpx) 40rpx 24rpx;
  margin: 0 32rpx 40rpx;
}

.navbar-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-main);
}

/* 设置区块 */
.settings-section {
  margin: 0 32rpx 40rpx;
  padding: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 32rpx;
}

/* 主题选项 */
.theme-options {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.theme-option:active {
  transform: scale(0.95);
}

.theme-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  border: 3px solid transparent;
  transition: all var(--transition-base);
}

.theme-option.active .theme-preview {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-glow);
}

.theme-icon {
  font-size: 64rpx;
}

.theme-name {
  font-size: 28rpx;
  color: var(--text-main);
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.threshold-row .threshold-input-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.threshold-input {
  width: 240rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  border: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
  color: var(--text-main);
}

.threshold-unit {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger .setting-label {
  color: var(--error-color);
}

.setting-label {
  font-size: 28rpx;
  color: var(--text-main);
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: var(--text-secondary);
  font-size: 28rpx;
}

.arrow {
  font-size: 40rpx;
  color: var(--text-secondary);
}

/* 关于信息 */
.about-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: 16rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.app-version {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.app-desc {
  font-size: 28rpx;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 16rpx;
}
</style>
