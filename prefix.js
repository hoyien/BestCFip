/**
 * @param {Config} proxies
 * @param {Context} context
 * 逻辑：仅当 prefix 存在且非空（去空格后）才添加前缀
 */
function operator(proxies, context) {
  // 1. 获取参数并进行合理化处理（去首尾空格）
  const prefixName = context.arguments?.prefix?.trim();

  // 2. 验证：只有当 prefixName 存在且长度大于 0 时才执行
  if (prefixName && prefixName.length > 0) {
    const separator = " | ";
    
    return proxies.map(p => {
      // 3. 避免重复添加逻辑（可选，建议保留以防脚本运行多次）
      if (!p.name.startsWith(prefixName + separator)) {
        p.name = `${prefixName}${separator}${p.name}`;
      }
      return p;
    });
  }

  // 4. 默认逻辑：不满足条件则原样返回
  return proxies;
}
