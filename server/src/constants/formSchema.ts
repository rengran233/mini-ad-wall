export const AD_FORM_SCHEMA = [
    {
      name: 'title',
      label: '这些',
      component: 'Input',
      props: { placeholder: '例如：极简广告' },
      rules: [{ required: true, message: '请输入广告标题' }]
    },
    {
      name: 'publisher',
      label: '全都',
      component: 'Input',
      props: { placeholder: '例如：字节广告君' },
      rules: [{ required: true, message: '请输入发布者名称' }]
    },
    {
      name: 'content',
      label: '可以改',
      component: 'TextArea',
      props: { rows: 4, placeholder: '描述你的广告...' },
      rules: [{ required: true, message: '请输入广告内容' }]
    },
    {
      name: 'url',
      label: '落地页链接',
      component: 'Input',
      props: { placeholder: 'https://example.com' },
      rules: [
        { required: true, message: '请输入跳转链接' },
        { type: 'url', message: '请输入合法的 URL' }
      ]
    },
    {
      name: 'video',
      label: '广告视频',
      component: 'VideoUpload',
      rules: []
    },
    {
      name: 'pricing',
      label: '出价 (元)',
      component: 'InputNumber',
      props: { 
        min: 0, 
        step: 0.1, 
        placeholder: '0.00',
        style: { width: '100%' } 
      },
      rules: [{ required: true, message: '请输入出价' }]
    }
  ];