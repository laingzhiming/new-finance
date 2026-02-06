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
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Theme } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import { useBillStore } from '@/stores/bill'

const settingsStore = useSettingsStore()
const billStore = useBillStore()

// 当前主题
const currentTheme = computed(() => settingsStore.settings.theme)

// 设置
const settings = computed(() => settingsStore.settings)

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

// 显示货币选择器
const showCurrencyPicker = () => {
  uni.showActionSheet({
    itemList: ['¥ 人民币', '$ 美元', '€ 欧元', '£ 英镑'],
    success: res => {
      const currencies = ['¥', '$', '€', '£']
      settingsStore.setCurrency(currencies[res.tapIndex])
    }
  })
}

// 切换通知
const toggleNotification = (e: any) => {
  settingsStore.setNotification(e.detail.value)
}

// 导出数据
const exportData = () => {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

// 导入数据
const importData = () => {
  uni.showToast({
    title: '导入功能开发中',
    icon: 'none'
  })
}

// 清空数据
const clearData = () => {
  uni.showModal({
    title: '确认清空',
    content: '此操作将删除所有账单数据，且无法恢复。确定继续吗？',
    confirmText: '确定',
    confirmColor: '#EF4444',
    success: res => {
      if (res.confirm) {
        billStore.clearAllBills()
        uni.showToast({
          title: '数据已清空',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 导航栏 */
.custom-navbar {
  padding: calc(var(--status-bar-height) + 12px) 20px 12px;
  margin: 16px 16px 20px;
}

.navbar-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-main);
}

/* 设置区块 */
.settings-section {
  margin: 0 16px 20px;
  padding: 20px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
}

/* 主题选项 */
.theme-options {
  display: flex;
  justify-content: space-between;
  gap: 12px;
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
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 3px solid transparent;
  transition: all var(--transition-base);
}

.theme-option.active .theme-preview {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-glow);
}

.theme-icon {
  font-size: 32px;
}

.theme-name {
  font-size: 14px;
  color: var(--text-main);
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger .setting-label {
  color: var(--error-color);
}

.setting-label {
  font-size: 14px;
  color: var(--text-main);
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.arrow {
  font-size: 20px;
  color: var(--text-secondary);
}

/* 关于信息 */
.about-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 8px;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.app-version {
  font-size: 12px;
  color: var(--text-secondary);
}

.app-desc {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 8px;
}
</style>
