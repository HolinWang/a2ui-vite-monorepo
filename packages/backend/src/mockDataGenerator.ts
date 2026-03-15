/**
 * 模拟数据生成器
 * 当 AI 模式为 mock 时，使用预设的 UI Schema
 */

// 风险分析报告 UI Schema
export function generateMockRiskReport(transactions: any[]): any {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;
  
  return {
    component: 'Container',
    children: [
      {
        component: 'Card',
        props: { title: '风险分析报告', variant: 'highlight' },
        children: [
          {
            component: 'Grid',
            props: { columns: 4 },
            children: [
              {
                component: 'Statistic',
                props: {
                  label: '总交易数',
                  value: transactions.length,
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '总金额',
                  value: totalAmount.toLocaleString(),
                  prefix: '¥',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '收入笔数',
                  value: incomeCount,
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '支出笔数',
                  value: expenseCount,
                  status: 'warning',
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Card',
        props: { title: '风险评级' },
        children: [
          {
            component: 'Grid',
            props: { columns: 3 },
            children: [
              {
                component: 'Statistic',
                props: {
                  label: '风险等级',
                  value: '低风险',
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '合规状态',
                  value: '已通过',
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '风险评分',
                  value: '15',
                  suffix: '/ 100',
                }
              }
            ]
          },
          {
            component: 'Alert',
            props: {
              type: 'success',
              message: '所有选中的交易均通过风险评估，未发现异常交易。',
            }
          }
        ]
      },
      {
        component: 'Card',
        props: { title: '交易明细' },
        children: [
          {
            component: 'Table',
            props: {
              columns: [
                { key: 'id', title: '交易ID' },
                { key: 'type', title: '类型' },
                { key: 'amount', title: '金额' },
                { key: 'counterparty', title: '交易对手' },
                { key: 'status', title: '状态' },
              ],
              dataSource: transactions.map(t => ({
                id: t.id,
                type: t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账',
                amount: `¥${t.amount.toLocaleString()}`,
                counterparty: t.counterparty,
                status: t.status === 'completed' ? '已完成' : t.status === 'pending' ? '处理中' : '失败',
              })),
              bordered: true,
            }
          }
        ]
      },
      {
        component: 'Button',
        props: {
          text: '导出报告',
          variant: 'primary',
          action: 'export',
        }
      }
    ]
  };
}

// 单笔交易分析 UI Schema
export function generateMockSingleTransactionAnalysis(transaction: any): any {
  return {
    component: 'Container',
    children: [
      {
        component: 'Card',
        props: { title: '交易详情分析', variant: 'highlight' },
        children: [
          {
            component: 'Grid',
            props: { columns: 4 },
            children: [
              {
                component: 'Statistic',
                props: {
                  label: '交易金额',
                  value: transaction.amount.toLocaleString(),
                  prefix: '¥',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '交易状态',
                  value: transaction.status === 'completed' ? '已完成' : '处理中',
                  status: transaction.status === 'completed' ? 'success' : 'warning',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '风险等级',
                  value: '低',
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '交易渠道',
                  value: '网银',
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Grid',
        props: { columns: 2 },
        children: [
          {
            component: 'Card',
            props: { title: '基本信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '交易ID', value: transaction.id },
                    { label: '交易日期', value: transaction.date },
                    { label: '交易类型', value: transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '转账' },
                    { label: '币种', value: transaction.currency },
                    { label: '交易对手', value: transaction.counterparty },
                    { label: '账户', value: transaction.account },
                  ],
                  column: 1,
                }
              }
            ]
          },
          {
            component: 'Card',
            props: { title: '风险信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '风险等级', value: '低风险' },
                    { label: '风险评分', value: '15 / 100' },
                    { label: '合规检查', value: '通过' },
                    { label: '反洗钱', value: '已筛查' },
                  ],
                  column: 1,
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Card',
        props: { title: '审计日志' },
        children: [
          {
            component: 'Timeline',
            props: {
              items: [
                {
                  time: transaction.date + ' 10:00:00',
                  title: '交易发起',
                  status: 'success',
                  description: '用户通过网银发起交易',
                },
                {
                  time: transaction.date + ' 10:00:01',
                  title: '风控校验',
                  status: 'success',
                  description: '通过风险规则检查',
                },
                {
                  time: transaction.date + ' 10:00:02',
                  title: '反洗钱筛查',
                  status: 'success',
                  description: 'AML系统筛查通过',
                },
                {
                  time: transaction.date + ' 10:05:00',
                  title: '交易完成',
                  status: 'success',
                  description: '资金已到账',
                },
              ]
            }
          }
        ]
      },
      {
        component: 'Card',
        props: { title: '查询更多详情' },
        children: [
          {
            component: 'Stack',
            props: { direction: 'vertical', gap: 'md' },
            children: [
              {
                component: 'Stack',
                props: { direction: 'horizontal', gap: 'md' },
                children: [
                  {
                    component: 'Input',
                    props: {
                      label: '交易流水号',
                      name: 'serialNumber',
                      placeholder: '输入流水号查询',
                    }
                  },
                  {
                    component: 'Select',
                    props: {
                      label: '查询类型',
                      name: 'queryType',
                      options: [
                        { label: '账户信息', value: 'account' },
                        { label: '风险详情', value: 'risk' },
                        { label: '审计日志', value: 'audit' },
                      ],
                    }
                  }
                ]
              },
              {
                component: 'Button',
                props: {
                  text: '查询详情',
                  variant: 'primary',
                  action: 'query',
                }
              }
            ]
          }
        ]
      }
    ]
  };
}

// 查询结果 UI Schema
export function generateMockQueryResult(transactionId: string, queryType: string): any {
  const now = new Date();
  const transactionDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  return {
    component: 'Container',
    children: [
      {
        component: 'Card',
        props: { title: '查询结果', variant: 'highlight' },
        children: [
          {
            component: 'Grid',
            props: { columns: 4 },
            children: [
              {
                component: 'Statistic',
                props: {
                  label: '交易金额',
                  value: '50,000',
                  prefix: '¥',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '交易状态',
                  value: '已完成',
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '风险等级',
                  value: '低',
                  status: 'success',
                }
              },
              {
                component: 'Statistic',
                props: {
                  label: '交易渠道',
                  value: '网银',
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Grid',
        props: { columns: 2 },
        children: [
          {
            component: 'Card',
            props: { title: '基本信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '交易时间', value: transactionDate.toISOString().replace('T', ' ').substring(0, 19) },
                    { label: '结算时间', value: new Date(transactionDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) },
                    { label: '交易渠道', value: '网银' },
                    { label: '流水号', value: `SN${Date.now()}` },
                    { label: '业务类型', value: '对公转账' },
                  ],
                  column: 1,
                }
              }
            ]
          },
          {
            component: 'Card',
            props: { title: '账户信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '付款账户', value: '****1234' },
                    { label: '付款人', value: '付款方公司' },
                    { label: '付款银行', value: '中国工商银行' },
                    { label: '收款账户', value: '****5678' },
                    { label: '收款人', value: '收款方公司' },
                    { label: '收款银行', value: '中国建设银行' },
                  ],
                  column: 1,
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Grid',
        props: { columns: 2 },
        children: [
          {
            component: 'Card',
            props: { title: '金额信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '交易金额', value: '¥50,000.00' },
                    { label: '手续费', value: '¥25.00' },
                    { label: '结算金额', value: '¥49,975.00' },
                    { label: '币种', value: 'CNY' },
                  ],
                  column: 1,
                }
              }
            ]
          },
          {
            component: 'Card',
            props: { title: '风险信息' },
            children: [
              {
                component: 'Descriptions',
                props: {
                  items: [
                    { label: '风险等级', value: '低风险' },
                    { label: '风险评分', value: '15 / 100' },
                    { label: '合规检查', value: '通过' },
                    { label: '反洗钱状态', value: '已筛查' },
                  ],
                  column: 1,
                }
              }
            ]
          }
        ]
      },
      {
        component: 'Card',
        props: { title: '审计日志' },
        children: [
          {
            component: 'Timeline',
            props: {
              items: [
                {
                  time: transactionDate.toISOString().replace('T', ' ').substring(0, 19),
                  title: '交易发起',
                  status: 'success',
                  description: '用户通过网银发起交易',
                },
                {
                  time: new Date(transactionDate.getTime() + 1000).toISOString().replace('T', ' ').substring(0, 19),
                  title: '风控校验',
                  status: 'success',
                  description: '通过风险规则检查',
                },
                {
                  time: new Date(transactionDate.getTime() + 2000).toISOString().replace('T', ' ').substring(0, 19),
                  title: '反洗钱筛查',
                  status: 'success',
                  description: 'AML系统筛查通过',
                },
                {
                  time: new Date(transactionDate.getTime() + 3600000).toISOString().replace('T', ' ').substring(0, 19),
                  title: '交易完成',
                  status: 'success',
                  description: '资金已到账',
                },
              ]
            }
          }
        ]
      }
    ]
  };
}

// 聊天响应模拟
export function generateMockChatResponse(message: string, transactions: any[]): any {
  const lowerMessage = message.toLowerCase();
  
  // 根据消息内容返回不同的 UI Schema
  if (lowerMessage.includes('风险') || lowerMessage.includes('分析')) {
    return generateMockRiskReport(transactions);
  }
  
  if (lowerMessage.includes('单笔') || lowerMessage.includes('详情')) {
    return generateMockSingleTransactionAnalysis(transactions[0]);
  }
  
  if (lowerMessage.includes('报表') || lowerMessage.includes('报告')) {
    return generateMockRiskReport(transactions);
  }
  
  // 默认返回风险报告
  return generateMockRiskReport(transactions);
}
