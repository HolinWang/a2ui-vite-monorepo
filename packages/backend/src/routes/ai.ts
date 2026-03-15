import { Router, Request, Response } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { Transaction, AIMessage as AppAIMessage } from '../types.js';
import {
  generateMockRiskReport,
  generateMockSingleTransactionAnalysis,
  generateMockChatResponse,
} from '../mockDataGenerator.js';
import {
  createLLMClient,
  getConfiguredProvider,
  LLMProvider,
} from '../llmConfig.js';

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

// 场景模板
const scenarioTemplates = `## 场景模板

### 场景1：风险分析报告（必须包含导出按钮）

返回格式：
{
  "content": "文字说明",
  "uiSchema": {
    "component": "Container",
    "children": [
      {
        "component": "Card",
        "props": { "title": "风险分析报告", "variant": "highlight" },
        "children": [
          {
            "component": "Grid",
            "props": { "columns": 4 },
            "children": [
              { "component": "Statistic", "props": { "label": "总交易数", "value": "10" } },
              { "component": "Statistic", "props": { "label": "总金额", "value": "50000", "prefix": "¥" } },
              { "component": "Statistic", "props": { "label": "风险交易", "value": "2", "status": "warning" } },
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
}

### 场景2：单笔交易分析（必须包含查询表单）

返回格式：
{
  "content": "文字说明",
  "uiSchema": {
    "component": "Container",
    "children": [
      {
        "component": "Card",
        "props": { "title": "交易详情", "variant": "highlight" },
        "children": [
          {
            "component": "Grid",
            "props": { "columns": 4 },
            "children": [
              { "component": "Statistic", "props": { "label": "交易金额", "value": "15000", "prefix": "¥" } },
              { "component": "Statistic", "props": { "label": "交易状态", "value": "已完成", "status": "success" } },
              { "component": "Statistic", "props": { "label": "风险等级", "value": "低", "status": "success" } },
              { "component": "Statistic", "props": { "label": "交易渠道", "value": "网银" } }
            ]
          }
        ]
      },
      {
        "component": "Grid",
        "props": { "columns": 2 },
        "children": [
          {
            "component": "Card",
            "props": { "title": "基本信息" },
            "children": [
              { "component": "Descriptions", "props": { "items": [...] } }
            ]
          },
          {
            "component": "Card",
            "props": { "title": "风险信息" },
            "children": [
              { "component": "Descriptions", "props": { "items": [...] } }
            ]
          }
        ]
      },
      {
        "component": "Card",
        "props": { "title": "查询更多详情" },
        "children": [
          {
            "component": "Stack",
            "props": { "direction": "vertical", "gap": "md" },
            "children": [
              {
                "component": "Stack",
                "props": { "direction": "horizontal", "gap": "md" },
                "children": [
                  { "component": "Input", "props": { "label": "交易流水号", "name": "serialNumber", "placeholder": "输入流水号查询" } },
                  { "component": "Select", "props": { "label": "查询类型", "name": "queryType", "options": [{ "label": "账户信息", "value": "account" }, { "label": "风险详情", "value": "risk" }, { "label": "审计日志", "value": "audit" }] } }
                ]
              },
              { "component": "Button", "props": { "text": "查询详情", "variant": "primary", "action": "query" } }
            ]
          }
        ]
      }
    ]
  }
}`;

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

    // 如果是模拟模式，返回预设的 UI Schema
    if (mode === 'mock') {
      console.log('Using mock mode for AI review');
      const uiSchema = generateMockRiskReport(transactions);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 模拟流式响应
      const response = JSON.stringify({
        content: '已完成交易风险分析，以下是详细报告：',
        uiSchema,
      });
      
      // 分块发送，模拟流式效果
      const chunkSize = 50;
      for (let i = 0; i < response.length; i += chunkSize) {
        res.write(response.slice(i, i + chunkSize));
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      res.end();
      return;
    }

    // 真实 AI 模式 - 使用 LangChain
    const llmProvider = provider || getConfiguredProvider();
    const client = createLLMClient({ provider: llmProvider });

    const systemPrompt = `你是一个专业的银行交易分析师。

${componentPrompt}

## 响应格式

返回纯 JSON 格式（不要 markdown 代码块）：
{
  "content": "文字说明",
  "uiSchema": {
    "component": "Container",
    "children": [组件数组]
  }
}

## 重要规则

1. 使用 component 字段指定组件名称（不是 type）
2. 所有子组件必须放在 children 数组中
3. 风险分析报告必须包含导出按钮（Button with action: "export"）
4. 单笔交易分析必须包含查询表单
5. 返回纯 JSON，不要 markdown 代码块`;

    const transactionSummary = transactions.map(t => 
      `${t.id}: ${t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账'} ¥${t.amount} - ${t.counterparty}`
    ).join('\n');

    const userPrompt = `分析以下交易并生成风险分析报告：

${transactionSummary}

要求：
1. 生成交易概览卡片（使用Grid 4列布局展示统计信息）
2. 生成交易明细表格
3. 必须添加导出按钮
4. 直接返回JSON，不要代码块标记`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await client.stream([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]);

      for await (const chunk of stream) {
        if (chunk.content) {
          res.write(chunk.content.toString());
        }
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(JSON.stringify({ 
        error: `AI 调用失败: ${streamError instanceof Error ? streamError.message : '未知错误'}` 
      }));
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

    // 如果是模拟模式，返回预设的 UI Schema
    if (mode === 'mock') {
      console.log('Using mock mode for AI chat');
      const uiSchema = generateMockChatResponse(message, transactions);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const response = JSON.stringify({
        content: '根据您的请求，我已生成相关分析报告：',
        uiSchema,
      });
      
      const chunkSize = 50;
      for (let i = 0; i < response.length; i += chunkSize) {
        res.write(response.slice(i, i + chunkSize));
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
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

    const systemPrompt = `你是一个专业的银行交易分析师助手。

${componentPrompt}

${scenarioTemplates}

## 当前交易数据

${transactions.map(t => 
  `- ${t.id}: ${t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账'} ¥${t.amount} - ${t.counterparty}`
).join('\n')}

## 响应规则

1. 返回纯 JSON 格式，不要 markdown 代码块
2. 使用 component 字段指定组件名称（不是 type）
3. 所有子组件必须放在 children 数组中
4. 风险分析报告必须包含导出按钮
5. 单笔交易分析必须包含查询表单（流水号输入框、查询类型下拉框、查询按钮）
6. 使用 Grid 组件实现多列自适应布局`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await client.stream([
        new SystemMessage(systemPrompt),
        ...conversationHistory,
        new HumanMessage(message)
      ]);

      for await (const chunk of stream) {
        if (chunk.content) {
          res.write(chunk.content.toString());
        }
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(JSON.stringify({ 
        error: `AI 调用失败: ${streamError instanceof Error ? streamError.message : '未知错误'}` 
      }));
    }

    res.end();
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});
