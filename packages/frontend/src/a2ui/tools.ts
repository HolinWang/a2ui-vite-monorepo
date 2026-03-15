/**
 * Tool Calling 定义
 * AI 通过工具调用生成结构化的 UI Schema
 */

import { ToolDefinition, ToolCallResult, UISchema } from './types';

/**
 * 工具注册表
 */
export const toolRegistry: ToolDefinition[] = [
  // ==================== 布局工具 ====================
  {
    name: 'createCard',
    description: '创建卡片容器，用于包裹和分组内容',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '卡片标题',
        },
        subtitle: {
          type: 'string',
          description: '卡片副标题',
        },
        content: {
          type: 'string',
          description: '卡片内容描述',
        },
      },
    },
  },
  {
    name: 'createGrid',
    description: '创建网格布局，用于多列展示',
    parameters: {
      type: 'object',
      properties: {
        cols: {
          type: 'number',
          description: '列数（1-12）',
        },
        gap: {
          type: 'string',
          enum: ['none', 'sm', 'md', 'lg'],
          description: '列间距',
        },
      },
      required: ['cols'],
    },
  },
  {
    name: 'createStack',
    description: '创建堆叠布局，垂直或水平排列元素',
    parameters: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['horizontal', 'vertical'],
          description: '排列方向',
        },
        gap: {
          type: 'string',
          enum: ['none', 'sm', 'md', 'lg'],
          description: '元素间距',
        },
      },
    },
  },

  // ==================== 表单工具 ====================
  {
    name: 'createForm',
    description: '创建表单，用于收集用户输入',
    parameters: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          description: '表单字段列表，格式：[{name: "字段名", type: "类型", label: "标签", required: boolean}]',
        },
        submitText: {
          type: 'string',
          description: '提交按钮文本',
        },
      },
      required: ['fields'],
    },
  },
  {
    name: 'createInput',
    description: '创建输入框',
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: '输入框标签',
        },
        placeholder: {
          type: 'string',
          description: '占位符文本',
        },
        type: {
          type: 'string',
          enum: ['text', 'password', 'email', 'number', 'tel', 'url'],
          description: '输入类型',
        },
        required: {
          type: 'boolean',
          description: '是否必填',
        },
      },
    },
  },
  {
    name: 'createButton',
    description: '创建按钮',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '按钮文本',
        },
        variant: {
          type: 'string',
          enum: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
          description: '按钮样式',
        },
        size: {
          type: 'string',
          enum: ['sm', 'md', 'lg'],
          description: '按钮大小',
        },
      },
      required: ['text'],
    },
  },

  // ==================== 展示工具 ====================
  {
    name: 'createTable',
    description: '创建表格，用于展示结构化数据',
    parameters: {
      type: 'object',
      properties: {
        columns: {
          type: 'array',
          description: '列定义，格式：[{key: "字段名", title: "显示名"}]',
        },
        data: {
          type: 'array',
          description: '表格数据',
        },
        bordered: {
          type: 'boolean',
          description: '是否有边框',
        },
      },
      required: ['columns', 'data'],
    },
  },
  {
    name: 'createStatistic',
    description: '创建统计数值展示',
    parameters: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: '统计项标签',
        },
        value: {
          type: 'number',
          description: '统计值',
        },
        prefix: {
          type: 'string',
          description: '前缀（如货币符号）',
        },
        suffix: {
          type: 'string',
          description: '后缀（如单位）',
        },
        trend: {
          type: 'string',
          enum: ['up', 'down', 'flat'],
          description: '趋势方向',
        },
        trendValue: {
          type: 'string',
          description: '趋势值（如 +12.5%）',
        },
      },
      required: ['label', 'value'],
    },
  },
  {
    name: 'createList',
    description: '创建列表',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: '列表项数组',
        },
        ordered: {
          type: 'boolean',
          description: '是否为有序列表',
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'createText',
    description: '创建文本',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '文本内容',
        },
        variant: {
          type: 'string',
          enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption'],
          description: '文本样式',
        },
        color: {
          type: 'string',
          enum: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
          description: '文本颜色',
        },
      },
      required: ['content'],
    },
  },

  // ==================== 反馈工具 ====================
  {
    name: 'createAlert',
    description: '创建警告提示',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '提示内容',
        },
        type: {
          type: 'string',
          enum: ['info', 'success', 'warning', 'error'],
          description: '提示类型',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'createProgress',
    description: '创建进度条',
    parameters: {
      type: 'object',
      properties: {
        percent: {
          type: 'number',
          description: '进度百分比（0-100）',
        },
        status: {
          type: 'string',
          enum: ['normal', 'success', 'error'],
          description: '进度状态',
        },
      },
      required: ['percent'],
    },
  },
  {
    name: 'createBadge',
    description: '创建徽章',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '徽章内容',
        },
        variant: {
          type: 'string',
          enum: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
          description: '徽章样式',
        },
      },
      required: ['content'],
    },
  },

  // ==================== 复合工具 ====================
  {
    name: 'createTransactionSummary',
    description: '创建交易摘要卡片，展示交易统计信息',
    parameters: {
      type: 'object',
      properties: {
        totalIncome: {
          type: 'number',
          description: '总收入',
        },
        totalExpense: {
          type: 'number',
          description: '总支出',
        },
        transactionCount: {
          type: 'number',
          description: '交易数量',
        },
        trend: {
          type: 'string',
          description: '趋势描述',
        },
      },
      required: ['totalIncome', 'totalExpense', 'transactionCount'],
    },
  },
  {
    name: 'createTransactionDetail',
    description: '创建交易详情卡片，展示单笔交易的详细信息',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '交易ID',
        },
        type: {
          type: 'string',
          enum: ['income', 'expense', 'transfer'],
          description: '交易类型',
        },
        amount: {
          type: 'number',
          description: '交易金额',
        },
        counterparty: {
          type: 'string',
          description: '对方账户',
        },
        category: {
          type: 'string',
          description: '交易分类',
        },
        status: {
          type: 'string',
          enum: ['completed', 'pending', 'failed'],
          description: '交易状态',
        },
        description: {
          type: 'string',
          description: '交易描述',
        },
        riskLevel: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: '风险等级',
        },
        analysis: {
          type: 'string',
          description: 'AI 分析建议',
        },
      },
      required: ['id', 'type', 'amount', 'counterparty', 'status'],
    },
  },
  {
    name: 'createRiskAlert',
    description: '创建风险预警卡片',
    parameters: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: '风险等级',
        },
        title: {
          type: 'string',
          description: '预警标题',
        },
        description: {
          type: 'string',
          description: '风险描述',
        },
        suggestions: {
          type: 'array',
          description: '改进建议列表',
        },
      },
      required: ['level', 'title', 'description'],
    },
  },
];

