/**
 * 主题类型枚举
 */
export enum Theme {
  Dark = 'dark',
  Cyberpunk = 'cyberpunk',
  Light = 'light'
}

/**
 * 账单分类
 */
export enum BillCategory {
  Food = 'food', // 餐饮
  Shopping = 'shopping', // 购物
  Transport = 'transport', // 交通
  Entertainment = 'entertainment', // 娱乐
  Medical = 'medical', // 医疗
  Housing = 'housing', // 居住
  Education = 'education', // 教育
  Other = 'other' // 其他
}

/**
 * 账单类型
 */
export enum BillType {
  Expense = 'expense', // 支出
  Income = 'income' // 收入
}

/**
 * 账单项接口
 */
export interface BillItem {
  id: string
  amount: number
  category: BillCategory
  type: BillType
  timestamp: number
  date: string // YYYY-MM-DD 格式
  remark: string
  createdAt: number
  updatedAt: number
}

/**
 * 统计数据接口
 */
export interface StatisticsData {
  totalExpense: number
  totalIncome: number
  balance: number
  categoryExpense: Record<BillCategory, number>
  categoryIncome: Record<BillCategory, number>
  dailyData: {
    date: string
    expense: number
    income: number
  }[]
}

/**
 * 分类配置
 */
export interface CategoryConfig {
  label: string
  icon: string
  color: string
}

/**
 * 分类配置映射
 */
export const CategoryConfigMap: Record<BillCategory, CategoryConfig> = {
  [BillCategory.Food]: {
    label: '餐饮',
    icon: '🍔',
    color: '#FF6B6B'
  },
  [BillCategory.Shopping]: {
    label: '购物',
    icon: '🛍️',
    color: '#4ECDC4'
  },
  [BillCategory.Transport]: {
    label: '交通',
    icon: '🚗',
    color: '#45B7D1'
  },
  [BillCategory.Entertainment]: {
    label: '娱乐',
    icon: '🎮',
    color: '#FFA07A'
  },
  [BillCategory.Medical]: {
    label: '医疗',
    icon: '💊',
    color: '#98D8C8'
  },
  [BillCategory.Housing]: {
    label: '居住',
    icon: '🏠',
    color: '#F7DC6F'
  },
  [BillCategory.Education]: {
    label: '教育',
    icon: '📚',
    color: '#BB8FCE'
  },
  [BillCategory.Other]: {
    label: '其他',
    icon: '📝',
    color: '#95A5A6'
  }
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: Theme
  currency: string
  language: string
  notificationEnabled: boolean
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration: number
  easing: string
}
