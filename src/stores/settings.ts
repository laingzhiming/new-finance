import { defineStore } from 'pinia'
import type { UserSettings } from '@/types'
import { Theme } from '@/types'

interface SettingsState {
  settings: UserSettings
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: {
      theme: Theme.Dark,
      currency: '¥',
      language: 'zh-CN',
      notificationEnabled: true
    }
  }),

  actions: {
    // 设置主题
    setTheme(theme: Theme) {
      this.settings.theme = theme
      this.applyTheme(theme)
      this.saveSettings()
    },

    // 应用主题
    applyTheme(theme: Theme) {
      // 在 H5 环境下直接设置
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme)
      }

      if (typeof uni !== 'undefined' && typeof uni.setTabBarStyle === 'function') {
        const tabBarStyle = theme === Theme.Light 
          ? {
              color: '#64748b',
              selectedColor: '#4f46e5',
              backgroundColor: '#f1f5f9',
              borderStyle: 'black' as const
            }
          : theme === Theme.Cyberpunk
          ? {
              color: '#9ca3af',
              selectedColor: '#00f0ff',
              backgroundColor: '#0a0a0a',
              borderStyle: 'black' as const
            }
          : {
              color: '#9ca3af',
              selectedColor: '#818cf8',
              backgroundColor: '#0f172a',
              borderStyle: 'black' as const
            }

        // 使用 try-catch 并增加 fail 回调，防止在非 TabBar 页面调用报错
        try {
          uni.setTabBarStyle({
            ...tabBarStyle,
            fail: () => {
              // 忽略在非 TabBar 页面调用的失败输出
            }
          })
        } catch (e) {
          // 忽略同步调用的报错
        }
      }
    },

    // 设置货币
    setCurrency(currency: string) {
      this.settings.currency = currency
      this.saveSettings()
    },

    // 设置语言
    setLanguage(language: string) {
      this.settings.language = language
      this.saveSettings()
    },

    // 设置通知
    setNotification(enabled: boolean) {
      this.settings.notificationEnabled = enabled
      this.saveSettings()
    },

    // 保存设置
    saveSettings() {
      try {
        uni.setStorageSync('settings', JSON.stringify(this.settings))
      } catch (e) {
        console.error('保存设置失败:', e)
      }
    },

    // 替换设置（用于导入）
    replaceSettings(nextSettings: UserSettings) {
      this.settings = {
        ...this.settings,
        ...nextSettings
      }
      this.applyTheme(this.settings.theme)
      this.saveSettings()
    },

    // 加载设置
    loadSettings() {
      try {
        const data = uni.getStorageSync('settings')
        if (data) {
          this.settings = JSON.parse(data)
        }
        // 无论是否加载到数据，都应用当前主题（默认或加载的）
        this.applyTheme(this.settings.theme)
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    }
  }
})
