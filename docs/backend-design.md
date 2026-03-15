# 后端详细设计文档

## 1. 架构概述

后端采用 **Express + TypeScript** 架构，提供 RESTful API 接口，核心能力包括：
- AI 分析服务（调用 LLM 生成 UI Schema）
- 数据导出服务（生成 Excel/CSV）
- 交易查询服务（模拟银行系统查询）

### 1.1 技术选型

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| Express | 4.x | 成熟稳定的 Web 框架 |
| TypeScript | 5.x | 类型安全 |
| LangChain | - | LLM SDK，支持多模型 |
| cors | - | 跨域支持 |

### 1.2 目录结构

```
packages/backend/src/
├── routes/                    # API 路由
│   ├── ai.ts                 # AI 分析接口
│   ├── export.ts             # 导出接口
│   └── query.ts              # 查询接口
│
├── a2ui/                      # A2UI 后端支持
│   └── promptGenerator.ts    # 提示词生成器
│
├── types.ts                   # 类型定义
└── index.ts                   # 应用入口
```

### 1.3 服务端口

- **开发环境**: 3000 端口
- **生产环境**: 根据环境变量配置

## 2. API 接口设计

### 2.1 AI 分析接口

#### POST /api/ai/review

初始分析交易，生成风险报告。

**请求体**:
```json
{
  "transactions": [
    {
      "id": "TXN001",
      "type": "expense",
      "amount": 50000,
      "counterparty": "供应商A"
    }
  ]
}
```

**响应**: SSE 流式响应，返回 JSON 格式的 UI Schema

**流程**:
1. 接收交易数据
2. 构建系统提示词（包含组件能力描述）
3. 调用 LLM 生成 UI Schema
4. 流式返回结果

#### POST /api/ai/chat

对话式交互接口。

**请求体**:
```json
{
  "message": "分析这笔交易的风险",
  "transactions": [...],
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**响应**: SSE 流式响应

### 2.2 导出接口

#### POST /api/export/transactions

导出交易数据为 CSV 格式。

**请求体**:
```json
{
  "transactions": [...],
  "reportType": "transactions"
}
```

**响应**: 
- Content-Type: text/csv; charset=utf-8
- 包含 BOM 头，支持 Excel 正确识别中文

**CSV 格式**:
```csv
交易ID,日期,类型,金额,币种,交易对手,账户,分类,状态,描述
TXN001,2024-01-15,支出,50000,CNY,供应商A,****1234,采购,已完成,采购付款
```

#### POST /api/export/risk-report

导出风险分析报告。

**请求体**:
```json
{
  "transactions": [...],
  "riskAnalysis": {
    "riskLevel": "中",
    "riskFactors": [...]
  }
}
```

### 2.3 查询接口

#### POST /api/query/transaction-detail

查询交易详情（模拟银行系统）。

**请求体**:
```json
{
  "transactionId": "TXN001",
  "queryType": "account",
  "queryParams": {}
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN001",
    "basicInfo": { ... },
    "accountInfo": { ... },
    "amountInfo": { ... },
    "riskInfo": { ... },
    "auditTrail": [ ... ]
  }
}
```

#### POST /api/query/ai-query

AI 辅助查询，返回 UI Schema。

**请求体**:
```json
{
  "transactionId": "TXN001",
  "queryType": "detail",
  "queryParams": { "serialNumber": "SN123456" },
  "transaction": { ... }
}
```

**响应**: SSE 流式响应，返回 UI Schema

## 3. LLM 集成

### 3.1 SDK 使用

使用 `LangChain` 调用 LLM 服务。

```typescript
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackQueue } from "@langchain/core/callbacks/manager";

const chatModel = new ChatOpenAI({
  modelName: 'gpt-4', // 或其他支持的模型
  temperature: 0.7,
  configuration: {
    basePath: process.env.OPENAI_BASE_URL,
  }
});

