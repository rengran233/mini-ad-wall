import { Upload, Button, Modal, Form, Input, InputNumber } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
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
  
  // 从 Hook 获取逻辑与状态
  const { form, handleOk, upload } = useAdModal(open, initialValues, onSubmit);

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

        {/* --- 视频上传区域 --- */}
        <Form.Item label="广告视频" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {/* 上传按钮 */}
            <Form.Item
              name="video_file" // 这是一个虚字段，仅用于控制 Upload 组件显示
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              noStyle
            >
              <Upload
                maxCount={1}
                accept="video/*"
                showUploadList={false} // 我们自定义预览，不使用默认列表
                customRequest={upload.handleUpload} // 直接绑定 Hook 中的逻辑
              >
                <Button 
                  icon={upload.loading ? <LoadingOutlined /> : <UploadOutlined />}
                  disabled={upload.loading}
                >
                  {upload.loading ? '上传中...' : '上传视频'}
                </Button>
              </Upload>
            </Form.Item>

            {/* 真正存储数据的隐藏字段 */}
            <Form.Item name="video" noStyle hidden>
              <Input />
            </Form.Item>
          </div>
        </Form.Item>

        {/* 视频预览区域：纯 UI 展示，依赖表单数据变化 */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.video !== curr.video}>
          {({ getFieldValue }) => {
            const videoUrl = getFieldValue('video');
            return videoUrl ? (
              <div style={{ marginTop: 12, marginBottom: 24 }}>
                <video 
                  src={videoUrl} 
                  controls 
                  style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover', background: '#000' }} 
                />
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  当前视频: {videoUrl.split('/').pop()}
                </div>
              </div>
            ) : null;
          }}
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