import { ref, watch, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

interface AnimationOptions {
  duration?: number
  decimals?: number
  easing?: (t: number) => number
}

/**
 * 数字滚动动画 Composable
 * 实现余额变动时的数字渐变效果
 */
export function useNumberAnimation(
  target: Ref<number> | ComputedRef<number>,
  options: AnimationOptions = {}
) {
  const {
    duration = 1000,
    decimals = 0,
    easing = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) // easeInOutQuad
  } = options

  const animatedValue = ref<string>('0')
  const startValue = ref<number>(0)
  const startTime = ref<number>(0)
  const rafId = ref<number | null>(null)

  const animate = (timestamp: number) => {
    if (!startTime.value) {
      startTime.value = timestamp
    }

    const elapsed = timestamp - startTime.value
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)

    const currentValue = startValue.value + (target.value - startValue.value) * easedProgress
    animatedValue.value = currentValue.toFixed(decimals)

    if (progress < 1) {
      rafId.value = requestAnimationFrame(animate)
    } else {
      startTime.value = 0
    }
  }

  const startAnimation = () => {
    if (rafId.value !== null) {
      cancelAnimationFrame(rafId.value)
    }
    startTime.value = 0
    startValue.value = parseFloat(animatedValue.value)
    rafId.value = requestAnimationFrame(animate)
  }

  watch(
    target,
    () => {
      startAnimation()
    },
    { immediate: true }
  )

  return {
    animatedValue: computed(() => animatedValue.value)
  }
}

/**
 * 主题切换 Composable
 */
export function useTheme() {
  const theme = ref<string>('dark')

  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  return {
    theme,
    setTheme
  }
}

/**
 * 页面生命周期 Composable
 */
export function usePageLifecycle(options: {
  onShow?: () => void
  onHide?: () => void
  onLoad?: (query?: any) => void
  onUnload?: () => void
}) {
  const { onShow, onHide, onLoad, onUnload } = options

  if (onShow) {
    uni.$on('onShow', onShow)
  }

  if (onHide) {
    uni.$on('onHide', onHide)
  }

  if (onLoad) {
    uni.$on('onLoad', onLoad)
  }

  if (onUnload) {
    uni.$on('onUnload', onUnload)
  }
}
