// 辅助函数：解析数据库中的 video 字段
// 兼容旧数据(纯字符串)和新数据(JSON数组字符串)
const parseVideoField = (videoField: string | null): string[] => {
  if (!videoField) return [];
  try {
    const parsed = JSON.parse(videoField);
    return Array.isArray(parsed) ? parsed : [videoField];
  } catch (e) {
    // 如果解析失败，说明是旧格式的单 URL 字符串
    return [videoField];
  }
};

export default parseVideoField;