<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/stores/settings'
import { useBillStore } from '@/stores/bill'
import { BillType, BillCategory, type BillItem } from '@/types'

const settingsStore = useSettingsStore()
const billStore = useBillStore()

const generateMockData = () => {
  const bills: BillItem[] = []
  const now = new Date()

  // 过去 90 天的数据
  for (let i = 0; i < 90; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // 每天随机产生 1-5 笔交易
    const dailyCount = Math.floor(Math.random() * 5) + 1
    for (let j = 0; j < dailyCount; j++) {
      const isExpense = Math.random() > 0.3 // 70% 几率是支出
      let type = isExpense ? BillType.Expense : BillType.Income

      let category = BillCategory.Other
      let amount = 0

      if (isExpense) {
        const categories = [
          BillCategory.Food,
          BillCategory.Shopping,
          BillCategory.Transport,
          BillCategory.Entertainment,
          BillCategory.Medical,
          BillCategory.Housing,
          BillCategory.Education
        ]
        category = categories[Math.floor(Math.random() * categories.length)]
        // 生成 10 - 500 之间的随机金额
        amount = Number((Math.random() * 490 + 10).toFixed(2))
      } else {
        category = BillCategory.Other
        // 收入通常较大
        amount = Number((Math.random() * 1000 + 100).toFixed(2))
      }

      // 每月 1 号发工资
      if (date.getDate() === 1 && j === 0) {
        type = BillType.Income
        category = BillCategory.Other
        amount = 15000
        bills.push({
          id: `salary-${dateStr}`,
          amount,
          category,
          type,
          timestamp: date.getTime(),
          date: dateStr,
          remark: '工资收入',
          createdAt: date.getTime(),
          updatedAt: date.getTime()
        })
        continue
      }

      bills.push({
        id: `${date.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        category,
        type,
        timestamp: date.getTime(),
        date: dateStr,
        remark: '测试数据自动生成',
        createdAt: date.getTime(),
        updatedAt: date.getTime()
      })
    }
  }
  return bills
}

onLaunch(() => {
  console.log('Neo-Finance App Launch')

  // 加载设置
  settingsStore.loadSettings()

  // 加载账单数据
  billStore.loadBills()

  // 如果没有数据，生成测试数据
  if (billStore.bills.length === 0) {
    console.log('检测到无数据，正在生成测试数据...')
    const mockBills = generateMockData()
    billStore.bills = mockBills
    billStore.saveBills()
    console.log(`生成了 ${mockBills.length} 条测试数据`)
  }

  // 应用主题
  settingsStore.applyTheme(settingsStore.settings.theme)
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
@import url('./styles/theme.css');
@import url('./styles/uno.css');

/* 全局样式 */
page {
  background-color: var(--bg-primary);
  color: var(--text-main);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

/* 滚动条样式 (仅 H5) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 禁用文本选择 (可选) */
* {
  -webkit-user-select: none;
  user-select: none;
}

input,
textarea {
  -webkit-user-select: auto;
  user-select: auto;
}

/* 通用动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn var(--transition-base);
}

.slide-in-up {
  animation: slideInUp var(--transition-base);
}

.slide-in-down {
  animation: slideInDown var(--transition-base);
}
</style>
