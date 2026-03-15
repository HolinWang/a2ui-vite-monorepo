/**
 * 组件能力注册表
 * 定义所有可用的组件及其能力
 */

import { ComponentDefinition } from './types';

/**
 * 组件注册表
 * AI 通过此注册表了解可用的组件
 */
export const componentRegistry: ComponentDefinition[] = [
  // ==================== 布局组件 ====================
  {
    name: 'Card',
    description: '卡片容器，用于包裹和分组内容，提供视觉分隔和层次感',
    category: 'layout',
    hasChildren: true,
    props: [
      {
        name: 'title',
        type: 'string',
        description: '卡片标题',
      },
      {
        name: 'subtitle',
        type: 'string',
        description: '卡片副标题',
      },
      {
        name: 'padding',
        type: 'enum',
        enumValues: ['none', 'sm', 'md', 'lg'],
        default: 'md',
        description: '内边距大小',
      },
      {
        name: 'shadow',
        type: 'enum',
        enumValues: ['none', 'sm', 'md', 'lg'],
        default: 'md',
        description: '阴影大小',
      },
    ],
    examples: [
      {
        component: 'Card',
        props: { title: '用户信息' },
        children: [
          { component: 'Text', props: { content: '姓名：张三' } },
        ],
      },
    ],
  },
  {
    name: 'Container',
    description: '容器组件，用于包裹内容并提供统一的宽度限制和居中对齐',
    category: 'layout',
    hasChildren: true,
    props: [
      {
        name: 'maxWidth',
        type: 'enum',
        enumValues: ['sm', 'md', 'lg', 'xl', 'full'],
        default: 'lg',
        description: '最大宽度',
      },
      {
        name: 'padding',
        type: 'boolean',
        default: true,
        description: '是否有内边距',
      },
    ],
  },
  {
    name: 'Grid',
    description: '网格布局，用于创建多列布局',
    category: 'layout',
    hasChildren: true,
    props: [
      {
        name: 'cols',
        type: 'number',
        required: true,
        default: 2,
        description: '列数（1-12）',
        validator: (v) => v >= 1 && v <= 12,
      },
      {
        name: 'gap',
        type: 'enum',
        enumValues: ['none', 'sm', 'md', 'lg'],
        default: 'md',
        description: '列间距',
      },
    ],
    examples: [
      {
        component: 'Grid',
        props: { cols: 2, gap: 'md' },
        children: [
          { component: 'Card', children: [] },
          { component: 'Card', children: [] },
        ],
      },
    ],
  },
  {
    name: 'Stack',
    description: '堆叠布局，垂直或水平排列子元素',
    category: 'layout',
    hasChildren: true,
    props: [
      {
        name: 'direction',
        type: 'enum',
        enumValues: ['horizontal', 'vertical'],
        default: 'vertical',
        description: '排列方向',
      },
      {
        name: 'gap',
        type: 'enum',
        enumValues: ['none', 'sm', 'md', 'lg'],
        default: 'md',
        description: '元素间距',
      },
      {
        name: 'align',
        type: 'enum',
        enumValues: ['start', 'center', 'end', 'stretch'],
        default: 'stretch',
        description: '对齐方式',
      },
    ],
  },
  {
    name: 'Divider',
    description: '分隔线，用于在内容之间创建视觉分隔',
    category: 'layout',
    hasChildren: false,
    props: [
      {
        name: 'orientation',
        type: 'enum',
        enumValues: ['horizontal', 'vertical'],
        default: 'horizontal',
        description: '分隔线方向',
      },
      {
        name: 'style',
        type: 'enum',
        enumValues: ['solid', 'dashed', 'dotted'],
        default: 'solid',
        description: '线条样式',
      },
    ],
  },

  // ==================== 表单组件 ====================
  {
    name: 'Input',
    description: '输入框，用于接收用户文本输入',
    category: 'form',
    hasChildren: false,
    props: [
      {
        name: 'label',
        type: 'string',
        description: '输入框标签',
      },
      {
        name: 'placeholder',
        type: 'string',
        description: '占位符文本',
      },
      {
        name: 'type',
        type: 'enum',
        enumValues: ['text', 'password', 'email', 'number', 'tel', 'url'],
        default: 'text',
        description: '输入类型',
      },
      {
        name: 'required',
        type: 'boolean',
        default: false,
        description: '是否必填',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: false,
        description: '是否禁用',
      },
    ],
    examples: [
      {
        component: 'Input',
        props: { label: '姓名', placeholder: '请输入姓名', required: true },
      },
    ],
  },
  {
    name: 'Button',
    description: '按钮，用于触发操作或提交表单',
    category: 'form',
    hasChildren: false,
    props: [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: '按钮文本',
      },
      {
        name: 'variant',
        type: 'enum',
        enumValues: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
        default: 'primary',
        description: '按钮样式',
      },
      {
        name: 'size',
        type: 'enum',
        enumValues: ['sm', 'md', 'lg'],
        default: 'md',
        description: '按钮大小',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: false,
        description: '是否禁用',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: false,
        description: '是否加载中',
      },
    ],
    examples: [
      {
        component: 'Button',
        props: { text: '提交', variant: 'primary' },
      },
    ],
  },
  {
    name: 'Select',
    description: '下拉选择框，用于从多个选项中选择一个',
    category: 'form',
    hasChildren: false,
    props: [
      {
        name: 'label',
        type: 'string',
        description: '选择框标签',
      },
      {
        name: 'options',
        type: 'array',
        required: true,
        description: '选项列表，格式：[{label: "显示文本", value: "值"}]',
      },
      {
        name: 'placeholder',
        type: 'string',
        description: '占位符文本',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: false,
        description: '是否多选',
      },
    ],
  },
  {
    name: 'Checkbox',
    description: '复选框，用于选择一个或多个选项',
    category: 'form',
    hasChildren: false,
    props: [
      {
        name: 'label',
        type: 'string',
        required: true,
        description: '复选框标签',
      },
      {
        name: 'checked',
        type: 'boolean',
        default: false,
        description: '是否选中',
      },
    ],
  },
  {
    name: 'Radio',
    description: '单选框组，用于从多个选项中选择一个',
    category: 'form',
    hasChildren: false,
    props: [
      {
        name: 'label',
        type: 'string',
        description: '单选框组标签',
      },
      {
        name: 'options',
        type: 'array',
        required: true,
        description: '选项列表',
      },
      {
        name: 'value',
        type: 'string',
        description: '当前选中的值',
      },
    ],
  },
  {
    name: 'Form',
    description: '表单容器，用于收集和验证用户输入',
    category: 'form',
    hasChildren: true,
    props: [
      {
        name: 'layout',
        type: 'enum',
        enumValues: ['vertical', 'horizontal'],
        default: 'vertical',
        description: '表单布局',
      },
      {
        name: 'labelWidth',
        type: 'string',
        default: '100px',
        description: '标签宽度（horizontal 布局时有效）',
      },
    ],
    examples: [
      {
        component: 'Form',
        props: { layout: 'vertical' },
        children: [
          { component: 'Input', props: { label: '用户名' } },
          { component: 'Input', props: { label: '密码', type: 'password' } },
          { component: 'Button', props: { text: '登录' } },
        ],
      },
    ],
  },

  // ==================== 展示组件 ====================
  {
    name: 'Text',
    description: '文本组件，用于显示文字内容',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'content',
        type: 'string',
        required: true,
        description: '文本内容',
      },
      {
        name: 'variant',
        type: 'enum',
        enumValues: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'caption'],
        default: 'body',
        description: '文本样式',
      },
      {
        name: 'color',
        type: 'enum',
        enumValues: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
        default: 'default',
        description: '文本颜色',
      },
      {
        name: 'align',
        type: 'enum',
        enumValues: ['left', 'center', 'right'],
        default: 'left',
        description: '文本对齐',
      },
    ],
    examples: [
      { component: 'Text', props: { content: '标题', variant: 'h1' } },
    ],
  },
  {
    name: 'Table',
    description: '表格组件，用于展示结构化数据',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'columns',
        type: 'array',
        required: true,
        description: '列定义，格式：[{key: "字段名", title: "显示名", width: "宽度"}]',
      },
      {
        name: 'dataSource',
        type: 'array',
        required: true,
        description: '数据源，数组对象',
      },
      {
        name: 'bordered',
        type: 'boolean',
        default: false,
        description: '是否有边框',
      },
      {
        name: 'striped',
        type: 'boolean',
        default: false,
        description: '是否斑马纹',
      },
    ],
    examples: [
      {
        component: 'Table',
        props: {
          columns: [
            { key: 'name', title: '姓名' },
            { key: 'age', title: '年龄' },
          ],
          dataSource: [
            { name: '张三', age: 25 },
            { name: '李四', age: 30 },
          ],
        },
      },
    ],
  },
  {
    name: 'List',
    description: '列表组件，用于展示一组数据项',
    category: 'display',
    hasChildren: true,
    props: [
      {
        name: 'dataSource',
        type: 'array',
        description: '数据源',
      },
      {
        name: 'renderItem',
        type: 'string',
        description: '自定义渲染模板（使用 {field} 插值）',
      },
      {
        name: 'bordered',
        type: 'boolean',
        default: false,
        description: '是否有边框',
      },
    ],
  },
  {
    name: 'Badge',
    description: '徽章，用于标记状态或属性',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'content',
        type: 'string',
        required: true,
        description: '徽章内容',
      },
      {
        name: 'variant',
        type: 'enum',
        enumValues: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
        default: 'default',
        description: '徽章样式',
      },
      {
        name: 'size',
        type: 'enum',
        enumValues: ['sm', 'md', 'lg'],
        default: 'md',
        description: '徽章大小',
      },
    ],
    examples: [
      { component: 'Badge', props: { content: '已完成', variant: 'success' } },
    ],
  },
  {
    name: 'Image',
    description: '图片组件，用于展示图片',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'src',
        type: 'string',
        required: true,
        description: '图片地址',
      },
      {
        name: 'alt',
        type: 'string',
        description: '图片描述',
      },
      {
        name: 'width',
        type: 'string',
        description: '宽度（如：100px, 50%）',
      },
      {
        name: 'height',
        type: 'string',
        description: '高度',
      },
      {
        name: 'fit',
        type: 'enum',
        enumValues: ['cover', 'contain', 'fill', 'none'],
        default: 'cover',
        description: '填充方式',
      },
    ],
  },
  {
    name: 'Statistic',
    description: '统计数值，用于展示数值和趋势',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'label',
        type: 'string',
        required: true,
        description: '统计项标签',
      },
      {
        name: 'value',
        type: 'number',
        required: true,
        description: '统计值',
      },
      {
        name: 'prefix',
        type: 'string',
        description: '前缀（如货币符号）',
      },
      {
        name: 'suffix',
        type: 'string',
        description: '后缀（如单位）',
      },
      {
        name: 'trend',
        type: 'enum',
        enumValues: ['up', 'down', 'flat'],
        description: '趋势方向',
      },
      {
        name: 'trendValue',
        type: 'string',
        description: '趋势值（如 +12.5%）',
      },
    ],
    examples: [
      {
        component: 'Statistic',
        props: {
          label: '总收入',
          value: 150000,
          prefix: '¥',
          trend: 'up',
          trendValue: '+12.5%',
        },
      },
    ],
  },
  {
    name: 'Descriptions',
    description: '描述列表，用于展示键值对信息',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'items',
        type: 'array',
        required: true,
        description: '描述项列表，格式：[{label: "标签", value: "值", span: 1}]',
      },
      {
        name: 'column',
        type: 'number',
        default: 2,
        description: '每行显示的列数',
      },
      {
        name: 'bordered',
        type: 'boolean',
        default: false,
        description: '是否有边框',
      },
    ],
    examples: [
      {
        component: 'Descriptions',
        props: {
          items: [
            { label: '姓名', value: '张三' },
            { label: '年龄', value: '25' },
          ],
          column: 2,
        },
      },
    ],
  },
  {
    name: 'Timeline',
    description: '时间线，用于展示事件流程或历史记录',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'items',
        type: 'array',
        required: true,
        description: '时间线项目，格式：[{time: "时间", title: "标题", description: "描述", status: "success|processing|error|default"}]',
      },
    ],
    examples: [
      {
        component: 'Timeline',
        props: {
          items: [
            { time: '2024-01-01 10:00', title: '交易发起', status: 'success' },
            { time: '2024-01-01 10:05', title: '风控审核', status: 'processing' },
          ],
        },
      },
    ],
  },
  {
    name: 'Tag',
    description: '标签，用于标记分类或状态',
    category: 'display',
    hasChildren: false,
    props: [
      {
        name: 'color',
        type: 'enum',
        enumValues: ['default', 'blue', 'green', 'orange', 'red'],
        default: 'default',
        description: '标签颜色',
      },
      {
        name: 'text',
        type: 'string',
        required: true,
        description: '标签文本',
      },
    ],
    examples: [
      { component: 'Tag', props: { text: '已完成', color: 'green' } },
      { component: 'Tag', props: { text: '待处理', color: 'orange' } },
    ],
  },

  // ==================== 反馈组件 ====================
  {
    name: 'Alert',
    description: '警告提示，用于展示重要信息',
    category: 'feedback',
    hasChildren: false,
    props: [
      {
        name: 'content',
        type: 'string',
        required: true,
        description: '提示内容',
      },
      {
        name: 'type',
        type: 'enum',
        enumValues: ['info', 'success', 'warning', 'error'],
        default: 'info',
        description: '提示类型',
      },
      {
        name: 'closable',
        type: 'boolean',
        default: false,
        description: '是否可关闭',
      },
      {
        name: 'showIcon',
        type: 'boolean',
        default: true,
        description: '是否显示图标',
      },
    ],
    examples: [
      {
        component: 'Alert',
        props: { content: '操作成功', type: 'success' },
      },
    ],
  },
  {
    name: 'Progress',
    description: '进度条，用于展示进度',
    category: 'feedback',
    hasChildren: false,
    props: [
      {
        name: 'percent',
        type: 'number',
        required: true,
        description: '进度百分比（0-100）',
        validator: (v) => v >= 0 && v <= 100,
      },
      {
        name: 'status',
        type: 'enum',
        enumValues: ['normal', 'success', 'error'],
        default: 'normal',
        description: '进度状态',
      },
      {
        name: 'showLabel',
        type: 'boolean',
        default: true,
        description: '是否显示百分比',
      },
    ],
  },
  {
    name: 'Spinner',
    description: '加载动画，用于展示加载状态',
    category: 'feedback',
    hasChildren: false,
    props: [
      {
        name: 'size',
        type: 'enum',
        enumValues: ['sm', 'md', 'lg'],
        default: 'md',
        description: '加载动画大小',
      },
      {
        name: 'label',
        type: 'string',
        description: '加载提示文本',
      },
    ],
  },

  // ==================== 导航组件 ====================
  {
    name: 'Tabs',
    description: '标签页，用于切换不同内容面板',
    category: 'navigation',
    hasChildren: true,
    props: [
      {
        name: 'items',
        type: 'array',
        required: true,
        description: '标签页配置，格式：[{key: "key", label: "标签名"}]',
      },
      {
        name: 'activeKey',
        type: 'string',
        description: '当前激活的标签页',
      },
    ],
  },
  {
    name: 'Breadcrumb',
    description: '面包屑导航，用于展示当前位置',
    category: 'navigation',
    hasChildren: false,
    props: [
      {
        name: 'items',
        type: 'array',
        required: true,
        description: '面包屑项，格式：[{label: "名称", href: "链接"}]',
      },
    ],
  },
];

