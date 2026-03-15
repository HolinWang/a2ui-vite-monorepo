/**
 * A2UI 核心类型定义
 * UI Schema 是 AI 生成的 UI 结构树
 */

/**
 * UI Schema 节点结构
 * AI 生成的最小 UI 单元
 */
export interface UISchema {
  /** 组件名称（必须在组件注册表中定义） */
  component: string;
  /** 组件属性 */
  props?: Record<string, any>;
  /** 子节点 */
  children?: UISchema[];
  /** 条件渲染（可选） */
  condition?: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';
    value: any;
  };
  /** 循环渲染（可选） */
  repeat?: {
    dataSource: string;
    itemKey?: string;
    indexKey?: string;
  };
}

/**
 * 组件能力定义
 * 告诉 AI 有哪些组件可以用，以及如何使用
 */
export interface ComponentDefinition {
  /** 组件名称 */
  name: string;
  /** 组件描述（AI 理解用） */
  description: string;
  /** 组件分类 */
  category: 'layout' | 'form' | 'display' | 'feedback' | 'navigation';
  /** 属性定义 */
  props: PropDefinition[];
  /** 是否支持子节点 */
  hasChildren?: boolean;
  /** 使用示例 */
  examples?: UISchema[];
}

/**
 * 属性定义
 */
export interface PropDefinition {
  /** 属性名称 */
  name: string;
  /** 属性类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'enum';
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 描述（AI 理解用） */
  description: string;
  /** 枚举值（type 为 enum 时必填） */
  enumValues?: string[];
  /** 属性验证函数 */
  validator?: (value: any) => boolean;
}

/**
 * Tool Calling 定义
 * AI 通过工具调用生成结构化的 UI
 */
export interface ToolDefinition {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 工具参数 */
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

/**
 * Tool Call 结果
 */
export interface ToolCallResult {
  /** 工具名称 */
  tool: string;
  /** 工具参数 */
  args: Record<string, any>;
  /** 生成的 UI Schema */
  schema: UISchema;
}

/**
 * Schema 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors?: SchemaError[];
}

/**
 * Schema 错误
 */
export interface SchemaError {
  /** 错误路径 */
  path: string;
  /** 错误信息 */
  message: string;
  /** 错误类型 */
  type: 'missing_prop' | 'invalid_type' | 'unknown_component' | 'invalid_structure';
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  /** 数据上下文 */
  data?: Record<string, any>;
  /** 事件处理器 */
  handlers?: Record<string, Function>;
  /** 主题配置 */
  theme?: 'light' | 'dark';
  /** 响应式断点 */
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * AI 对话消息（扩展版）
 */
export interface A2UIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** AI 生成的 UI Schema */
  uiSchema?: UISchema;
  /** Tool Calls */
  toolCalls?: ToolCallResult[];
  /** 时间戳 */
  timestamp: Date;
}
