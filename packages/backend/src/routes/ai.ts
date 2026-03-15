import { Router, Request, Response } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { Transaction, AIMessage as AppAIMessage } from '../types';
import {
  generateMockRiskReport,
  generateMockSingleTransactionAnalysis,
  generateMockChatResponse,
} from '../mockDataGenerator';
import {
  createLLMClient,
  getConfiguredProvider,
  LLMProvider,
} from '../llmConfig';
import {
  A2UIMessage,
  A2UIComponent,
  createSurfaceUpdate,
  createDataModelUpdate,
  createBeginRendering,
  createDeleteSurface,
} from '../a2uiTypes';

export const aiRouter = Router();

// 组件能力描述（供 AI 使用）
const componentPrompt = `## 可用组件

### Container（容器）
根容器，用于包裹所有内容。
props: 无需特殊属性
children: 子组件数组

### Card（卡片）
用于分组展示内容。
props: { title?: "标题", variant?: "default"|"highlight"|"warning"|"success" }
- variant 含义: default=白色, highlight=蓝色高亮, warning=橙色警告, success=绿色成功

### Grid（网格布局）
用于多列布局，自适应宽度。
props: { columns: 2|3|4 }
children: 子组件数组

### Stack（堆叠）
用于垂直或水平排列子元素。
props: { direction: "vertical"|"horizontal", gap: "none"|"sm"|"md"|"lg" }

### Statistic（统计数值）
用于展示关键指标。
props: { label: "标签", value: "数值", prefix?: "前缀如¥", suffix?: "后缀", status?: "default"|"success"|"warning"|"error" }

### Descriptions（描述列表）
用于展示键值对信息。
props: { items: [{ label: "标签", value: "值" }], column?: 2 }

### Timeline（时间线）
用于展示流程历史。
props: { items: [{ time: "时间", title: "标题", description?: "描述", status?: "success"|"processing"|"error" }] }

### Tag（标签）
用于状态标签。
props: { color: "blue"|"green"|"orange"|"red", text: "标签文本" }

### Table（表格）
用于展示交易明细。
props: { columns: [{ key: "字段", title: "标题" }], dataSource: [数据对象], bordered?: true }

### Badge（徽章）
用于状态标签。
props: { content: "内容", variant: "success"|"warning"|"danger"|"info" }

### Alert（提示）
用于重要提示。
props: { type: "info"|"success"|"warning"|"error", message: "提示内容" }

### Divider（分割线）
用于分隔内容。
props: { title?: "标题" }

### Button（按钮）
用于触发操作。
props: { text: "按钮文本", variant: "primary"|"secondary"|"outline"|"danger", action: "export"|"query"|"submit" }
- action="export": 导出数据为 Excel
- action="query": 执行查询操作
- action="submit": 提交表单

### Input（输入框）
用于用户输入。
props: { label: "标签", name: "字段名", placeholder: "占位符", type: "text"|"number", required?: true }

### Select（下拉框）
用于选择选项。
props: { label: "标签", name: "字段名", options: [{ label: "显示文本", value: "值" }], placeholder: "占位符" }

### Form（表单）
用于包裹表单元素。
props: { layout: "vertical"|"horizontal" }`;

// A2UI 消息格式说明
const a2uiMessageFormat = `## A2UI 消息格式

你必须返回以下 4 种消息类型之一，每种消息类型对应不同的 UI 操作：

### 1. beginRendering - 开始渲染
在开始生成 UI 前发送，表示正在加载。
{
  "type": "beginRendering",
  "message": "正在生成分析报告..."
}

### 2. surfaceUpdate - 更新 UI
发送完整的 UI 组件树，前端会渲染这些组件。
{
  "type": "surfaceUpdate",
  "components": [
    {
      "component": "Card",
      "props": { "title": "风险分析报告", "variant": "highlight" },
      "children": [...]
    }
  ]
}

### 3. dataModelUpdate - 更新数据
更新表单或组件的数据状态。
{
  "type": "dataModelUpdate",
  "data": {
    "totalAmount": 50000,
    "riskLevel": "中"
  }
}

### 4. deleteSurface - 删除 UI
清除当前显示的 UI。
{
  "type": "deleteSurface",
  "message": "已清除分析结果"
}

## 响应规则

1. 每次响应只返回一种消息类型
2. 消息必须是有效的 JSON 格式
3. 不要添加任何 markdown 代码块标记
4. 风险分析场景：先 beginRendering，再 surfaceUpdate
5. 单笔交易分析：先 beginRendering，再多次 surfaceUpdate（逐步展示）
6. 用户请求清除时：使用 deleteSurface`;

