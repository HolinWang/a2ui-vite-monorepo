/**
 * A2UI 组件能力定义（后端版本）
 * 用于生成 AI 提示词
 */

/**
 * 生成组件能力描述（供 AI 使用）
 */
export function generateComponentPrompt(): string {
  return `## 布局组件

### Card
卡片容器，用于包裹和分组内容
属性：
- title: 卡片标题
- subtitle: 卡片副标题
- padding: 内边距大小（none, sm, md, lg）
- shadow: 阴影大小（none, sm, md, lg）

### Grid
网格布局，用于创建多列布局
属性：
- cols: 列数（1-12）（必填）
- gap: 列间距（none, sm, md, lg）

### Stack
堆叠布局，垂直或水平排列子元素
属性：
- direction: 排列方向（horizontal, vertical）
- gap: 元素间距（none, sm, md, lg）
- align: 对齐方式（start, center, end, stretch）

### Divider
分隔线
属性：
- orientation: 方向（horizontal, vertical）
- style: 线条样式（solid, dashed, dotted）

## 表单组件

### Input
输入框
属性：
- label: 输入框标签
- placeholder: 占位符文本
- type: 输入类型（text, password, email, number, tel, url）
- required: 是否必填

### Button
按钮
属性：
- text: 按钮文本（必填）
- variant: 按钮样式（primary, secondary, outline, ghost, danger）
- size: 按钮大小（sm, md, lg）

### Select
下拉选择框
属性：
- label: 选择框标签
- options: 选项列表（必填）
- placeholder: 占位符文本
- multiple: 是否多选

## 展示组件

### Text
文本组件
属性：
- content: 文本内容（必填）
- variant: 文本样式（h1, h2, h3, h4, h5, h6, body, small, caption）
- color: 文本颜色（default, primary, secondary, success, warning, danger）

### Table
表格组件
属性：
- columns: 列定义（必填）
- dataSource: 数据源（必填）
- bordered: 是否有边框

### Badge
徽章
属性：
- content: 徽章内容（必填）
- variant: 徽章样式（default, primary, success, warning, danger, info）

### Statistic
统计数值
属性：
- label: 统计项标签（必填）
- value: 统计值（必填）
- prefix: 前缀（如货币符号）
- suffix: 后缀（如单位）
- trend: 趋势方向（up, down, flat）
- trendValue: 趋势值

## 反馈组件

### Alert
警告提示
属性：
- content: 提示内容（必填）
- type: 提示类型（info, success, warning, error）

### Progress
进度条
属性：
- percent: 进度百分比（必填，0-100）
- status: 进度状态（normal, success, error）`;
}

/**
 * 生成工具定义提示词（供 AI 使用）
 */
export function generateToolPrompt(): string {
  return `## 交易分析工具

### createTransactionSummary
创建交易摘要卡片
参数：
- totalIncome: 总收入（必填）
- totalExpense: 总支出（必填）
- transactionCount: 交易笔数（必填）
- trend: 趋势描述

### createTransactionDetail
创建交易详情卡片
参数：
- id: 交易ID（必填）
- type: 交易类型（income, expense, transfer）（必填）
- amount: 交易金额（必填）
- counterparty: 对方账户（必填）
- category: 交易分类
- status: 交易状态（completed, pending, failed）（必填）
- description: 交易描述
- riskLevel: 风险等级（low, medium, high）
- analysis: AI 分析建议

### createRiskAlert
创建风险预警卡片
参数：
- level: 风险等级（low, medium, high）（必填）
- title: 预警标题（必填）
- description: 风险描述（必填）
- suggestions: 改进建议列表

### createStatistic
创建统计数值展示
参数：
- label: 统计项标签（必填）
- value: 统计值（必填）
- prefix: 前缀
- suffix: 后缀
- trend: 趋势方向（up, down, flat）
- trendValue: 趋势值

### createAlert
创建警告提示
参数：
- content: 提示内容（必填）
- type: 提示类型（info, success, warning, error）

### createTable
创建表格
参数：
- columns: 列定义（必填）
- data: 表格数据（必填）
- bordered: 是否有边框`;
}

/**
 * 工具定义
 */
export const toolRegistry = [
  {
    name: 'createTransactionSummary',
    description: '创建交易摘要卡片',
    parameters: {
      type: 'object',
      properties: {
        totalIncome: { type: 'number', description: '总收入' },
        totalExpense: { type: 'number', description: '总支出' },
        transactionCount: { type: 'number', description: '交易笔数' },
        trend: { type: 'string', description: '趋势描述' },
      },
      required: ['totalIncome', 'totalExpense', 'transactionCount'],
    },
  },
  {
    name: 'createTransactionDetail',
    description: '创建交易详情卡片',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '交易ID' },
        type: { type: 'string', enum: ['income', 'expense', 'transfer'], description: '交易类型' },
        amount: { type: 'number', description: '交易金额' },
        counterparty: { type: 'string', description: '对方账户' },
        category: { type: 'string', description: '交易分类' },
        status: { type: 'string', enum: ['completed', 'pending', 'failed'], description: '交易状态' },
        description: { type: 'string', description: '交易描述' },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'], description: '风险等级' },
        analysis: { type: 'string', description: 'AI 分析建议' },
      },
      required: ['id', 'type', 'amount', 'counterparty', 'status'],
    },
  },
  {
    name: 'createRiskAlert',
    description: '创建风险预警卡片',
    parameters: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['low', 'medium', 'high'], description: '风险等级' },
        title: { type: 'string', description: '预警标题' },
        description: { type: 'string', description: '风险描述' },
        suggestions: { type: 'array', description: '改进建议列表' },
      },
      required: ['level', 'title', 'description'],
    },
  },
];
