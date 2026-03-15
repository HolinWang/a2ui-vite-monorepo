import React from 'react';

interface FormProps {
  layout?: 'vertical' | 'horizontal';
  labelWidth?: string;
  children?: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({
  layout = 'vertical',
  labelWidth = '100px',
  children,
}) => {
  if (layout === 'horizontal') {
    return (
      <div className="space-y-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return (
              <div className="flex items-start gap-4">
                <div style={{ width: labelWidth }} className="pt-2">
                  {/* Label would be rendered here in horizontal layout */}
                </div>
                <div className="flex-1">{child}</div>
              </div>
            );
          }
          return child;
        })}
      </div>
    );
  }

  return <div className="space-y-4">{children}</div>;
};
