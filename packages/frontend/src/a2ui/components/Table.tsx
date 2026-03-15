import React from 'react';
import { renderNode } from '../renderNode';

interface TableColumn {
  key?: string;
  dataIndex?: string;  // 支持 dataIndex 字段名（antd 风格）
  title: string;
  width?: string;
  render?: any;  // 支持自定义渲染
}

interface TableProps {
  columns: TableColumn[];
  dataSource?: Record<string, any>[];  // 支持 dataSource
  data?: Record<string, any>[];        // 支持 data 字段名
  bordered?: boolean;
  striped?: boolean;
}

export const Table: React.FC<TableProps> = ({
  columns,
  dataSource,
  data,
  bordered = false,
  striped = false,
}) => {
  // 支持 dataSource 和 data 两种字段名
  const tableData = dataSource || data || [];
  
  return (
    <div className={`overflow-x-auto ${bordered ? 'border border-gray-200 rounded-lg' : ''}`}>
      <table className={`min-w-full divide-y divide-gray-200`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-gray-50`}
            >
              {columns.map((col, colIndex) => {
                // 支持 key 和 dataIndex 两种字段名
                const dataKey = col.key || col.dataIndex || '';
                const cellValue = row[dataKey];
                
                // 渲染单元格内容
                let cellContent: React.ReactNode = cellValue;
                
                // 如果值是一个对象（可能是嵌套的 UI Schema）
                if (cellValue && typeof cellValue === 'object' && !Array.isArray(cellValue)) {
                  // 检查是否是 UI Schema（有 type 字段）
                  if (cellValue.type) {
                    cellContent = renderNode(cellValue);
                  }
                }
                
                return (
                  <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
