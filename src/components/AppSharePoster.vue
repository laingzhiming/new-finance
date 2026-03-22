<template>
  <view class="poster-wrap glass-card">
    <canvas canvas-id="sharePosterCanvas" id="sharePosterCanvas" class="poster-canvas" @touchstart.stop />
    <view class="actions">
      <button class="btn-save" @click="onSave">保存海报</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import type { Ref } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  imageSrc?: string
  footer?: string
  width?: number
  height?: number
  backgroundColor?: string
}>()

const emit = defineEmits<{
  (e: 'update:busy', busy: boolean): void
  (e: 'save-success', payload: { filePath: string }): void
  (e: 'save-fail', payload: { error: any }): void
}>()

const canvasId = 'sharePosterCanvas'
const instance = getCurrentInstance()
const width = props.width ?? 750
const height = props.height ?? 1334
const busy = ref(false) as Ref<boolean>

const drawPoster = async () => {
  try {
    const ctx = uni.createCanvasContext(canvasId, instance?.proxy)
    // 背景
    ctx.setFillStyle(props.backgroundColor ?? '#ffffff')
    ctx.fillRect(0, 0, width, height)

    // 若有图片，尝试获取并绘制
    if (props.imageSrc) {
      try {
        const imgInfo = await new Promise<any>((resolve, reject) => {
          uni.getImageInfo({
            src: props.imageSrc as string,
            success: res => resolve(res),
            fail: err => reject(err)
          })
        })
        const iw = imgInfo.width
        const ih = imgInfo.height
        // 简单铺满处理：保持比例居中
        ctx.drawImage(imgInfo.path, 0, 0, width, Math.round((ih / iw) * width))
      } catch (e) {
        console.error('加载海报图片失败:', e)
      }
    }

    // 标题
    ctx.setFillStyle('#111827')
    ctx.setFontSize(36)
    ctx.fillText(props.title ?? '', 24, height - 260)

    // 副标题
    if (props.subtitle) {
      ctx.setFontSize(24)
      ctx.setFillStyle('#6b7280')
      ctx.fillText(props.subtitle, 24, height - 220)
    }

    // footer
    if (props.footer) {
      ctx.setFontSize(20)
      ctx.setFillStyle('#9ca3af')
      ctx.fillText(props.footer, 24, height - 40)
    }

    ctx.draw(false)
  } catch (e) {
    console.error('绘制海报失败:', e)
  }
}

const canvasToTempFilePath = (_opts: any) => {
  return new Promise<any>((resolve, reject) => {
    try {
      uni.canvasToTempFilePath({
        canvasId,
        success: res => resolve(res),
        fail: err => reject(err)
      }, instance?.proxy)
    } catch (e) {
      reject(e)
    }
  })
}

const saveImageToPhotosAlbum = (filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: err => reject(err)
      })
    } catch (e) {
      reject(e)
    }
  })
}

const onSave = async () => {
  if (busy.value) return
  busy.value = true
  emit('update:busy', true)
  try {
    await drawPoster()
    const tmp = await canvasToTempFilePath({})
    const filePath = tmp.tempFilePath || tmp.filePath || tmp
    try {
      await saveImageToPhotosAlbum(filePath)
      emit('save-success', { filePath })
    } catch (err) {
      console.error('保存图片失败:', err)
      emit('save-fail', { error: err })
    }
  } catch (e) {
    console.error('导出海报失败:', e)
    emit('save-fail', { error: e })
  } finally {
    busy.value = false
    emit('update:busy', false)
  }
}

onMounted(() => {
  // 初始化绘制
  drawPoster()
})
</script>

<style scoped>
.poster-wrap {
  width: 100%;
  padding: 24rpx;
}
.poster-canvas {
  width: 690rpx;
  height: 1220rpx;
  border-radius: 16rpx;
  background: #fff;
}
.actions {
  margin-top: 24rpx;
  display: flex;
  justify-content: center;
}
.btn-save {
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
  color: #fff;
}
</style>
