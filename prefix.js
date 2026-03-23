/**
 * @param {Config} proxies
 * @param {Context} context
 * 逻辑：仅当传入 prefix 参数且非空（去空格后）时，添加 "前缀 | "
 */
function operator(proxies, context) {
  // 1. 获取并清洗参数（去除首尾空格）
  const prefix = context.arguments?.prefix?.trim();

  // 2. 验证：只有当 prefix 存在且长度大于 0 时才执行逻辑
  if (prefix && prefix.length > 0) {
    const separator = " | ";
    
    return proxies.map(p => {
      // 3. 避免重复添加：检查节点名是否已经以 "前缀 | " 开头
      if (!p.name.startsWith(prefix + separator)) {
        p.name = `${prefix}${separator}${p.name}`;
      }
      return p;
    });
  }

  // 4. 如果没有参数或参数无效，直接返回原节点列表
  return proxies;
}
