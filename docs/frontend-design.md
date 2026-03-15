# 前端详细设计文档

## 1. 架构概述

前端采用 **React 19 + TypeScript + Vite** 技术栈，核心是 **A2UI 渲染引擎**，实现 AI 生成的 UI Schema 到实际 React 组件的转换。

### 1.1 技术选型

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| React | 19 | 最新版本，支持并发渲染、Server Components |
| TypeScript | 5.x | 类型安全，提升代码质量 |
| Vite | 6.x | 极速开发体验，HMR 热更新 |
| Tailwind CSS | 4.x | 原子化 CSS，快速开发 |
| Lucide React | - | 轻量级图标库，Tree-shaking 友好 |

### 1.2 目录结构

```
packages/frontend/src/
├── a2ui/                      # A2UI 核心引擎
│   ├── components/            # UI 组件库
│   │   ├── Card.tsx          # 卡片组件
│   │   ├── Grid.tsx          # 网格布局
│   │   ├── Stack.tsx         # 堆叠布局
│   │   ├── Statistic.tsx     # 统计数值
│   │   ├── Descriptions.tsx  # 描述列表
│   │   ├── Timeline.tsx      # 时间线
│   │   ├── Table.tsx         # 表格
│   │   ├── Tag.tsx           # 标签
│   │   ├── Alert.tsx         # 提示框
│   │   ├── Button.tsx        # 按钮
│   │   ├── Input.tsx         # 输入框
│   │   ├── Select.tsx        # 下拉选择
│   │   ├── Form.tsx          # 表单
│   │   └── index.ts          # 组件导出
│   ├── types.ts              # 类型定义
│   ├── renderNode.tsx        # 渲染引擎
│   ├── componentCatalog.ts   # 组件注册表
│   ├── schemaValidator.ts    # Schema 验证器
│   ├── ActionContext.tsx     # 操作上下文
│   ├── tools.ts              # Tool Calling
│   └── index.ts              # 核心导出
│
├── components/                # 业务组件
│   ├── TransactionTable.tsx  # 交易列表
│   ├── AIDialog.tsx          # AI 对话框
│   ├── MarkdownRenderer.tsx  # Markdown 渲染
│   └── A2UIRenderer.tsx      # A2UI 渲染器
│
├── data/                      # 数据
│   └── mockData.ts           # 模拟数据
│
├── types/                     # 类型定义
│   └── index.ts
│
├── App.tsx                    # 应用入口
└── main.tsx                   # 启动文件
```

## 2. A2UI 核心引擎

### 2.1 设计理念

A2UI (AI-to-UI) 的核心思想是：

```
用户意图 → AI 理解 → UI Schema (JSON) → 渲染引擎 → React 组件
```

### 2.2 类型系统

```typescript
// UI Schema 节点结构
interface UISchema {
  component: string;              // 组件名称
  props?: Record<string, any>;    // 组件属性
  children?: UISchema[];          // 子节点
  condition?: {                   // 条件渲染
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';
    value: any;
  };
  repeat?: {                      // 循环渲染
    dataSource: string;
    itemKey?: string;
    indexKey?: string;
  };
}

// 组件定义
interface ComponentDefinition {
  name: string;                   // 组件名称
  description: string;            // 组件描述（AI 理解用）
  category: 'layout' | 'form' | 'display' | 'feedback' | 'navigation';
  props: PropDefinition[];        // 属性定义
  hasChildren?: boolean;          // 是否支持子节点
  examples?: UISchema[];          // 使用示例
}
```

### 2.3 渲染引擎 (renderNode.tsx)

渲染引擎是 A2UI 的核心，负责将 UI Schema 转换为 React 组件树。