// 流式调用
const stream = await chatModel.stream(
  [
    ["system", systemPrompt],
    ["human", userMessage]
  ],
  {
    callbacks: CallbackQueue.fromHandlers({
      handleLLMNewToken(token: string) {
        res.write(token);
      }
    })
  }
);

for await (const token of stream) {
  res.write(token);
}
```

### 3.2 支持的模型

- **OpenAI**: gpt-3.5-turbo, gpt-4, gpt-4-turbo
- **阿里云百炼**: qwen-turbo, qwen-plus, qwen-max
- **Anthropic**: claude-2, claude-instant-1

### 3.3 提示词设计

#### 系统提示词结构

``typescript
const systemPrompt = `
你是一个专业的银行交易分析师。

## 可用组件

### Container（容器）
根容器，用于包裹所有内容。

### Card（卡片）
用于分组展示内容。
props: { title, variant: "default"|"highlight"|"warning"|"success" }

### Grid（网格布局）
用于多列布局。
props: { columns: 2|3|4 }

### Statistic（统计数值）
用于展示关键指标。
props: { label, value, prefix, suffix, status }

### Descriptions（描述列表）
用于展示键值对信息。
props: { items: [{ label, value }] }

### Timeline（时间线）
用于展示流程历史。
props: { items: [{ time, title, status }] }

### Button（按钮）
用于触发操作。
props: { text, action: "export"|"query" }

## 响应格式

返回纯 JSON 格式（不要代码块）：
{
  "component": "Container",
  "children": [...]
}
`;
```

#### 场景模板

在提示词中包含场景模板，指导 AI 生成正确的 UI：

``typescript
const scenarioTemplates = `
## 场景模板

### 风险分析报告

{
  "component": "Container",
  "children": [
    {
      "component": "Card",
      "props": { "title": "风险分析报告", "variant": "highlight" },
      "children": [
        { "component": "Grid", "props": { "columns": 4 }, "children": [...] }
      ]
    },
    { "component": "Button", "props": { "text": "导出报告", "action": "export" } }
  ]
}

### 单笔交易分析

{
  "component": "Container",
  "children": [
    { "component": "Card", "children": [...] },
    {
      "component": "Card",
      "props": { "title": "查询更多详情" },
      "children": [
        { "component": "Input", "props": { "name": "serialNumber" } },
        { "component": "Select", "props": { "name": "queryType" } },
        { "component": "Button", "props": { "action": "query" } }
      ]
    }
  ]
}
`;
```

## 4. 数据导出

### 4.1 CSV 格式

``typescript
// 添加 BOM 头，确保 Excel 正确识别 UTF-8
const BOM = '\uFEFF';

// 构建 CSV 内容
const headers = ['交易ID', '日期', '类型', '金额', '币种'];
const rows = transactions.map(t => [t.id, t.date, t.type, t.amount, t.currency]);

const csv = BOM + headers.join(',') + '\n' + 
  rows.map(row => row.join(',')).join('\n');

res.setHeader('Content-Type', 'text/csv; charset=utf-8');
res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
res.send(csv);
```

### 4.2 导出字段映射

| 字段 | 显示名称 | 格式 |
|------|----------|------|
| id | 交易ID | 原始值 |
| date | 日期 | YYYY-MM-DD |
| type | 类型 | 收入/支出/转账 |
| amount | 金额 | 数字 |
| currency | 币种 | CNY/USD |
| counterparty | 交易对手 | 原始值 |
| status | 状态 | 已完成/待处理/失败 |

## 5. 模拟数据服务

### 5.1 交易详情生成

后端模拟银行系统返回的交易详情：