/**
 * 执行工具调用
 * 将 Tool Call 转换为 UI Schema
 */
export function executeToolCall(tool: string, args: Record<string, any>): ToolCallResult {
  const schema = generateSchemaFromTool(tool, args);
  
  return {
    tool,
    args,
    schema,
  };
}

/**
 * 根据工具调用生成 UI Schema
 */
function generateSchemaFromTool(tool: string, args: Record<string, any>): UISchema {
  switch (tool) {
    // 布局工具
    case 'createCard':
      return {
        component: 'Card',
        props: {
          title: args.title,
          subtitle: args.subtitle,
        },
        children: args.content
          ? [{ component: 'Text', props: { content: args.content } }]
          : [],
      };

    case 'createGrid':
      return {
        component: 'Grid',
        props: {
          cols: args.cols || 2,
          gap: args.gap || 'md',
        },
        children: [],
      };

    case 'createStack':
      return {
        component: 'Stack',
        props: {
          direction: args.direction || 'vertical',
          gap: args.gap || 'md',
        },
        children: [],
      };

    // 表单工具
    case 'createForm':
      return {
        component: 'Form',
        props: {
          layout: 'vertical',
        },
        children: [
          ...(args.fields || []).map((field: any) => ({
            component: 'Input',
            props: {
              label: field.label || field.name,
              name: field.name,
              type: field.type || 'text',
              required: field.required || false,
            },
          })),
          ...(args.submitText
            ? [
                {
                  component: 'Button',
                  props: {
                    text: args.submitText,
                    variant: 'primary' as const,
                  },
                },
              ]
            : []),
        ],
      };

    case 'createInput':
      return {
        component: 'Input',
        props: {
          label: args.label,
          placeholder: args.placeholder,
          type: args.type || 'text',
          required: args.required || false,
        },
      };

    case 'createButton':
      return {
        component: 'Button',
        props: {
          text: args.text,
          variant: args.variant || 'primary',
          size: args.size || 'md',
        },
      };

    // 展示工具
    case 'createTable':
      return {
        component: 'Table',
        props: {
          columns: args.columns,
          dataSource: args.data,
          bordered: args.bordered || false,
        },
      };

    case 'createStatistic':
      return {
        component: 'Statistic',
        props: {
          label: args.label,
          value: args.value,
          prefix: args.prefix,
          suffix: args.suffix,
          trend: args.trend,
          trendValue: args.trendValue,
        },
      };

    case 'createList':
      return {
        component: 'List',
        props: {
          dataSource: args.items,
        },
        children: [],
      };

    case 'createText':
      return {
        component: 'Text',
        props: {
          content: args.content,
          variant: args.variant || 'body',
          color: args.color || 'default',
        },
      };

    // 反馈工具
    case 'createAlert':
      return {
        component: 'Alert',
        props: {
          content: args.content,
          type: args.type || 'info',
        },
      };

    case 'createProgress':
      return {
        component: 'Progress',
        props: {
          percent: args.percent,
          status: args.status || 'normal',
        },
      };

    case 'createBadge':
      return {
        component: 'Badge',
        props: {
          content: args.content,
          variant: args.variant || 'default',
        },
      };

    // 复合工具
    case 'createTransactionSummary':
      return {
        component: 'Card',
        props: { title: '交易概览' },
        children: [
          {
            component: 'Grid',
            props: { cols: 3, gap: 'md' },
            children: [
              {
                component: 'Statistic',
                props: {
                  label: '总收入',
                  value: args.totalIncome,
                  prefix: '¥',
                  trend: 'up',
                  trendValue: args.trend,
                },
              },
              {
                component: 'Statistic',
                props: {
                  label: '总支出',
                  value: args.totalExpense,
                  prefix: '¥',
                  trend: 'down',
                },
              },
              {
                component: 'Statistic',
                props: {
                  label: '交易笔数',
                  value: args.transactionCount,
                  suffix: '笔',
                },
              },
            ],
          },
        ],
      };

    case 'createTransactionDetail': {
      const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
        completed: 'success',
        pending: 'warning',
        failed: 'danger',
      };

      const riskColors: Record<string, 'success' | 'warning' | 'danger'> = {
        low: 'success',
        medium: 'warning',
        high: 'danger',
      };
      
      const status = (args.status as string) || 'completed';
      const riskLevel = (args.riskLevel as string) || 'low';

      return {
        component: 'Card',
        props: { title: `交易详情 - ${args.id}` },
        children: [
          {
            component: 'Grid',
            props: { cols: 2, gap: 'lg' },
            children: [
              {
                component: 'Stack',
                props: { direction: 'vertical', gap: 'sm' },
                children: [
                  {
                    component: 'Text',
                    props: {
                      content: `类型：${args.type === 'income' ? '收入' : args.type === 'expense' ? '支出' : '转账'}`,
                      variant: 'body',
                    },
                  },
                  {
                    component: 'Text',
                    props: {
                      content: `金额：¥${args.amount.toLocaleString()}`,
                      variant: 'h3',
                      color: args.type === 'income' ? 'success' : args.type === 'expense' ? 'danger' : 'primary',
                    },
                  },
                ],
              },
              {
                component: 'Stack',
                props: { direction: 'vertical', gap: 'sm' },
                children: [
                  {
                    component: 'Text',
                    props: { content: `对方：${args.counterparty}` },
                  },
                  {
                    component: 'Text',
                    props: { content: `分类：${args.category || '未分类'}` },
                  },
                  {
                    component: 'Badge',
                    props: {
                      content: status === 'completed' ? '已完成' : status === 'pending' ? '处理中' : '失败',
                      variant: statusVariant[status],
                    },
                  },
                ],
              },
            ],
          },
          args.description
            ? {
                component: 'Text',
                props: { content: `描述：${args.description}`, variant: 'small' },
              }
            : null,
          args.riskLevel
            ? {
                component: 'Alert',
                props: {
                  content: `风险等级：${riskLevel === 'low' ? '低' : riskLevel === 'medium' ? '中' : '高'}${args.analysis ? ` - ${args.analysis}` : ''}`,
                  type: riskColors[riskLevel] === 'success' ? 'info' : riskColors[riskLevel] === 'warning' ? 'warning' : 'error',
                },
              }
            : null,
        ].filter(Boolean) as UISchema[],
      };
      }

    case 'createRiskAlert': {
      const levelColors: Record<string, 'info' | 'warning' | 'error'> = {
        low: 'info',
        medium: 'warning',
        high: 'error',
      };
      
      const level = (args.level as string) || 'low';

      return {
        component: 'Card',
        props: { title: '风险预警' },
        children: [
          {
            component: 'Alert',
            props: {
              content: `${args.title}：${args.description}`,
              type: levelColors[level],
            },
          },
          ...(args.suggestions || []).map((suggestion: string) => ({
            component: 'Text',
            props: { content: `• ${suggestion}`, variant: 'small' },
          })),
        ],
      };
    }

    default:
      console.warn(`Unknown tool: ${tool}`);
      return {
        component: 'Card',
        props: { title: '未识别的工具' },
        children: [
          {
            component: 'Text',
            props: { content: `工具名称: ${tool}` },
          },
        ],
      };
  }
}

/**
 * 获取工具定义提示词（供 AI 使用）
 */
export function generateToolPrompt(): string {
  let prompt = '# 可用工具列表\n\n';
  prompt += '你可以使用以下工具生成 UI：\n\n';

  toolRegistry.forEach((tool) => {
    prompt += `## ${tool.name}\n${tool.description}\n\n`;
    prompt += '**参数：**\n';
    
    Object.entries(tool.parameters.properties).forEach(([key, value]) => {
      const required = tool.parameters.required?.includes(key) ? '（必填）' : '';
      const enumInfo = value.enum ? `，可选值：${value.enum.join(', ')}` : '';
      prompt += `- \`${key}\`: ${value.description}${required}${enumInfo}\n`;
    });
    
    prompt += '\n';
  });

  return prompt;
}