// 场景模板
const scenarioTemplates = `## 场景示例

### 场景1：风险分析报告

步骤1 - 发送 beginRendering：
{
  "type": "beginRendering",
  "message": "正在分析 5 笔交易..."
}

步骤2 - 发送 surfaceUpdate：
{
  "type": "surfaceUpdate",
  "components": [
    {
      "component": "Card",
      "props": { "title": "风险分析报告", "variant": "highlight" },
      "children": [
        {
          "component": "Grid",
          "props": { "columns": 4 },
          "children": [
            { "component": "Statistic", "props": { "label": "总交易数", "value": "5" } },
            { "component": "Statistic", "props": { "label": "总金额", "value": "50000", "prefix": "¥" } },
            { "component": "Statistic", "props": { "label": "风险交易", "value": "1", "status": "warning" } },
            { "component": "Statistic", "props": { "label": "风险等级", "value": "中", "status": "warning" } }
          ]
        }
      ]
    },
    {
      "component": "Card",
      "props": { "title": "交易明细" },
      "children": [
        { "component": "Table", "props": { "columns": [...], "dataSource": [...], "bordered": true } }
      ]
    },
    {
      "component": "Button",
      "props": { "text": "导出报告", "variant": "primary", "action": "export" }
    }
  ]
}

### 场景2：单笔交易分析（流式更新）

步骤1：
{
  "type": "beginRendering",
  "message": "正在分析交易 TX001..."
}

步骤2（先展示概览）：
{
  "type": "surfaceUpdate",
  "components": [
    {
      "component": "Card",
      "props": { "title": "交易概览", "variant": "highlight" },
      "children": [
        { "component": "Statistic", "props": { "label": "交易金额", "value": "15000", "prefix": "¥" } }
      ]
    }
  ]
}

步骤3（追加详细信息）：
{
  "type": "surfaceUpdate",
  "components": [
    {
      "component": "Card",
      "props": { "title": "交易详情" },
      "children": [
        { "component": "Descriptions", "props": { "items": [...] } }
      ]
    }
  ]
}`;

// 流式发送 A2UI 消息
async function streamA2UIMessage(res: Response, message: A2UIMessage) {
  const messageStr = JSON.stringify(message);
  res.write(messageStr + '\n');
  await new Promise(resolve => setTimeout(resolve, 50)); // 模拟网络延迟
}

