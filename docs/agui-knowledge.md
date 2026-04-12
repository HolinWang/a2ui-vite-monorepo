重点：

* Runtime 边界（前端 / Agent）
* 状态机建模
* Schema 设计规范
* Event 协议工程化
* 可落地架构思维

---

# AG-UI（Agent-Generated UI）完整学习与工程实践指南

---

# 一、AG-UI 核心定义

AG-UI（Agent Generated UI）是一种由 **Agent（AI + 状态机）动态生成 UI、控制交互流程、驱动状态流转**的架构范式。

## 本质表达

```
UI = f(state, intent)
```

其中：

* state：当前系统状态
* intent：用户行为（事件）
* f：Agent Runtime（决策引擎）

---

# 二、技术演进背景

## 1. 传统 UI 架构问题

### 静态 UI 模型

```
Frontend (React/Vue)
   ↓
Backend API
```

问题：

* UI 固化（写死在代码中）
* 强依赖前端发版
* 无法动态适配用户上下文
* AI 无法直接参与 UI 控制

---

## 2. AI 时代的新矛盾

LLM 的能力：

* 强推理
* 强生成

但问题：

* 只能输出文本
* 无法直接控制 UI
* 无状态执行（默认）

---

## 3. AG-UI 解决的核心问题

| 问题         | 解决方案           |
| ---------- | -------------- |
| UI 静态      | 动态生成 UI Schema |
| AI 无法驱动 UI | Agent 控制 UI    |
| 无闭环        | Event Loop     |
| 状态分散       | Agent 统一管理     |

---

# 三、整体架构

## 三层模型

```
User
  ↓
Frontend (UI Runtime)
  ↓
Agent Runtime
  ↓
Tools / Backend
```

---

## 1️⃣ UI Runtime（前端）

本质：

> JSON UI 解释执行引擎

职责：

* 渲染 UI Schema
* 绑定事件
* 分发事件（dispatch）

---

## 2️⃣ Agent Runtime（核心）

本质：

> 状态机 + 决策引擎 + LLM

职责：

* 生成 UI
* 管理状态
* 执行事件
* 调用工具

---

## 3️⃣ Tools 层

职责：

* DB 查询
* API 调用
* 外部系统集成

---

# 四、核心数据结构设计

---

## 1. UI Schema（声明式 UI）

```json
{
  "type": "page",
  "children": [
    {
      "type": "button",
      "text": "AI Reviewer",
      "action": {
        "type": "event",
        "name": "review_data"
      }
    }
  ]
}
```

---

## 2. 设计原则

### ✅ Declarative（声明式）

描述“是什么”，而不是“怎么做”

### ✅ 可序列化

必须 JSON 化

### ✅ 可扩展

支持：

* layout
* style
* interaction

---

## 3. Schema 分层设计（企业级）

推荐结构：

```ts
type UISchema = {
  layout: LayoutNode
  data: DataBinding
  actions: ActionMap
  meta: MetaInfo
}
```

---

# 五、Event 协议设计（关键）

---

## 1. Event 基础结构

```json
{
  "type": "event",
  "name": "review_data",
  "payload": {
    "rowId": 123
  }
}
```

---

## 2. 设计规范

### 命名规范

```
<domain>.<action>

例：
table.review
user.submit
form.validate
```

---

## 3. 协议分层

| 层级           | 说明   |
| ------------ | ---- |
| UI Event     | 用户触发 |
| System Event | 内部事件 |
| Tool Event   | 外部调用 |

---

## 4. RPC 本质

```
Frontend → Agent
```

请求：

```json
{
  "event": "review_data"
}
```

响应：

```json
{
  "ui": {...},
  "state": {...}
}
```

---

# 六、Runtime 深度解析（核心）

---

## 1. 双 Runtime 模型

### UI Runtime（前端）

职责：

* JSON → 组件树
* 事件监听
* dispatch

---

### Agent Runtime

职责：

* 状态管理
* 决策执行
* UI 生成

---

## 2. 点击事件完整链路

```
Click
 ↓
Frontend 捕获
 ↓
dispatch
 ↓
Agent Runtime
 ↓
执行逻辑
 ↓
生成新 UI
 ↓
Frontend 渲染
```

---

## 3. 关键结论

* 前端 ≠ 执行逻辑
* Agent = 唯一决策者

