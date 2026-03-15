// 银行交易数据类型
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  counterparty: string;
  account: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference?: string;
}

// A2UI 组件结构类型
export interface A2UIComponent {
  type: 'card' | 'list' | 'table' | 'chart' | 'text' | 'alert' | 'badge' | 'divider' | 'grid';
  props?: Record<string, any>;
  children?: A2UIComponent[];
  content?: string;
}

// AI 消息类型
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  uiComponent?: A2UIComponent;
  uiSchema?: any;  // 支持 uiSchema 字段
  timestamp: Date;
}

// API 响应类型
export interface AIReviewResponse {
  content: string;
  uiComponent?: A2UIComponent;
}