// AI Review 接口 - 初始分析
aiRouter.post('/review', async (req: Request, res: Response) => {
  try {
    const { transactions, mode, provider } = req.body as { 
      transactions: Transaction[]; 
      mode?: 'real' | 'mock';
      provider?: LLMProvider;
    };
    
    if (!transactions || transactions.length === 0) {
      res.status(400).json({ error: 'No transactions provided' });
      return;
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 如果是模拟模式，返回预设的 UI Schema
    if (mode === 'mock') {
      console.log('Using mock mode for AI review');
      
      // 1. 发送 beginRendering 消息
      await streamA2UIMessage(res, createBeginRendering(undefined, `正在分析 ${transactions.length} 笔交易...`));
      
      // 2. 模拟延迟后发送 surfaceUpdate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const uiSchema = generateMockRiskReport(transactions);
      
      // 3. 发送 surfaceUpdate 消息
      await streamA2UIMessage(res, createSurfaceUpdate(uiSchema.children || []));
      
      res.end();
      return;
    }

    // 真实 AI 模式 - 使用 LangChain
    const llmProvider = provider || getConfiguredProvider();
    const client = createLLMClient({ provider: llmProvider });

    const systemPrompt = `你是一个专业的银行交易分析师。你必须返回 A2UI 消息格式。

${componentPrompt}

${a2uiMessageFormat}

${scenarioTemplates}

## 重要规则

1. 每次只返回一种消息类型的 JSON
2. 不要添加 markdown 代码块标记
3. 风险分析报告必须包含导出按钮（Button with action: "export"）
4. 先发送 beginRendering，再发送 surfaceUpdate`;

    const transactionSummary = transactions.map(t => 
      `${t.id}: ${t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账'} ¥${t.amount} - ${t.counterparty}`
    ).join('\n');

    const userPrompt = `分析以下交易并生成风险分析报告：

${transactionSummary}

要求：
1. 先发送 beginRendering 消息
2. 然后发送包含完整分析的 surfaceUpdate 消息
3. 生成交易概览卡片（使用Grid 4列布局展示统计信息）
4. 生成交易明细表格
5. 必须添加导出按钮`;

    try {
      const stream = await client.stream([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]);

      let buffer = '';
      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          buffer += content;
          
          // 尝试发送完整的 JSON 消息
          // 检测是否是完整的 JSON（以换行分隔）
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一行不完整的
          
          for (const line of lines) {
            if (line.trim()) {
              res.write(line + '\n');
            }
          }
        }
      }
      
      // 发送剩余的 buffer
      if (buffer.trim()) {
        res.write(buffer);
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      // 发送错误消息
      await streamA2UIMessage(res, {
        type: 'deleteSurface',
        message: `AI 调用失败: ${streamError instanceof Error ? streamError.message : '未知错误'}`
      });
    }

    res.end();
  } catch (error) {
    console.error('AI Review error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// AI Chat 接口 - 对话
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, transactions, history, mode, provider } = req.body as {
      message: string;
      transactions: Transaction[];
      history: AppAIMessage[];
      mode?: 'real' | 'mock';
      provider?: LLMProvider;
    };

    if (!message) {
      res.status(400).json({ error: 'No message provided' });
      return;
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 如果是模拟模式，返回预设的 UI Schema
    if (mode === 'mock') {
      console.log('Using mock mode for AI chat');
      
      // 1. 发送 beginRendering 消息
      await streamA2UIMessage(res, createBeginRendering(undefined, '正在生成响应...'));
      
      // 2. 模拟延迟后发送 surfaceUpdate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const uiSchema = generateMockChatResponse(message, transactions);
      
      // 3. 发送 surfaceUpdate 消息
      await streamA2UIMessage(res, createSurfaceUpdate(uiSchema.children || []));
      
      res.end();
      return;
    }

    // 真实 AI 模式 - 使用 LangChain
    const llmProvider = provider || getConfiguredProvider();
    const client = createLLMClient({ provider: llmProvider });

    const conversationHistory: BaseMessage[] = history.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    const systemPrompt = `你是一个专业的银行交易分析师助手。你必须返回 A2UI 消息格式。

${componentPrompt}

${a2uiMessageFormat}

${scenarioTemplates}

## 当前交易数据

${transactions.map(t => 
  `- ${t.id}: ${t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账'} ¥${t.amount} - ${t.counterparty}`
).join('\n')}

## 响应规则

1. 每次只返回一种消息类型的 JSON
2. 不要添加 markdown 代码块标记
3. 风险分析报告必须包含导出按钮
4. 单笔交易分析必须包含查询表单`;

    try {
      const stream = await client.stream([
        new SystemMessage(systemPrompt),
        ...conversationHistory,
        new HumanMessage(message)
      ]);

      let buffer = '';
      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          buffer += content;
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim()) {
              res.write(line + '\n');
            }
          }
        }
      }
      
      if (buffer.trim()) {
        res.write(buffer);
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      await streamA2UIMessage(res, {
        type: 'deleteSurface',
        message: `AI 调用失败: ${streamError instanceof Error ? streamError.message : '未知错误'}`
      });
    }

    res.end();
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// 清除 Surface 接口
aiRouter.post('/clear', async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await streamA2UIMessage(res, createDeleteSurface(undefined, '已清除分析结果'));
    res.end();
  } catch (error) {
    console.error('Clear surface error:', error);
    res.status(500).json({ error: 'Clear surface failed' });
  }
});
