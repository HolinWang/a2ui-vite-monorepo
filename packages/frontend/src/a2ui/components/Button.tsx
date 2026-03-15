import React from 'react';
import { Loader2, Download, Search } from 'lucide-react';
import { useAction } from '../ActionContext';

interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  action?: 'export' | 'query' | 'submit' | 'custom';
  // 导出相关属性
  exportData?: any[];
  reportType?: string;
  // 查询相关属性
  queryType?: string;
  queryParams?: Record<string, any>;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  action,
  exportData,
  reportType,
  queryType,
  queryParams,
}) => {
  const { handleExport, handleQuery, formData, isLoading, transactions } = useAction();

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handleClick = async () => {
    console.log('Button clicked:', { action, queryType, formData, queryParams });

    if (onClick) {
      onClick();
      return;
    }

    switch (action) {
      case 'export':
        // 使用传入的数据或当前交易数据
        const dataToExport = exportData || transactions || [];
        console.log('Exporting data:', dataToExport);
        await handleExport(dataToExport, reportType);
        break;
      
      case 'query':
      case 'submit':
        // 使用传入的参数或表单数据
        const params = queryParams || formData;
        console.log('Query params:', params);
        if (Object.keys(params).length === 0) {
          console.warn('No query parameters provided');
          return;
        }
        await handleQuery(queryType || 'transaction-detail', params);
        break;
      
      default:
        console.log('No action specified for button');
        break;
    }
  };

  // 根据操作类型显示图标
  const renderIcon = () => {
    if (loading || isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (action === 'export') {
      return <Download className="w-4 h-4" />;
    }
    if (action === 'query' || action === 'submit') {
      return <Search className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        disabled:cursor-not-allowed
      `}
    >
      {renderIcon()}
      {text}
    </button>
  );
};
