/**
 * Substore 前缀添加脚本
 * 逻辑：验证参数 -> 检查重复 -> 格式化输出
 */

async function operator(proxies, targetPlatform, { prefix }) {
  // 1. 参数合理化验证：不能为空、不能全是空格
  if (!prefix || prefix.trim().length === 0) {
    console.log("前缀参数无效，跳过操作");
    return proxies;
  }

  const trimmedPrefix = prefix.trim();
  const separator = " | "; // 定义分隔符

  return proxies.map(p => {
    // 2. 避免重复添加
    // 检查节点名是否已经以 "prefix |" 开头
    const fullPrefix = `${trimmedPrefix}`;
    
    if (p.name.startsWith(fullPrefix) || p.name.startsWith(trimmedPrefix)) {
      return p;
    }

    // 3. 输出格式化: 前缀 | 节点名
    p.name = `${fullPrefix}${p.name}`;
    return p;
  });
}
