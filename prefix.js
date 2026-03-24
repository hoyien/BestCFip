/**
 * 脚本：添加机场前缀（防 [object Object] 报错版）
 * 逻辑：显式读取属性并进行字符串拼接
 */

function operator(proxies) {
  // 获取参数并确保是字符串
  let arg = typeof $arguments !== "undefined" ? $arguments : "";
  if (typeof arg === "object") arg = Object.values(arg)[0] || "";
  const prefix = String(arg).trim();

  // 如果没有前缀参数，直接返回
  if (!prefix) return proxies;

  return proxies.map((p) => {
    // 关键点：先取出来存为局部变量，确保它是字符串
    let originalName = String(p.name || "");

    // 1. 重复性验证：检查原始名称是否已经以参数开头
    if (originalName && !originalName.startsWith(prefix)) {
      // 2. 验证之后再拼接分隔符
      p.name = prefix + " | " + originalName;
    }
    
    return p;
  });
}
