/**
 * @param {Config} proxies
 * @param {Context} context
 * 示例 URL 参数: ...&script-arg=prefix=我的机场
 */
function operator(proxies, context) {
  // 检查是否存在参数且包含 prefix
  if (context.arguments && context.arguments.prefix) {
    const prefixName = context.arguments.prefix;
    const separator = " | "; // 定义分隔符
    
    return proxies.map(p => {
      // 避免重复添加：如果节点名已经以该前缀开头，则跳过
      if (!p.name.startsWith(prefixName + separator)) {
        p.name = prefixName + separator + p.name;
      }
      return p;
    });
  }

  // 默认不处理，直接返回原始节点
  return proxies;
}
