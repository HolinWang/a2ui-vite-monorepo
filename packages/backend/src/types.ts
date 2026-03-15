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

// AI 消息类型
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
