import { Router, Request, Response } from 'express';

export const exportRouter = Router();

// 导出交易数据为 CSV (Excel 兼容格式)
exportRouter.post('/transactions', (req: Request, res: Response) => {
  try {
    const { transactions, reportType, reportData } = req.body;
    
    if (!transactions || transactions.length === 0) {
      res.status(400).json({ error: 'No transactions to export' });
      return;
    }

    // 生成 CSV 内容
    const headers = [
      '交易ID',
      '交易日期',
      '交易类型',
      '金额',
      '币种',
      '对方账户',
      '本方账户',
      '交易分类',
      '交易状态',
      '交易描述',
      '备注'
    ];

    const typeMap: Record<string, string> = {
      income: '收入',
      expense: '支出',
      transfer: '转账'
    };

    const statusMap: Record<string, string> = {
      completed: '已完成',
      pending: '处理中',
      failed: '失败'
    };

    const rows = transactions.map((t: any) => [
      t.id,
      t.date,
      typeMap[t.type] || t.type,
      t.amount,
      t.currency,
      t.counterparty,
      t.account,
      t.category,
      statusMap[t.status] || t.status,
      t.description,
      t.reference || ''
    ]);

    // 添加 BOM 以支持 Excel 正确识别 UTF-8
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    // 设置响应头
    const filename = `交易分析报告_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// 导出风险分析报告
exportRouter.post('/risk-report', (req: Request, res: Response) => {
  try {
    const { transactions, riskAnalysis } = req.body;
    
    const BOM = '\uFEFF';
    const headers = ['字段', '内容'];
    
    const rows = [
      ['报告生成时间', new Date().toLocaleString('zh-CN')],
      ['分析交易笔数', transactions?.length || 0],
      ['风险等级', riskAnalysis?.level || '中风险'],
      ['风险描述', riskAnalysis?.description || ''],
      ['建议措施', riskAnalysis?.suggestions?.join('; ') || ''],
      ['', ''],
      ['交易明细', ''],
      ...(transactions?.map((t: any, i: number) => [
        `交易${i + 1}`,
        `${t.id} | ${t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账'} | ¥${t.amount} | ${t.counterparty}`
      ]) || [])
    ];

    const csvContent = BOM + [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
    ].join('\n');

    const filename = `风险分析报告_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export risk report error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});