/**
 * 根据组件名称获取组件定义
 */
export function getComponentDefinition(name: string): ComponentDefinition | undefined {
  return componentRegistry.find((c) => c.name === name);
}

/**
 * 获取所有组件名称列表
 */
export function getComponentNames(): string[] {
  return componentRegistry.map((c) => c.name);
}

/**
 * 获取特定分类的组件
 */
export function getComponentsByCategory(
  category: ComponentDefinition['category']
): ComponentDefinition[] {
  return componentRegistry.filter((c) => c.category === category);
}

/**
 * 生成组件能力描述（供 AI 使用）
 */
export function generateComponentPrompt(): string {
  const categories = {
    layout: '布局组件',
    form: '表单组件',
    display: '展示组件',
    feedback: '反馈组件',
    navigation: '导航组件',
  };

  let prompt = '# 可用组件列表\n\n';

  Object.entries(categories).forEach(([key, label]) => {
    const components = getComponentsByCategory(key as ComponentDefinition['category']);
    if (components.length === 0) return;

    prompt += `## ${label}\n\n`;
    components.forEach((comp) => {
      prompt += `### ${comp.name}\n${comp.description}\n\n`;
      if (comp.props.length > 0) {
        prompt += '**属性：**\n';
        comp.props.forEach((prop) => {
          const required = prop.required ? '（必填）' : '';
          const enumInfo = prop.enumValues ? `，可选值：${prop.enumValues.join(', ')}` : '';
          prompt += `- \`${prop.name}\`: ${prop.description}${required}${enumInfo}\n`;
        });
        prompt += '\n';
      }
    });
  });

  return prompt;
}