```typescript
export function renderNode(
  node: UISchema,
  context: RenderContext = {}
): React.ReactNode {
  const componentName = node.component;
  
  // 1. 条件渲染检查
  if (node.condition && !evaluateCondition(node.condition, context)) {
    return null;
  }

  // 2. 循环渲染处理
  if (node.repeat) {
    const data = getNestedValue(context.data, node.repeat.dataSource);
    return data.map((item, index) => renderNode({...}));
  }

  // 3. 获取组件定义和实现
  const Component = componentMap[componentName];
  
  // 4. 处理 props 插值
  const resolvedProps = resolveProps(node.props, context);

  // 5. 递归渲染子节点
  let children = null;
  if (node.children) {
    children = node.children.map((child, index) => 
      <React.Fragment key={index}>{renderNode(child, context)}</React.Fragment>
    );
  }

  // 6. 渲染组件
  return <Component {...resolvedProps}>{children}</Component>;
}
```

### 2.4 组件注册表 (componentCatalog.ts)

组件注册表定义了所有可用组件及其能力，供 AI 理解和使用。

```typescript
export const componentRegistry: ComponentDefinition[] = [
  {
    name: 'Card',
    description: '卡片容器，用于包裹和分组内容',
    category: 'layout',
    hasChildren: true,
    props: [
      { name: 'title', type: 'string', description: '卡片标题' },
      { name: 'variant', type: 'enum', enumValues: ['default', 'highlight', 'warning', 'success'] },
    ],
  },
  {
    name: 'Statistic',
    description: '统计数值展示',
    category: 'display',
    props: [
      { name: 'label', type: 'string', required: true },
      { name: 'value', type: 'number', required: true },
      { name: 'prefix', type: 'string' },
      { name: 'status', type: 'enum', enumValues: ['default', 'success', 'warning', 'error'] },
    ],
  },
  // ... 更多组件
];
```

### 2.5 Schema 验证器 (schemaValidator.ts)

验证 AI 生成的 UI Schema 是否有效，并自动修复常见问题。

```typescript
export function validateAndFixSchema(schema: any): {
  valid: boolean;
  schema: UISchema;
  errors: SchemaError[];
} {
  // 1. 检查必需字段
  // 2. 验证组件名称
  // 3. 验证属性类型
  // 4. 自动修复常见问题
  // 5. 返回验证结果
}
```

### 2.6 ActionContext (操作上下文)

管理表单数据和操作（导出、查询）的全局上下文。

```typescript
interface ActionContextType {
  // 表单数据
  formData: FormData;
  setFormField: (name: string, value: any) => void;
  
  // 导出操作
  handleExport: (transactions: any[], reportType?: string) => Promise<void>;
  
  // 查询操作
  handleQuery: (queryType: string, params: FormData) => Promise<UISchema | null>;
  
  // 查询结果
  queryResult: any;
  queryUISchema: UISchema | null;
  
  // 加载状态
  isLoading: boolean;
}
```

## 3. 组件库设计

### 3.1 布局组件

#### Container（容器）
```typescript
interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}
// 根容器，提供统一的间距和宽度
```

