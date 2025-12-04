import type { MouseEvent } from 'react';
import { Card, Tag, Button, Statistic, Tooltip, Typography } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  FireOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import type { Ad } from '@/types';
import { calculateScore } from '@/utils/ranking';
import styles from './index.module.scss';

const { Meta } = Card;
const { Paragraph } = Typography;

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
  onCopy: (ad: Ad) => void;
  onClick: (id: string, url: string) => void;
}

const AdCard = ({ ad, onEdit, onDelete, onCopy, onClick }: AdCardProps) => {
  // 计算当前分数用于展示 (可选，方便调试)
  const score = calculateScore(ad.pricing, ad.clicked);

  const handleCardClick = () => {
    onClick(ad.id, ad.url);
  };

  // 阻止冒泡，避免点击按钮时触发卡片点击
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      hoverable
      className={styles.card}
      onClick={handleCardClick}
      actions={[
        <Tooltip title="编辑" key="edit">
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { stopPropagation(e); onEdit(ad); }} />
        </Tooltip>,
        <Tooltip title="复制" key="copy">
          <Button type="text" icon={<CopyOutlined />} onClick={(e) => { stopPropagation(e); onCopy(ad); }} />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { stopPropagation(e); onDelete(ad.id); }} />
        </Tooltip>,
      ]}
    >
      <div className={styles.header}>
        <Tag color="blue">{ad.publisher}</Tag>
        <span className={styles.date}>{new Date(ad.createdAt).toLocaleDateString()}</span>
      </div>
      
      <Meta
        title={<div className={styles.title} title={ad.title}>{ad.title}</div>}
        description={
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {ad.content}
          </Paragraph>
        }
      />

      <div className={styles.stats}>
        <Statistic 
          title="出价" 
          value={ad.pricing} 
          prefix={<DollarOutlined />} 
          styles={{ content: { fontSize: 16 } }}
        />
        <Statistic 
          title="热度" 
          value={ad.clicked} 
          prefix={<FireOutlined />} 
          styles={{ content: { fontSize: 16, color: '#cf1322' } }}
        />
        <div className={styles.score}>
          <small>Score: {score.toFixed(2)}</small>
        </div>
      </div>
    </Card>
  );
};

export default AdCard;