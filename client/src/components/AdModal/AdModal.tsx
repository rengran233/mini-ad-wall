import { Modal, Form, Input, InputNumber } from 'antd';
import type { AdFormData } from '@/types';
import { useAdModal } from './useAdModal';
import styles from './AdModal.module.scss';

interface AdModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: AdFormData) => void;
  initialValues?: AdFormData | null;
  title: string;
  confirmLoading?: boolean; // 新增属性
}

const AdModal = (props: AdModalProps) => {
  // 解构出 confirmLoading
  const { open, onCancel, onSubmit, initialValues, title, confirmLoading } = props;
  
  const { form, handleOk } = useAdModal(open, initialValues, onSubmit);

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="提交"
      cancelText="取消"
      confirmLoading={confirmLoading} // 绑定给 Antd Modal
    >
      {/* 表单内容 */}
      <Form form={form} layout="vertical" name="ad_form">
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