#### Card（卡片）
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}
// variant 控制卡片颜色主题
```

#### Grid（网格布局）
```typescript
interface GridProps {
  columns?: 1 | 2 | 3 | 4;  // 响应式列数
  gap?: number | string;
}
// 自动响应式：小屏幕单列，大屏幕多列
```

#### Stack（堆叠布局）
```typescript
interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
}
```

### 3.2 展示组件

#### Statistic（统计数值）
```typescript
interface StatisticProps {
  label: string;
  value: string | number;
  prefix?: string;      // 前缀，如 ¥
  suffix?: string;      // 后缀
  status?: 'default' | 'success' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'flat';
}
```

#### Descriptions（描述列表）
```typescript
interface DescriptionsProps {
  items: Array<{
    label: string;
    value: string | number;
    span?: number;
  }>;
  column?: 1 | 2 | 3 | 4;
  bordered?: boolean;
}
// 响应式布局，自动换行
```

#### Timeline（时间线）
```typescript
interface TimelineProps {
  items: Array<{
    time: string;
    title: string;
    description?: string;
    status?: 'success' | 'processing' | 'error' | 'default';
  }>;
}
// 用于展示审计日志、操作历史
```

#### Table（表格）
```typescript
interface TableProps {
  columns: Array<{
    key: string;
    title: string;
    width?: string;
    render?: (value: any, record: any) => React.ReactNode;
  }>;
  dataSource: any[];
  bordered?: boolean;
  striped?: boolean;
}
```

### 3.3 表单组件

#### Button（按钮）
```typescript
interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  action?: 'export' | 'query' | 'submit' | 'custom';
  // action 控制按钮行为
}
```

#### Input（输入框）
```typescript
interface InputProps {
  label?: string;
  name?: string;           // 表单字段名
  placeholder?: string;
  type?: 'text' | 'number' | 'password';
  required?: boolean;
  // 自动与 ActionContext 表单数据绑定
}
```

#### Select（下拉选择）
```typescript
interface SelectProps {
  label?: string;
  name?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  multiple?: boolean;
}
```

## 4. 业务组件

### 4.1 AIDialog（AI 对话框）

核心交互组件，支持：
- 与 AI 进行对话交互
- 动态渲染 AI 生成的 UI
- 表单数据管理
- 导出/查询操作
- 宽度拖拽调整

```typescript
interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransactions: Transaction[];
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}
```

### 4.2 TransactionTable（交易列表）

展示交易数据，支持：
- 选择交易
- 排序、筛选
- 触发 AI 分析

## 5. 数据流

### 5.1 AI 交互流程

```
1. 用户选择交易 → 点击 AI Review
2. 发送交易数据到后端 /api/ai/review
3. 后端调用 LLM 生成 UI Schema
4. 前端接收流式响应
5. 解析 JSON，获取 UI Schema
6. 调用 renderUISchema() 渲染界面
```

### 5.2 查询操作流程

```
1. 用户填写表单（流水号、查询类型）
2. 点击"查询详情"按钮
3. Button 组件调用 handleQuery()
4. ActionContext 发送请求到 /api/query/ai-query
5. 后端调用 LLM 生成 UI Schema
6. 前端接收并存储到 queryUISchema
7. AIDialog 重新渲染，显示查询结果
```

### 5.3 导出操作流程

```
1. 用户点击"导出报告"按钮
2. Button 组件调用 handleExport()
3. 发送交易数据到 /api/export/transactions
4. 后端生成 CSV 文件
5. 前端下载文件
```

## 6. 样式系统

### 6.1 Tailwind CSS 配置

使用 Tailwind CSS 4.x，支持：
- 原子化 CSS
- 响应式设计
- 暗色模式（可扩展）

### 6.2 设计规范

| 元素 | 规范 |
|------|------|
| 颜色 | 主色 blue-500，成功 green-500，警告 orange-500，错误 red-500 |
| 间距 | sm: 0.5rem, md: 1rem, lg: 1.5rem |
| 圆角 | 默认 rounded-lg (0.5rem) |
| 阴影 | 默认 shadow-md |
| 字体 | 系统默认字体栈 |

## 7. 性能优化

### 7.1 代码分割

- 组件按需加载
- 动态 import 大型组件

### 7.2 渲染优化

- React.memo 包装纯组件
- useCallback 缓存回调函数
- useMemo 缓存计算结果

### 7.3 虚拟列表

交易列表可扩展为虚拟列表，支持大数据量渲染。

## 8. 扩展性

### 8.1 新增组件

1. 在 `a2ui/components/` 创建组件
2. 在 `componentCatalog.ts` 添加组件定义
3. 在 `renderNode.tsx` 注册组件映射

### 8.2 新增操作

1. 在 `ActionContext.tsx` 添加操作方法
2. 在 Button 组件添加 action 类型
3. 在后端添加对应 API

## 9. 测试策略

### 9.1 单元测试

- 组件渲染测试
- Schema 验证测试
- 工具函数测试

### 9.2 集成测试

- A2UI 渲染流程测试
- API 调用测试

### 9.3 E2E 测试

- 用户交互流程测试
- AI 对话流程测试
