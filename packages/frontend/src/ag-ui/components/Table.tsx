/**
 * AG-UI Table 组件
 */

import React from 'react';
import type { AGUITableProps } from '../types';

export const Table: React.FC<AGUITableProps> = ({
  headers = [],
  rows = [],
  striped = true,
  bordered = true,
  hoverable = true,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`
          w-full
          ${bordered ? 'border border-gray-200' : ''}
        `}
      >
        {headers.length > 0 && (
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`
                    px-4 py-3 text-left text-sm font-semibold text-gray-700
                    ${bordered ? 'border-b border-gray-200' : ''}
                  `}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`
                ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                ${hoverable ? 'hover:bg-gray-100' : ''}
                transition-colors duration-150
              `}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`
                    px-4 py-3 text-sm text-gray-700
                    ${bordered ? 'border-b border-gray-200' : ''}
                  `}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无数据
        </div>
      )}
    </div>
  );
};

export default Table;
