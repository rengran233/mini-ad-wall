import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { AdFormData } from '@/types';
import styles from './AdModal.module.scss';

interface AdModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: AdFormData) => void;
  initialValues?: AdFormData | null; // 如果有值，说明是编辑或复制模式
  title: string;
}

const AdModal = ({ open, onCancel, onSubmit, initialValues, title }: AdModalProps) => {
  const [form] = Form.useForm();

  // 当弹窗打开或 initialValues 变化时，重置表单
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  // promise改为更现代的async/await语法
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="提交"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        name="ad_form"
      >
        <Form.Item
          name="title"
          label="广告标题"
          rules={[{ required: true, message: '请输入广告标题' }]}
        >
          <Input placeholder="例如：极简广告" />
        </Form.Item>

        <Form.Item
          name="publisher"
          label="发布者"
          rules={[{ required: true, message: '请输入发布者名称' }]}
        >
          <Input placeholder="例如：字节广告君" />
        </Form.Item>

        <Form.Item
          name="content"
          label="广告文案"
          rules={[{ required: true, message: '请输入广告内容' }]}
        >
          <Input.TextArea rows={4} placeholder="描述你的广告..." />
        </Form.Item>

        <Form.Item
          name="url"
          label="落地页链接"
          rules={[
            { required: true, message: '请输入跳转链接' },
            { type: 'url', message: '请输入合法的 URL (http://...)' }
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          name="pricing"
          label="出价 (元)"
          rules={[{ required: true, message: '请输入出价' }]}
        >
          <InputNumber 
            className={styles.fullWidth} 
            min={0} 
            step={0.1} 
            placeholder="0.00" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdModal;