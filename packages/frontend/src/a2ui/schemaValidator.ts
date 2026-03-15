/**
 * UI Schema 验证器
 * 验证 AI 生成的 UI Schema 是否符合规范
 */

import { UISchema, ValidationResult, SchemaError } from './types';
import { getComponentDefinition } from './componentCatalog';

/**
 * 验证 UI Schema
 */
export function validateSchema(schema: UISchema): ValidationResult {
  const errors: SchemaError[] = [];
  
  validateNode(schema, '', errors);
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 验证单个节点
 */
function validateNode(
  node: UISchema,
  path: string,
  errors: SchemaError[]
): void {
  // 支持 type 和 component 两种字段名
  const componentName = node.component || (node as any).type;
  
  // 1. 验证 component 字段
  if (!componentName) {
    errors.push({
      path: path || 'root',
      message: 'Missing required field: component',
      type: 'missing_prop',
    });
    return;
  }

  // 2. 验证组件是否存在
  const componentDef = getComponentDefinition(componentName);
  if (!componentDef) {
    errors.push({
      path: `${path}.component`,
      message: `Unknown component: ${componentName}`,
      type: 'unknown_component',
    });
    return;
  }

  // 3. 验证必填属性
  componentDef.props.forEach((propDef) => {
    if (propDef.required) {
      const value = node.props?.[propDef.name];
      if (value === undefined || value === null || value === '') {
        errors.push({
          path: `${path}.props.${propDef.name}`,
          message: `Missing required prop: ${propDef.name}`,
          type: 'missing_prop',
        });
      }
    }
  });

  // 4. 验证属性类型
  if (node.props) {
    Object.entries(node.props).forEach(([propName, propValue]) => {
      const propDef = componentDef.props.find((p) => p.name === propName);
      
      if (!propDef) {
        // 未知属性，允许但不警告（可能是高级用法）
        return;
      }

      // 验证类型
      const typeValid = validatePropType(propValue, propDef);
      if (!typeValid) {
        errors.push({
          path: `${path}.props.${propName}`,
          message: `Invalid type for prop ${propName}. Expected ${propDef.type}`,
          type: 'invalid_type',
        });
      }

      // 验证枚举值
      if (propDef.type === 'enum' && propDef.enumValues) {
        if (!propDef.enumValues.includes(propValue)) {
          errors.push({
            path: `${path}.props.${propName}`,
            message: `Invalid enum value: ${propValue}. Allowed: ${propDef.enumValues.join(', ')}`,
            type: 'invalid_type',
          });
        }
      }

      // 验证自定义验证器
      if (propDef.validator && !propDef.validator(propValue)) {
        errors.push({
          path: `${path}.props.${propName}`,
          message: `Validation failed for prop: ${propName}`,
          type: 'invalid_type',
        });
      }
    });
  }

  // 5. 验证 children
  if (node.children) {
    if (!componentDef.hasChildren) {
      errors.push({
        path: `${path}.children`,
        message: `Component ${componentName} does not support children`,
        type: 'invalid_structure',
      });
    } else {
      node.children.forEach((child, index) => {
        validateNode(child, `${path}.children[${index}]`, errors);
      });
    }
  }

  // 6. 验证条件渲染
  if (node.condition) {
    if (!node.condition.field || !node.condition.operator || node.condition.value === undefined) {
      errors.push({
        path: `${path}.condition`,
        message: 'Invalid condition structure',
        type: 'invalid_structure',
      });
    }
  }

  // 7. 验证循环渲染
  if (node.repeat) {
    if (!node.repeat.dataSource) {
      errors.push({
        path: `${path}.repeat`,
        message: 'Missing dataSource in repeat',
        type: 'missing_prop',
      });
    }
  }
}

/**
 * 验证属性类型
 */
function validatePropType(value: any, propDef: any): boolean {
  if (value === undefined || value === null) {
    return true; // 允许空值（非必填属性）
  }

  switch (propDef.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'function':
      return typeof value === 'function' || typeof value === 'string'; // 函数可以是字符串引用
    case 'enum':
      return true; // 枚举值单独验证
    default:
      return true;
  }
}

/**
 * 修复 Schema（自动填充默认值）
 */
export function fixSchema(schema: UISchema): UISchema {
  const fixed = { ...schema };

  const componentDef = getComponentDefinition(fixed.component);
  if (!componentDef) return fixed;

  // 填充默认值
  if (!fixed.props) {
    fixed.props = {};
  }

  componentDef.props.forEach((propDef) => {
    if (fixed.props![propDef.name] === undefined && propDef.default !== undefined) {
      fixed.props![propDef.name] = propDef.default;
    }
  });

  // 递归修复 children
  if (fixed.children) {
    fixed.children = fixed.children.map(fixSchema);
  }

  return fixed;
}

/**
 * 深度验证并修复 Schema
 */
export function validateAndFixSchema(schema: UISchema): {
  valid: boolean;
  schema: UISchema;
  errors?: SchemaError[];
  fixed: boolean;
} {
  const validation = validateSchema(schema);
  
  if (validation.valid) {
    return { valid: true, schema, fixed: false };
  }

  // 尝试修复
  const fixedSchema = fixSchema(schema);
  const fixedValidation = validateSchema(fixedSchema);

  return {
    valid: fixedValidation.valid,
    schema: fixedSchema,
    errors: fixedValidation.errors,
    fixed: true,
  };
}
