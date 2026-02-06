<template>
  <view class="notfound-container slide-in-up">
    <view class="notfound-card glass-card">
      <text class="notfound-title">404</text>
      <text class="notfound-subtitle">页面未找到</text>
      <text class="notfound-desc">你访问的页面不存在或已被移除</text>
      <view class="notfound-actions">
        <view class="action-btn primary" @click="goHome">
          <text>返回首页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const goHome = () => {
  uni.switchTab({
    url: '/pages/index'
  })
}
</script>

<style scoped>
.notfound-container {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.notfound-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
  padding: 32px 24px;
}

.notfound-title {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--text-main);
}

.notfound-subtitle {
  display: block;
  font-size: 18px;
  color: var(--text-secondary);
  margin: 8px 0 12px;
}

.notfound-desc {
  display: block;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.notfound-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
}

.action-btn.primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-glow);
}
</style>
