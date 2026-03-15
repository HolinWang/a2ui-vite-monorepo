import React from 'react';

interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  // 支持常见的布局属性
  display?: 'block' | 'flex' | 'inline' | 'inline-flex' | 'grid';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  width?: string;
  height?: string;
}

export const Box: React.FC<BoxProps> = ({
  className = '',
  style = {},
  children,
  display,
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  padding,
  margin,
  width,
  height,
}) => {
  const gapClasses: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const marginClasses: Record<string, string> = {
    none: '',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
  };

  const flexJustifyClasses: Record<string, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const flexAlignClasses: Record<string, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const displayClasses: Record<string, string> = {
    block: 'block',
    flex: 'flex',
    inline: 'inline',
    'inline-flex': 'inline-flex',
    grid: 'grid',
  };

  const directionClasses: Record<string, string> = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  };

  const classes = [
    display ? displayClasses[display] : '',
    flexDirection ? directionClasses[flexDirection] : '',
    justifyContent ? flexJustifyClasses[justifyContent] : '',
    alignItems ? flexAlignClasses[alignItems] : '',
    gap ? gapClasses[gap] : '',
    padding ? paddingClasses[padding] : '',
    margin ? marginClasses[margin] : '',
    className,
  ].filter(Boolean).join(' ');

  const computedStyle: React.CSSProperties = {
    ...style,
    width,
    height,
  };

  return (
    <div className={classes} style={computedStyle}>
      {children}
    </div>
  );
};

/**
 * 简单的容器组件，用于处理未知的 HTML 元素
 */
export const Div: React.FC<{ children?: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style = {},
}) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
