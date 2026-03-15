# Bank Transaction A2UI System

Based **A2UI (AI-to-UI)** 架itecture of bank transaction management system, implementing AI dynamic generation of UI capability.

## 📖 项目简介

This project is an innovative bank transaction management platform, with the core feature being **A2UI architecture**: AI understands user intent, dynamically generates UI Schema (JSON), and the front-end rendering engine converts it into actual React component interfaces.

### 核心能力

- **AI 动态 UI 生成**：Automatically generate the most suitable UI interface based on user questions
- **Risk analysis report**：Automatically generate transaction risk analysis, supporting export to Excel
- **Transaction detail query**：Support querying the complete audit log and detailed information of transactions
- **Smart dialogue interaction**：Natural language interaction, AI understands and executes complex operations

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户界面层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 交易列表    │  │ AI 对话框   │  │ 动态UI渲染  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       A2UI 核心引擎                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Schema验证  │  │ 组件渲染器  │  │ 组件注册表  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         后端服务层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ AI 分析服务 │  │ 导出服务    │  │ 查询服务    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LLM 服务层                                │
│                   (Doubao/DeepSeek/Kimi)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
bank-a2ui-monorepo/
├── packages/
│   ├── frontend/                 # 前端应用 (React + Vite)
│   │   ├── src/
│   │   │   ├── a2ui/            # A2UI 核心引擎
│   │   │   │   ├── components/  # UI 组件库
│   │   │   │   ├── types.ts     # 类型定义
│   │   │   │   ├── renderNode.tsx    # 渲染引擎
│   │   │   │   ├── componentCatalog.ts # 组件注册表
│   │   │   │   ├── schemaValidator.ts  # Schema 验证器
│   │   │   │   └── ActionContext.tsx   # 操作上下文
│   │   │   ├── components/      # 业务组件
│   │   │   ├── data/            # 模拟数据
│   │   │   └── types/           # 类型定义
│   │   └── package.json
│   │
│   └── backend/                  # 后端服务 (Express)
│       ├── src/
│       │   ├── routes/          # API 路由
│       │   │   ├── ai.ts        # AI 分析接口
│       │   │   ├── export.ts    # 导出接口
│       │   │   └── query.ts     # 查询接口
│       │   ├── a2ui/            # A2UI 后端支持
│       │   └── index.ts         # 入口文件
│       └── package.json
│
├── docs/                         # 文档目录
│   ├── frontend-design.md       # 前端详细设计
│   ├── backend-design.md        # 后端详细设计
│   └── system-architecture.md   # 系统架构设计
│
└── package.json                  # Monorepo 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装所有依赖
pnpm install:all
```

### 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:frontend  # 前端 http://localhost:5000
pnpm dev:backend   # 后端 http://localhost:3000
```

### 构建生产版本

```bash
pnpm build
```

## 📚 详细文档

- [前端详细设计文档](./docs/frontend-design.md)
- [后端详细设计文档](./docs/backend-design.md)
- [系统架构设计](./docs/system-architecture.md)

## 🔧 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 4.x | 样式方案 |
| Lucide React | - | 图标库 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.x | Web 框架 |
| TypeScript | 5.x | 类型安全 |
| LangChain | - | LLM SDK，支持多模型 |

### LLM 服务
- 豆包 (Doubao)
- DeepSeek
- Kimi

## 🎯 核心功能

### 1. AI 动态 UI 生成

用户通过自然语言描述需求，AI 生成 UI Schema：

``json
{
  "component": "Container",
  "children": [
    {
      "component": "Card",
      "props": { "title": "交易概览", "variant": "highlight" },
      "children": [
        {
          "component": "Grid",
          "props": { "columns": 4 },
          "children": [...]
        }
      ]
    }
  ]
}
```

### 2. 风险分析报告

- 自动分析选中交易的风险等级
- 生成可视化统计图表
- 支持导出 Excel 报告

### 3. 交易详情查询

- 输入交易流水号查询详情
- 查询账户信息、风险信息、审计日志
- AI 辅助生成详细报告

### 4. 数据导出

- 支持 CSV 格式导出
- Excel 兼容，支持中文
- 可自定义导出字段

## 🧩 组件库

A2UI 内置丰富的 UI 组件：

### 布局组件
- `Container` - 容器
- `Card` - 卡片
- `Grid` - 网格布局
- `Stack` - 堆叠布局
- `Divider` - 分割线

### 展示组件
- `Statistic` - 统计数值
- `Descriptions` - 描述列表
- `Timeline` - 时间线
- `Table` - 表格
- `Tag` - 标签
- `Badge` - 徽章

### 表单组件
- `Input` - 输入框
- `Select` - 下拉选择
- `Button` - 按钮
- `Form` - 表单

### 反馈组件
- `Alert` - 提示框
- `Progress` - 进度条
- `Spinner` - 加载动画

## 📡 API 接口

### AI 分析

```
POST /api/ai/review
POST /api/ai/chat
```

### 数据导出

```
POST /api/export/transactions
POST /api/export/risk-report
```

### 交易查询

```
POST /api/query/transaction-detail
POST /api/query/ai-query
```

## 📄 License

MIT License

## 👥 Contributors

- A2UI Team
