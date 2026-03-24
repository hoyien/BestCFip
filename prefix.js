/**
 * 脚本：灵活添加前缀与分隔符
 * 逻辑：
 * 1. 优先检查节点名是否已经包含参数（原始机场名）。
 * 2. 如果不包含，则添加 “参数 + | + 节点名”。
 * 3. 分隔符仅在确认需要添加前缀时才构造。
 */

function operator(proxies) {
  // 获取脚本参数（机场名）
  const arg = typeof $arguments !== "undefined" ? $arguments : "";

  // 如果参数为空，直接返回
  if (!arg) return proxies;

  return proxies.map((p) => {
    // 1. 重复性验证：检查节点名是否已经以“参数”开头
    // 这样即使原节点名是 "机场A-香港"，也不会再重复添加
    if (!p.name.startsWith(arg)) {
      // 2. 验证通过后，再构造带分隔符的标准格式
      p.name = `${arg} | ${p.name}`;
    }
    return p;
  });
}