---

# 七、状态管理（State Ownership）

---

## 1. 推荐模型：Agent 单一状态源

```
State → Agent
UI → Stateless
```

---

## 2. 状态分类

| 类型      | 位置    |
| ------- | ----- |
| 业务状态    | Agent |
| UI 临时状态 | 前端    |
| 会话状态    | Agent |

---

## 3. 状态机建模（重点）

### 示例：

```ts
state = {
  step: 'idle | loading | result',
  data: [],
  error: null
}
```

---

## 4. 状态驱动 UI

```
UI = f(state)
```

---

# 八、Agent 设计（工程核心）

---

## 1. Agent = 状态机 + LLM

```ts
function agent(event, state) {
  switch(event.name) {
    case 'review_data':
      return nextState
  }
}
```

---

## 2. 三层职责

### ① Intent 解析

* 用户行为理解

### ② 状态转移

* State Machine

### ③ UI 生成

* Schema 输出

---

## 3. Tool 调用模式

```ts
const data = await tools.db.query()
```

---

# 九、渲染引擎设计（前端）

---

## 1. Renderer

```tsx
function renderNode(node) {
  switch(node.type) {
    case 'button':
      return <Button />
    case 'table':
      return <Table />
  }
}
```

---

## 2. 组件映射表

```ts
const registry = {
  button: Button,
  table: Table
}
```

---

## 3. 动态渲染核心

```tsx
const Component = registry[node.type]
return <Component {...node.props} />
```

---

# 十、AG-UI vs A2UI

| 维度    | AG-UI | A2UI |
| ----- | ----- | ---- |
| 控制权   | Agent | 前端   |
| 状态    | Agent | 混合   |
| UI 生成 | 强     | 中    |
| 复杂度   | 高     | 中    |

---

# 十一、工程实践模式

---

## 1. Declarative UI

JSON 描述 UI

---

## 2. Event Driven

事件驱动架构

---

## 3. State Machine

核心控制流

---

## 4. Server-Driven UI（SDUI）

AG-UI 是 SDUI 的进化版

---

# 十二、性能与挑战

---

## 1. 性能问题

* UI 频繁刷新
* 网络延迟

优化：

* 增量更新（diff）
* 缓存

---

## 2. 稳定性问题

* LLM 输出不稳定

解决：

* Schema 校验（JSON Schema）
* Guardrail

---

## 3. 调试困难

解决：

* Event Log
* State Snapshot

---

# 十三、最佳实践

---

## 1. Schema 标准化

使用 JSON Schema：

```json
{
  "type": "object",
  "properties": {
    "type": {"type": "string"}
  }
}
```

---

## 2. Event 规范化

统一命名 + payload 结构

---

## 3. 状态隔离

避免前端持有核心状态

---

## 4. Agent 可测试

```ts
test('review event', () => {})
```

---

# 十四、前端“越界”边界

---

## ✅ 可以做

* loading
* 表单校验
* UI 动画

---

## ❌ 不应该做

* 业务逻辑
* 状态决策

---

# 十五、典型应用场景

---

## 1. 数据分析系统

* 动态表格
* AI 分析

---

## 2. 企业管理系统

* 风控
* 审批

---

## 3. AI Copilot

* 工具面板
* 动态 UI

---

# 十六、核心抽象总结

---

## 一句话

> AG-UI = Agent 驱动 UI + 事件闭环

---

## 核心闭环

```
UI → Event → Agent → UI
```

---

## 角色划分

| 角色       | 职责      |
| -------- | ------- |
| Frontend | 渲染 + 分发 |
| Agent    | 决策 + 状态 |
| Tools    | 执行      |

---

# 十七、进阶学习路径（强烈建议）

---

## 1️⃣ 状态机建模（最重要）

* XState 思想
* 状态流设计

---

## 2️⃣ Schema DSL 设计

* UI DSL
* Layout DSL

---

## 3️⃣ Agent 架构

* Planner / Executor
* 多 Agent 协作

---

## 4️⃣ 协议标准化

* 类似 OpenAPI
* Event Contract

---

# 终极理解（给你一个工程级心智模型）

---

## 传统：

```
UI = Code
```

---

## AG-UI：

```
UI = Runtime Interpretation(Agent Output)
```

---

## 最关键一句话

> 前端负责“画”，Agent 负责“思考”
