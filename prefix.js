function operator(proxies, targetPlatform) {
  // 获取参数，增加容错处理
  const prefix = $arguments.prefix;

  // 1. 参数合理化验证
  if (typeof prefix !== 'string' || prefix.trim().length === 0) {
    console.log("前缀为空或未定义，跳过处理");
    return proxies;
  }

  const trimmedPrefix = prefix.trim();
  const separator = " | ";
  const fullPrefix = trimmedPrefix + separator;

  return proxies.map(p => {
    // 确保节点名称存在且不是以该前缀开头
    if (p.name && !p.name.startsWith(trimmedPrefix)) {
      // 3. 格式化输出: 前缀 | 节点名
      // 使用扩展运算符确保对象属性被正确更新
      return {
        ...p,
        name: fullPrefix + p.name
      };
    }
    return p;
  });
}
