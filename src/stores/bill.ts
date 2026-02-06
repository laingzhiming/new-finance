import { defineStore } from 'pinia'
import type { BillItem, StatisticsData, BillCategory } from '@/types'
import { BillType } from '@/types'

interface BillState {
  bills: BillItem[]
}

export const useBillStore = defineStore('bill', {
  state: (): BillState => ({
    bills: []
  }),

  getters: {
    // 统计数据
    statistics(): StatisticsData {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      // 筛选当月账单
      const monthlyBills = this.bills.filter(bill => {
        const billDate = new Date(bill.date)
        return billDate.getFullYear() === currentYear && billDate.getMonth() === currentMonth
      })

      // 计算总收入和总支出
      let totalIncome = 0
      let totalExpense = 0
      const categoryExpense: Record<string, number> = {}
      const categoryIncome: Record<string, number> = {}

      monthlyBills.forEach(bill => {
        if (bill.type === BillType.Income) {
          totalIncome += bill.amount
          categoryIncome[bill.category] = (categoryIncome[bill.category] || 0) + bill.amount
        } else {
          totalExpense += bill.amount
          categoryExpense[bill.category] = (categoryExpense[bill.category] || 0) + bill.amount
        }
      })

      // 按日期分组统计
      const dailyMap = new Map<string, { expense: number; income: number }>()
      monthlyBills.forEach(bill => {
        const existing = dailyMap.get(bill.date) || { expense: 0, income: 0 }
        if (bill.type === BillType.Income) {
          existing.income += bill.amount
        } else {
          existing.expense += bill.amount
        }
        dailyMap.set(bill.date, existing)
      })

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryExpense: categoryExpense as Record<BillCategory, number>,
        categoryIncome: categoryIncome as Record<BillCategory, number>,
        dailyData
      }
    }
  },

  actions: {
    // 添加账单
    addBill(bill: BillItem) {
      this.bills.unshift(bill)
      this.saveBills()
    },

    // 删除账单
    deleteBill(id: string) {
      const index = this.bills.findIndex(bill => bill.id === id)
      if (index !== -1) {
        this.bills.splice(index, 1)
        this.saveBills()
      }
    },

    // 更新账单
    updateBill(id: string, updates: Partial<BillItem>) {
      const index = this.bills.findIndex(bill => bill.id === id)
      if (index !== -1) {
        this.bills[index] = {
          ...this.bills[index],
          ...updates,
          updatedAt: Date.now()
        }
        this.saveBills()
      }
    },

    // 清空所有账单
    clearAllBills() {
      this.bills = []
      this.saveBills()
    },

    // 保存到本地存储
    saveBills() {
      try {
        uni.setStorageSync('bills', JSON.stringify(this.bills))
      } catch (e) {
        console.error('保存账单失败:', e)
      }
    },

    // 从本地存储加载
    loadBills() {
      try {
        const data = uni.getStorageSync('bills')
        if (data) {
          this.bills = JSON.parse(data)
        } else {
          // 如果没有数据，添加一些示例数据
          this.initializeSampleData()
        }
      } catch (e) {
        console.error('加载账单失败:', e)
        this.initializeSampleData()
      }
    },

    // 初始化示例数据
    initializeSampleData() {
      const today = new Date()
      const sampleBills: BillItem[] = []

      // 生成最近7天的示例数据
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        // 添加几笔支出
        sampleBills.push({
          id: `expense-${i}-1`,
          amount: Math.random() * 100 + 10,
          category: ['food', 'shopping', 'transport'][
            Math.floor(Math.random() * 3)
          ] as BillCategory,
          type: BillType.Expense,
          timestamp: date.getTime(),
          date: dateStr,
          remark: '示例账单',
          createdAt: date.getTime(),
          updatedAt: date.getTime()
        })

        // 偶尔添加收入
        if (i % 3 === 0) {
          sampleBills.push({
            id: `income-${i}-1`,
            amount: Math.random() * 500 + 100,
            category: 'other' as BillCategory,
            type: BillType.Income,
            timestamp: date.getTime(),
            date: dateStr,
            remark: '示例收入',
            createdAt: date.getTime(),
            updatedAt: date.getTime()
          })
        }
      }

      this.bills = sampleBills
      this.saveBills()
    }
  }
})
