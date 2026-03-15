import { Router, Request, Response } from 'express';
// 替换为 OpenAI SDK，用于阿里云 DashScope 兼容模式
import OpenAI from 'openai';
import { generateMockQueryResult } from '../mockDataGenerator';

export const queryRouter = Router();

// 初始化 OpenAI 客户端，使用阿里云 DashScope 兼容模式
const openai = new OpenAI({
  apiKey: process.env.ALI_AI_API_KEY || process.env.DASHSCOPE_API_KEY, // 支持两种环境变量名
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// 交易详情查询接口
queryRouter.post('/transaction-detail', async (req: Request, res: Response) => {
  try {
    const { transactionId, queryType, queryParams } = req.body;
    
    if (!transactionId) {
      res.status(400).json({ error: 'Transaction ID is required' });
      return;
    }

    const mockDetailData = generateMockTransactionDetail(transactionId, queryType, queryParams);
    
    res.json({
      success: true,
      data: mockDetailData
    });
  } catch (error) {
    console.error('Query transaction detail error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

// 批量查询交易详情
queryRouter.post('/batch-details', async (req: Request, res: Response) => {
  try {
    const { transactionIds } = req.body;
    
    if (!transactionIds || !Array.isArray(transactionIds)) {
      res.status(400).json({ error: 'Transaction IDs array is required' });
      return;
    }

    const results = transactionIds.map(id => generateMockTransactionDetail(id));
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch query error:', error);
    res.status(500).json({ error: 'Batch query failed' });
  }
});

// AI 辅助查询 - 使用阿里云通义千问生成 UI Schema
queryRouter.post('/ai-query', async (req: Request, res: Response) => {
  try {
    const { transactionId, queryFields, transaction, queryParams, mode } = req.body;

    // 模拟模式
    if (mode === 'mock') {
      console.log('Using mock mode for AI query');
      const uiSchema = generateMockQueryResult(transactionId, queryParams?.queryType || 'detail');
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const response = JSON.stringify(uiSchema);
      const chunkSize = 50;
      
      for (let i = 0; i < response.length; i += chunkSize) {
        res.write(response.slice(i, i + chunkSize));
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      res.end();
      return;
    }
    
    // 真实模式调用阿里云通义千问
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = `你是一个银行交易查询系统。当用户查询交易详情时，你需要返回一个完整的 UI Schema（JSON格式），前端会直接渲染成友好的界面。

## 必须遵守的规则
1. 返回纯 JSON 格式，不要包含 markdown 代码块标记
2. 使用 component 字段指定组件名称（不是 type）
3. 所有组件必须放在 children 数组中
4. 确保 JSON 格式正确，可以解析

## 可用组件列表

### Container（容器）
- 根容器，用于包裹所有内容
- props: 无需特殊属性
- children: 子组件数组

### Card（卡片）
- 用于分组展示内容
- props: { title: "卡片标题", variant?: "default"|"highlight"|"warning"|"success" }
- variant 含义: default=普通, highlight=高亮蓝色, warning=警告橙色, success=成功绿色

### Grid（网格布局）
- 用于多列布局
- props: { columns: 2|3|4 }
- children: 子组件数组

### Statistic（统计数值）
- 展示关键数值
- props: { label: "标签", value: "数值", prefix?: "前缀如¥", suffix?: "后缀", status?: "default"|"success"|"warning"|"error" }

### Descriptions（描述列表）
- 展示键值对信息
- props: { items: [{ label: "标签", value: "值" }], column?: 2 }

### Timeline（时间线）
- 展示流程历史
- props: { items: [{ time: "时间", title: "标题", description?: "描述", status?: "success"|"processing"|"error" }] }

### Tag（标签）
- 展示状态标签
- props: { color: "blue"|"green"|"orange"|"red", text: "标签文本" }

### Alert（提示框）
- 展示重要提示
- props: { type: "info"|"success"|"warning"|"error", message: "提示内容" }

### Divider（分割线）
- props: { title?: "分割线标题" }

## 返回格式示例

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
          "children": [
            { "component": "Statistic", "props": { "label": "交易金额", "value": "50000", "prefix": "¥" } },
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
            { "component": "Descriptions", "props": { "items": [{"label": "交易时间", "value": "2024-01-01 10:00:00"}] } }
          ]
        },
        {
          "component": "Card",
          "props": { "title": "风险信息" },
          "children": [
            { "component": "Descriptions", "props": { "items": [{"label": "风险等级", "value": "低"}] } }
          ]
        }
      ]
    },
    {
      "component": "Card",
      "props": { "title": "审计日志" },
      "children": [
        { "component": "Timeline", "props": { "items": [{"time": "2024-01-01 10:00", "title": "交易发起", "status": "success"}] } }
      ]
    }
  ]
}`;

    const userPrompt = `请为交易 ${transactionId} 生成详细的交易详情 UI 展示。

基础交易信息：
${JSON.stringify(transaction, null, 2)}

查询参数：
${JSON.stringify(queryParams, null, 2)}

请生成完整的 UI Schema，包含以下内容：
1. 交易概览卡片（交易ID、金额、状态、风险等级）- 使用 Grid 4列布局
2. 基本信息 + 账户信息并排卡片 - 使用 Grid 2列布局
3. 金额信息 + 风险信息并排卡片 - 使用 Grid 2列布局
4. 审计日志时间线

注意：
- 使用真实合理的模拟数据
- 风险等级低用绿色/success，中用橙色/warning，高用红色/error
- 时间线要展示完整的交易流程
- 直接返回JSON，不要代码块标记`;

    // 流式调用阿里云通义千问
    const stream = await openai.chat.completions.create({
      model: process.env.ALI_QWEN_MODEL || 'qwen-max', // 支持自定义模型
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true,
      temperature: 0.3
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('AI query error:', error);
    // 防止流式响应开始后再次发送响应
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI query failed' });
    } else {
      res.end();
    }
  }
});

// 生成模拟的交易详情数据
function generateMockTransactionDetail(transactionId: string, queryType?: string, queryParams?: any) {
  const now = new Date();
  const transactionDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  const channels = ['网银', '手机银行', 'ATM', '柜台', '第三方支付'];
  const riskLevels = ['低', '中', '高'];
  const purposes = ['货款', '工资', '报销', '转账', '缴费', '还款'];
  
  const randomChannel = channels[Math.floor(Math.random() * channels.length)];
  const randomRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
  
  return {
    transactionId,
    basicInfo: {
      transactionTime: transactionDate.toISOString().replace('T', ' ').substring(0, 19),
      settlementTime: new Date(transactionDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      transactionChannel: randomChannel,
      transactionTerminal: `TERM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      serialNumber: `SN${Date.now()}${Math.floor(Math.random() * 10000)}`,
      businessType: '对公转账',
      instructionId: `INS${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    },
    accountInfo: {
      payerAccount: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      payerName: queryParams?.payerName || '付款方公司',
      payerBank: '中国工商银行',
      payerBankBranch: '北京分行朝阳支行',
      payeeAccount: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      payeeName: queryParams?.payeeName || '收款方公司',
      payeeBank: '中国建设银行',
      payeeBankBranch: '上海分行浦东支行'
    },
    amountInfo: {
      transactionAmount: queryParams?.amount || Math.floor(Math.random() * 100000) + 1000,
      fee: Math.floor(Math.random() * 50) + 5,
      settlementAmount: queryParams?.amount || Math.floor(Math.random() * 100000) + 1000,
      currency: 'CNY',
      exchangeRate: null,
      taxAmount: Math.floor(Math.random() * 1000)
    },
    riskInfo: {
      riskLevel: randomRiskLevel,
      riskTags: randomRiskLevel === '高' ? ['大额交易', '首次交易对手'] : randomRiskLevel === '中' ? ['跨行转账'] : ['常规交易'],
      complianceCheck: '通过',
      amlStatus: '已筛查',
      fraudScore: Math.floor(Math.random() * 100),
      riskScore: randomRiskLevel === '高' ? 75 : randomRiskLevel === '中' ? 45 : 15
    },
    additionalInfo: {
      purpose: randomPurpose,
      contractNumber: `CT${Date.now()}`,
      invoiceNumber: `INV${Date.now()}`,
      remark: queryParams?.remark || '',
      operatorId: `OP${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
      authorizedBy: '系统自动授权',
      department: '财务部',
      costCenter: 'CC00' + Math.floor(Math.random() * 10 + 1)
    },
    auditTrail: [
      {
        time: transactionDate.toISOString(),
        action: '交易发起',
        operator: '用户',
        result: '成功'
      },
      {
        time: new Date(transactionDate.getTime() + 1000).toISOString(),
        action: '风控校验',
        operator: '系统',
        result: '通过'
      },
      {
        time: new Date(transactionDate.getTime() + 2000).toISOString(),
        action: '反洗钱筛查',
        operator: '系统',
        result: '无异常'
      },
      {
        time: new Date(transactionDate.getTime() + 3600000).toISOString(),
        action: '交易完成',
        operator: '清算系统',
        result: '成功'
      }
    ]
  };
}