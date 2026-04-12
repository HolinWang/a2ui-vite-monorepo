/**
 * AG-UI 协议类型定义
 * 
 * 核心概念：
 * - Agent 负责决策（做什么）
 * - Runtime（前端）负责执行（怎么触发、怎么渲染）
 */

// ============================================
// 1. AG-UI 消息类型定义
// ============================================

/**
 * AG-UI Action（从前端发送到后端）
 */
export interface AGUIAction {
  action: string;           // 操作名称
  params?: Record<string, unknown>;  // 参数
  context?: {
    selectedIds?: string[];      // 选中的数据 ID
    data?: unknown;              // 当前数据状态
  };
}

/**
 * AG-UI Response（从后端返回到前端）
 */
export interface AGUIResponse {
  type: 'update' | 'error' | 'complete';
  components?: AGUIComponent[];  // UI 组件
  state?: Record<string, unknown>;   // 更新状态
  message?: string;              // 消息
  error?: string;                // 错误信息
}

/**
 * AG-UI UI 组件
 */
export interface AGUIComponent {
  id?: string;
  type: AGUIComponentType;
  props?: Record<string, unknown>;
  children?: AGUIComponent[];
  // 事件绑定
  events?: {
    [key: string]: string;  // eventName -> actionName
  };
}

/**
 * AG-UI 组件类型
 */
export type AGUIComponentType = 
  | 'div'
  | 'span'
  | 'button'
  | 'card'
  | 'table'
  | 'grid'
  | 'statistic'
  | 'alert'
  | 'loading'
  | 'badge'
  | 'tag'
  | 'text'
  | 'input'
  | 'checkbox'
  | 'select'
  | 'tabs'
  | 'list'
  | 'image'
  | 'progress'
  | 'divider'
  | 'breadcrumb'
  | 'timeline'
  | 'spinner'
  | 'container'
  | 'stack'
  | 'form'
  | 'descriptions'
  | 'breadcrumb';

// ============================================
// 2. AG-UI Runtime 核心类型
// ============================================

/**
 * Runtime 配置
 */
export interface AGUIRuntimeConfig {
  agentEndpoint: string;    // Agent API 地址
  onStateChange?: (state: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

/**
 * Runtime 状态
 */
export interface AGUIRuntimeState {
  components: AGUIComponent[];  // 当前 UI 组件
  state: Record<string, unknown>;   // 当前数据状态
  loading: boolean;             // 是否加载中
  error: string | null;         // 错误信息
  history: AGUIAction[];        // 操作历史
}

/**
 * Runtime 操作
 */
export type AGUIRuntimeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_COMPONENTS'; payload: AGUIComponent[] }
  | { type: 'UPDATE_STATE'; payload: Record<string, unknown> }
  | { type: 'ADD_TO_HISTORY'; payload: AGUIAction }
  | { type: 'RESET' };

// ============================================
// 3. AG-UI 上下文
// ============================================

export interface AGUIContextValue {
  // 状态
  state: AGUIRuntimeState;
  // 方法
  dispatch: (action: AGUIAction) => Promise<void>;
  bindEvent: (componentId: string, eventName: string, action: AGUIAction) => void;
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 4. 组件 Props 类型
// ============================================

/**
 * 通用组件 Props
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

/**
 * Button Props
 */
export interface AGUIButtonProps extends BaseComponentProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  events?: Record<string, string>;
  onClick?: () => void;
}

/**
 * Card Props
 */
export interface AGUICardProps extends BaseComponentProps {
  title?: string;
  bordered?: boolean;
  hoverable?: boolean;
}

/**
 * Table Props
 */
export interface AGUITableProps extends BaseComponentProps {
  headers?: string[];
  rows?: string[][];
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

/**
 * Alert Props
 */
export interface AGUIAlertProps extends BaseComponentProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  closable?: boolean;
}

/**
 * Loading Props
 */
export interface AGUILoadingProps extends BaseComponentProps {
  message?: string;
  fullscreen?: boolean;
}

/**
 * Statistic Props
 */
export interface AGUIStatisticProps extends BaseComponentProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  status?: 'success' | 'warning' | 'danger';
  precision?: number;
}
