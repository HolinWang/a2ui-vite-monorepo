import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UISchema } from './types';

// 表单数据类型
export type FormData = Record<string, string | number | boolean>;

// 操作上下文类型
interface ActionContextType {
  // 表单数据
  formData: FormData;
  setFormField: (name: string, value: string | number | boolean) => void;
  clearFormData: () => void;
  
  // 当前交易的上下文数据
  transactionContext: Record<string, any>;
  setTransactionContext: (data: Record<string, any>) => void;
  
  // 当前选中的交易列表
  transactions: any[];
  
  // 处理导出操作
  handleExport: (transactions: any[], reportType?: string) => Promise<void>;
  
  // 处理查询操作 - 返回 UI Schema
  handleQuery: (queryType: string, params: FormData) => Promise<UISchema | null>;
  
  // 查询结果（原始数据，向后兼容）
  queryResult: any;
  setQueryResult: (result: any) => void;
  
  // 查询结果的 UI Schema
  queryUISchema: UISchema | null;
  setQueryUISchema: (schema: UISchema | null) => void;
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

interface ActionProviderProps {
  children: ReactNode;
  transactions?: any[];
  onQueryResult?: (result: any) => void;
}

export const ActionProvider: React.FC<ActionProviderProps> = ({ 
  children, 
  transactions = [],
  onQueryResult 
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [transactionContext, setTransactionContext] = useState<Record<string, any>>({});
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryUISchema, setQueryUISchema] = useState<UISchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setFormField = useCallback((name: string, value: string | number | boolean) => {
    console.log('Setting form field:', name, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const clearFormData = useCallback(() => {
    setFormData({});
  }, []);

  const handleExport = useCallback(async (transactionsToExport: any[], reportType?: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/export/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: transactionsToExport,
          reportType: reportType || 'transactions'
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `交易分析报告_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQuery = useCallback(async (queryType: string, params: FormData): Promise<UISchema | null> => {
    console.log('handleQuery called:', { queryType, params, transactions });
    
    try {
      setIsLoading(true);
      
      // 获取交易ID
      const transactionId = params.transactionId || params.serialNumber || transactions[0]?.id;
      
      const requestBody = {
        transactionId,
        queryType,
        queryParams: params,
        transaction: transactions[0]
      };
      
      console.log('Sending query request:', requestBody);
      
      const response = await fetch('/api/query/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      console.log('Query raw result:', result);

      // 清理可能的 markdown 代码块标记
      let cleanResult = result.trim();
      if (cleanResult.startsWith('```json')) {
        cleanResult = cleanResult.slice(7);
      } else if (cleanResult.startsWith('```')) {
        cleanResult = cleanResult.slice(3);
      }
      if (cleanResult.endsWith('```')) {
        cleanResult = cleanResult.slice(0, -3);
      }
      cleanResult = cleanResult.trim();

      console.log('Clean result:', cleanResult);

      try {
        const parsed = JSON.parse(cleanResult);
        console.log('Parsed result:', parsed);
        
        // 检查是否是 UI Schema
        if (parsed.component || parsed.children) {
          console.log('Setting UI Schema:', parsed);
          setQueryUISchema(parsed);
          setQueryResult(null); // 清除旧的结果
          return parsed;
        }
        
        // 向后兼容：如果不是 UI Schema，存储原始数据
        console.log('Setting raw query result:', parsed);
        setQueryResult(parsed);
        setQueryUISchema(null);
        onQueryResult?.(parsed);
        return null;
      } catch (e) {
        console.error('Parse query result error:', e, 'Raw result:', cleanResult);
        return null;
      }
    } catch (error) {
      console.error('Query error:', error);
      alert('查询失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [transactions, onQueryResult]);

  return (
    <ActionContext.Provider
      value={{
        formData,
        setFormField,
        clearFormData,
        transactionContext,
        setTransactionContext,
        transactions,
        handleExport,
        handleQuery,
        queryResult,
        setQueryResult,
        queryUISchema,
        setQueryUISchema,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useAction = (): ActionContextType => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useAction must be used within an ActionProvider');
  }
  return context;
};
