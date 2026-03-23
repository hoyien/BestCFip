/**
 * Sub-Store 节点添加前缀脚本
 * * @param {string} prefix - 传入的前缀参数
 */
function operator(proxies, targetPlatform, prefix) {
  // 1. 合理化验证：不能为空、不能全是空格
  if (!prefix || prefix.trim().length === 0) {
    console.log("前缀参数无效，跳过操作");
    return proxies;
  }

  const cleanPrefix = prefix.trim();
  const separator = " | ";

  return proxies.map(p => {
    // 3. 避免重复添加：检查是否已以 "prefix |" 开头
    // 4. 使用 " | " 分隔
    if (p.name && !p.name.startsWith(cleanPrefix + separator)) {
      p.name = `${cleanPrefix}${separator}${p.name}`;
    }
    return p;
  });
}
