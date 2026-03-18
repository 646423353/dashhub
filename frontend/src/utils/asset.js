export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;

  // 开发环境变量或默认后端的完整地址
  const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  
  // 确保 path 开头有 /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 如果 serverBase 是一段完整的 URL, 解析出 origin 即可 (防止 VITE_API_BASE 配置为了 http://localhost:3001/api 使得拼接出 /api/uploads )
  if (serverBase.startsWith('http')) {
    try {
      const urlObj = new URL(serverBase);
      return `${urlObj.origin}${normalizedPath}`;
    } catch (e) {
      const base = serverBase.endsWith('/') ? serverBase.slice(0, -1) : serverBase;
      return `${base}${normalizedPath}`;
    }
  }

  // 生产环境下 VITE_API_BASE 通常配置为 "/api" 或者空,
  // 静态文件应该直接访问域名的根路径 /uploads/...
  return normalizedPath;
};