``typescript
function generateMockTransactionDetail(transactionId: string) {
  return {
    transactionId,
    basicInfo: {
      transactionTime: '2024-01-15 10:30:00',
      settlementTime: '2024-01-15 12:30:00',
      transactionChannel: '网银',
      transactionTerminal: 'TERM123456',
      serialNumber: 'SN20240115001',
      businessType: '对公转账',
    },
    accountInfo: {
      payerAccount: '****1234',
      payerName: '付款方公司',
      payerBank: '中国工商银行',
      payeeAccount: '****5678',
      payeeName: '收款方公司',
      payeeBank: '中国建设银行',
    },
    amountInfo: {
      transactionAmount: 50000,
      fee: 25,
      settlementAmount: 49975,
      currency: 'CNY',
    },
    riskInfo: {
      riskLevel: '低',
      riskTags: ['常规交易'],
      complianceCheck: '通过',
      amlStatus: '已筛查',
      riskScore: 15,
    },
    auditTrail: [
      { time: '2024-01-15 10:30:00', action: '交易发起', status: 'success' },
      { time: '2024-01-15 10:30:01', action: '风控校验', status: 'success' },
      { time: '2024-01-15 10:30:02', action: '反洗钱筛查', status: 'success' },
      { time: '2024-01-15 12:30:00', action: '交易完成', status: 'success' },
    ],
  };
}
```

### 5.2 风险分析数据

模拟风险分析结果：

``typescript
function generateRiskAnalysis(transactions: Transaction[]) {
  return {
    totalTransactions: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    riskDistribution: {
      high: 0,
      medium: 2,
      low: transactions.length - 2,
    },
    riskFactors: [
      { factor: '大额交易', count: 1, level: 'medium' },
      { factor: '跨行转账', count: 5, level: 'low' },
    ],
  };
}
```

## 6. 错误处理

### 6.1 统一错误格式

``typescript
interface APIError {
  error: string;
  message?: string;
  code?: string;
}

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});
```

### 6.2 常见错误码

| 错误码 | 说明 | HTTP 状态码 |
|--------|------|-------------|
| INVALID_REQUEST | 请求参数无效 | 400 |
| NOT_FOUND | 资源不存在 | 404 |
| AI_ERROR | AI 服务错误 | 500 |
| EXPORT_ERROR | 导出失败 | 500 |
| QUERY_ERROR | 查询失败 | 500 |

## 7. 安全性

### 7.1 CORS 配置

``typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}));
```

### 7.2 请求验证

``typescript
// 验证请求体
if (!transactions || transactions.length === 0) {
  res.status(400).json({ error: 'No transactions provided' });
  return;
}
```

### 7.3 敏感信息处理

- 脱敏处理账户信息
- 不记录完整交易数据
- 日志中过滤敏感字段

## 8. 性能优化

### 8.1 流式响应

使用 SSE (Server-Sent Events) 实现流式响应：

``typescript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

for await (const chunk of stream) {
  res.write(chunk.content.toString());
}

res.end();
```

### 8.2 连接复用

- HTTP Keep-Alive
- 连接池管理

### 8.3 缓存策略

- 静态资源缓存
- API 响应缓存（可扩展）

## 9. 监控与日志

### 9.1 请求日志

``typescript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

### 9.2 错误日志

``typescript
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
```

## 10. 部署配置

### 10.1 环境变量

```bash
# 服务配置
PORT=3000
NODE_ENV=production

# 前端地址
FRONTEND_URL=https://your-frontend.com

# LLM 配置
LLM_MODEL=doubao-seed-1-8-251228
```

### 10.2 启动命令

```bash
# 开发环境
pnpm dev

# 生产环境
pnpm build && pnpm start
```

## 11. 扩展性

### 11.1 新增 API

1. 在 `routes/` 目录创建路由文件
2. 在 `index.ts` 注册路由
3. 添加类型定义

### 11.2 新增 LLM 模型

修改 SDK 调用参数：

``typescript
const stream = client.stream(messages, {
  model: 'new-model-name',
  temperature: 0.7,
});
```

### 11.3 新增导出格式

扩展导出接口支持 JSON、Excel 等格式。
