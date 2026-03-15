import React from 'react';
import { A2UIComponent } from '../types';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface A2UIRendererProps {
  component: A2UIComponent;
}

const A2UIRenderer: React.FC<A2UIRendererProps> = ({ component }) => {
  const renderComponent = (comp: A2UIComponent): React.ReactNode => {
    // 支持 component 和 type 两种字段名（向后兼容）
    const componentType = comp.component || (comp as any).type;
    const content = (comp as any).content;
    
    switch (componentType) {
      case 'card':
      case 'Card':
        return (
          <div className="bg-white rounded-lg shadow p-4 mb-4" {...comp.props}>
            {comp.children?.map((child, idx) => (
              <React.Fragment key={idx}>{renderComponent(child)}</React.Fragment>
            ))}
            {content && <p className="text-gray-700">{content}</p>}
          </div>
        );

      case 'list':
      case 'List':
        return (
          <ul className="space-y-2 mb-4" {...comp.props}>
            {comp.children?.map((child, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {renderComponent(child)}
              </li>
            ))}
          </ul>
        );

      case 'table':
      case 'Table':
        const rows = comp.props?.rows || comp.props?.dataSource || [];
        const headers = comp.props?.headers || comp.props?.columns?.map((c: any) => c.title) || [];
        return (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200" {...comp.props}>
              {headers.length > 0 && (
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header: string, idx: number) => (
                      <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row: any, idx: number) => (
                  <tr key={idx}>
                    {Array.isArray(row) 
                      ? row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900">
                            {cell}
                          </td>
                        ))
                      : Object.values(row).map((cell: any, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900">
                            {cell}
                          </td>
                        ))
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'text':
      case 'Text':
        const variant = comp.props?.variant || 'body';
        const textClasses = {
          h1: 'text-2xl font-bold mb-3',
          h2: 'text-xl font-bold mb-2',
          h3: 'text-lg font-semibold mb-2',
          body: 'text-base mb-2',
          small: 'text-sm text-gray-600',
        };
        return (
          <p className={`text-gray-800 ${textClasses[variant as keyof typeof textClasses]}`} {...comp.props}>
            {content}
          </p>
        );

      case 'alert':
      case 'Alert':
        const alertType = comp.props?.type || 'info';
        const alertConfig = {
          info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, color: 'text-blue-700' },
          success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, color: 'text-green-700' },
          warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle, color: 'text-yellow-700' },
          error: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, color: 'text-red-700' },
        };
        const config = alertConfig[alertType as keyof typeof alertConfig];
        const IconComponent = config.icon;
        return (
          <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-4 flex items-start gap-3`} {...comp.props}>
            <IconComponent className={`w-5 h-5 ${config.color} mt-0.5`} />
            <div className={`text-sm ${config.color}`}>
              {content}
              {comp.children?.map((child, idx) => (
                <React.Fragment key={idx}>{renderComponent(child)}</React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'badge':
      case 'Badge':
        const badgeVariant = comp.props?.variant || 'default';
        const badgeClasses = {
          default: 'bg-gray-100 text-gray-800',
          success: 'bg-green-100 text-green-800',
          warning: 'bg-yellow-100 text-yellow-800',
          danger: 'bg-red-100 text-red-800',
          info: 'bg-blue-100 text-blue-800',
        };
        return (
          <span 
            className={`px-2 py-1 text-xs rounded-full ${badgeClasses[badgeVariant as keyof typeof badgeClasses]}`} 
            {...comp.props}
          >
            {content}
          </span>
        );

      case 'divider':
      case 'Divider':
        return <hr className="my-4 border-gray-200" {...comp.props} />;

      case 'grid':
      case 'Grid':
        const cols = comp.props?.cols || comp.props?.columns || 2;
        const gridCols: Record<number, string> = {
          1: 'grid-cols-1',
          2: 'grid-cols-2',
          3: 'grid-cols-3',
          4: 'grid-cols-4',
        };
        return (
          <div className={`grid ${gridCols[cols] || 'grid-cols-2'} gap-4 mb-4`} {...comp.props}>
            {comp.children?.map((child, idx) => (
              <React.Fragment key={idx}>{renderComponent(child)}</React.Fragment>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded mb-2">
            <p className="text-sm text-gray-600">未知组件类型: {componentType}</p>
            {content && <p className="mt-2 text-gray-800">{content}</p>}
          </div>
        );
    }
  };

  return <>{renderComponent(component)}</>;
};

export default A2UIRenderer;
