import express from 'express';
import cors from 'cors';
import { aiRouter } from './routes/ai';
import { exportRouter } from './routes/export';
import { queryRouter } from './routes/query';

const app = express();
// 强制使用 3000 端口，避免使用系统保留的 9000 端口
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/ai', aiRouter);
app.use('/api/export', exportRouter);
app.use('/api/query', queryRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - POST /api/ai/review`);
  console.log(`   - POST /api/ai/chat`);
  console.log(`   - POST /api/export/transactions`);
  console.log(`   - POST /api/export/risk-report`);
  console.log(`   - POST /api/query/transaction-detail`);
  console.log(`   - POST /api/query/ai-query`);
});
