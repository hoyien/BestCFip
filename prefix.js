/**
 * Sub-Store 脚本：动态添加机场前缀
 * 使用方式：在订阅链接后添加 #prefix=你的前缀
 * 示例：https://example.com/sub#prefix=🚀MyAir
 */

function operator(proxies) {
  // 获取参数并确保是字符串
  let prefix = typeof $arguments !== "undefined" ? $arguments : "";
  
  // 处理 Sub-Store 可能传入的对象格式参数
  if (typeof prefix === "object") {
    prefix = Object.values(prefix)[0] || "";
  }
  
  prefix = String(prefix).trim();

  // 如果没有前缀参数，直接返回原始节点
  if (!prefix) return proxies;

  return proxies.map((p) => {
    // 确保节点名称存在且为字符串
    let originalName = String(p.name || "");

    // 1. 重复性验证：检查原始名称是否已经以该前缀开头
    if (originalName && !originalName.startsWith(prefix)) {
      // 2. 拼接前缀与分隔符
      p.name = `${prefix} | ${originalName}`;
    }
    
    return p;
  });
}
