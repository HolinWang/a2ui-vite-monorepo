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
  component: string;
  props?: Record<string, any>;
  children?: A2UIComponent[];
}

// A2UI 消息类型定义
export type A2UIMessageType = 'surfaceUpdate' | 'dataModelUpdate' | 'beginRendering' | 'deleteSurface';

// 1. surfaceUpdate - 更新 UI
export interface SurfaceUpdateMessage {
  type: 'surfaceUpdate';
  components: A2UIComponent[];
  surfaceId?: string;
}

// 2. dataModelUpdate - 更新数据状态
export interface DataModelUpdateMessage {
  type: 'dataModelUpdate';
  data: Record<string, any>;
  surfaceId?: string;
}

// 3. beginRendering - 开始渲染
export interface BeginRenderingMessage {
  type: 'beginRendering';
  surfaceId?: string;
  message?: string;
}

// 4. deleteSurface - 删除 UI
export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId?: string;
  message?: string;
}

// A2UI 消息联合类型
export type A2UIMessage = 
  | SurfaceUpdateMessage 
  | DataModelUpdateMessage 
  | BeginRenderingMessage 
  | DeleteSurfaceMessage;

// AI 消息类型
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  uiSchema?: A2UIComponent[];
  dataModel?: Record<string, any>;
  isRendering?: boolean;
  timestamp: Date;
}

// API 响应类型
export interface AIReviewResponse {
  content: string;
  uiComponent?: A2UIComponent;
}

// 解析 A2UI 消息
export function parseA2UIMessage(text: string): A2UIMessage | null {
  try {
    const parsed = JSON.parse(text);
    if (['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(parsed.type)) {
      return parsed as A2UIMessage;
    }
    return null;
  } catch {
    return null;
  }
}

// 检查是否为 A2UI 消息
export function isA2UIMessage(obj: any): obj is A2UIMessage {
  return obj && typeof obj === 'object' && 
    ['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'].includes(obj.type);
}
