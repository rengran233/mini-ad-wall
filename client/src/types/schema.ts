import type { Rule } from 'antd/es/form';

export interface FormFieldConfig {
  name: string;
  label: string;
  component: 'Input' | 'TextArea' | 'InputNumber' | 'VideoUpload'; // 支持的组件类型
  props?: Record<string, any>; // 透传给 Antd 组件的属性
  rules?: Rule[]; // Antd 校验规则
}