import { useEffect } from 'react';
import { useAdStore } from '@/store/useAdStore';
import { Button } from 'antd';

function App() {
  const { ads, addAd, incrementClick, deleteAd } = useAdStore();

  // 方便调试：打印当前状态
  useEffect(() => {
    console.log('Current Ads:', ads);
  }, [ads]);

  const handleTestAdd = () => {
    addAd({
      title: '测试广告 ' + Math.floor(Math.random() * 100),
      publisher: '调试员',
      content: '这是一条测试内容',
      url: 'https://example.com',
      pricing: 10, // 固定出价方便观察排序
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Store Logic Test</h1>
      <div style={{ marginBottom: 20 }}>
        <Button type="primary" onClick={handleTestAdd}>新增测试广告 (出价10)</Button>
      </div>
      
      <ul>
        {ads.map(ad => (
          <li key={ad.id} style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10 }}>
            <h3>{ad.title} (点击数: {ad.clicked})</h3>
            <p>出价: {ad.pricing} | <strong>分数: {ad.pricing + (ad.pricing * ad.clicked * 0.42)}</strong></p>
            <Button size="small" onClick={() => incrementClick(ad.id)}>点击 (+1热度)</Button>
            <Button size="small" danger onClick={() => deleteAd(ad.id)} style={{ marginLeft: 8 }}>删除</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;