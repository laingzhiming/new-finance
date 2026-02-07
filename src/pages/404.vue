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
  min-height: calc(100vh - 51px);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.notfound-card {
  width: 100%;
  max-width: 720rpx;
  text-align: center;
  padding: 64rpx 48rpx;
}

.notfound-title {
  font-size: 128rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  color: var(--text-main);
}

.notfound-subtitle {
  display: block;
  font-size: 36rpx;
  color: var(--text-secondary);
  margin: 16rpx 0 24rpx;
}

.notfound-desc {
  display: block;
  font-size: 28rpx;
  color: var(--text-muted);
  margin-bottom: 40rpx;
}

.notfound-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 20rpx 36rpx;
  border-radius: 24rpx;
  background: var(--bg-tertiary);
  color: var(--text-main);
  font-size: 28rpx;
  cursor: pointer;
}

.action-btn.primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-glow);
}
</style>
