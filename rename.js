/**
 * Sub-Store 全球增强版 (支持参数化前缀)
 * 参数说明: 在 Args 栏填入 PREFIX=你的前缀
 */

function operator(proxies, targetPlatform, { ARGUMENTS }) {
  // --- 1. 获取参数 (优先从 Sub-Store Args 读取) ---
  const CONFIG = {
    PREFIX: ARGUMENTS.PREFIX || "默认机场", // 如果没传参数，则显示“默认机场”
    REGIONS: [
      // 优先级：港澳台 -> 核心城市 -> 全球 A-Z -> 中国大陆
      { regex: /香港|HK|HongKong|Hark|HKG/i, flag: "🇭🇰" },
      { regex: /澳门|MO|Macao|Macau|MFM/i, flag: "🇲🇴" },
      { regex: /台湾|台北|新北|Taiwan|TW|ROC|TPE/i, flag: "🇼🇸" },
      { regex: /日本|东京|大坂|JP|Japan|Tokyo|Osaka|NRT|HND|KIX/i, flag: "🇯🇵" },
      { regex: /韩国|首尔|春川|KR|Korea|Seoul|ICN/i, flag: "🇰🇷" },
      { regex: /新加坡|狮城|SG|Singapore|SIN/i, flag: "🇸🇬" },
      { regex: /美国|洛杉矶|圣何塞|硅谷|密歇根|US|USA|America|LAX|SJC/i, flag: "🇺🇸" },
      { regex: /英国|伦敦|UK|GB|Britain|London|LHR/i, flag: "🇬🇧" },
      { regex: /阿联酋|迪拜|AE|UAE|Dubai|AbuDhabi|DXB/i, flag: "🇦🇪" },
      { regex: /德国|法兰克福|DE|Germany|Frankfurt|FRA/i, flag: "🇩🇪" },
      { regex: /法国|巴黎|FR|France|Paris/i, flag: "🇫🇷" },
      { regex: /俄罗斯|莫斯科|RU|Russia|Moscow/i, flag: "🇷🇺" },
      { regex: /加拿大|多伦多|温哥华|CA|Canada/i, flag: "🇨🇦" },
      { regex: /荷兰|阿姆斯特丹|NL|Netherlands/i, flag: "🇳🇱" },
      { regex: /澳大利亚|澳洲|AU|Australia|Sydney/i, flag: "🇦🇺" },
      { regex: /印度|孟买|孟拜|IN|India|Mumbai|BOM/i, flag: "🇮🇳" },
      { regex: /瑞士|苏黎世|CH|Switzerland|Zurich/i, flag: "🇨🇭" },
      // ... 扩充 A-Z (保持之前 160+ 逻辑)
      { regex: /阿富汗|AF|Afghanistan/i, flag: "🇦🇫" },
      { regex: /阿尔巴尼亚|AL|Albania/i, flag: "🇦🇱" },
      { regex: /阿尔及利亚|DZ|Algeria/i, flag: "🇩🇿" },
      { regex: /安哥拉|AO|Angola/i, flag: "🇦🇴" },
      { regex: /阿根廷|AR|Argentina/i, flag: "🇦🇷" },
      { regex: /奥地利|AT|Austria/i, flag: "🇦🇹" },
      { regex: /孟加拉|BD|Bangladesh/i, flag: "🇧🇩" },
      { regex: /比利时|BE|Belgium/i, flag: "🇧🇪" },
      { regex: /巴西|BR|Brazil/i, flag: "🇧🇷" },
      { regex: /柬埔寨|KH|Cambodia/i, flag: "🇰🇭" },
      { regex: /捷克|CZ|Czech/i, flag: "🇨🇿" },
      { regex: /丹麦|DK|Denmark/i, flag: "🇩🇰" },
      { regex: /埃及|EG|Egypt/i, flag: "🇪🇬" },
      { regex: /芬兰|FI|Finland/i, flag: "🇫🇮" },
      { regex: /希腊|GR|Greece/i, flag: "🇬🇷" },
      { regex: /匈牙利|HU|Hungary/i, flag: "🇭🇺" },
      { regex: /冰岛|IS|Iceland/i, flag: "🇮🇸" },
      { regex: /印尼|印度尼西亚|ID|Indonesia/i, flag: "🇮🇩" },
      { regex: /爱尔兰|IE|Ireland/i, flag: "🇮🇪" },
      { regex: /以色列|IL|Israel/i, flag: "🇮🇱" },
      { regex: /意大利|IT|Italy/i, flag: "🇮🇹" },
      { regex: /哈萨克斯坦|KZ|Kazakhstan/i, flag: "🇰🇿" },
      { regex: /老挝|LA|Laos/i, flag: "🇱🇦" },
      { regex: /卢森堡|LU|Luxembourg/i, flag: "🇱🇺" },
      { regex: /马来西亚|马来|MY|Malaysia/i, flag: "🇲🇾" },
      { regex: /墨西哥|MX|Mexico/i, flag: "🇲🇽" },
      { regex: /蒙古|MN|Mongolia/i, flag: "🇲🇳" },
      { regex: /缅甸|MM|Myanmar/i, flag: "🇲🇲" },
      { regex: /新西兰|NZ|New Zealand/i, flag: "🇳🇿" },
      { regex: /挪威|NO|Norway/i, flag: "🇳🇴" },
      { regex: /巴基斯坦|PK|Pakistan/i, flag: "🇵🇰" },
      { regex: /菲律宾|PH|Philippines/i, flag: "🇵🇭" },
      { regex: /波兰|PL|Poland/i, flag: "🇵🇱" },
      { regex: /葡萄牙|PT|Portugal/i, flag: "🇵🇹" },
      { regex: /卡塔尔|QA|Qatar/i, flag: "🇶🇦" },
      { regex: /罗马尼亚|RO|Romania/i, flag: "🇷🇴" },
      { regex: /沙特|SA|Saudi/i, flag: "🇸🇦" },
      { regex: /南非|ZA|South Africa/i, flag: "🇿🇦" },
      { regex: /西班牙|ES|Spain/i, flag: "🇪🇸" },
      { regex: /瑞典|SE|Sweden/i, flag: "🇸🇪" },
      { regex: /泰国|TH|Thailand/i, flag: "🇹🇭" },
      { regex: /土耳其|TR|Turkey|Istanbul/i, flag: "🇹🇷" },
      { regex: /乌克兰|UA|Ukraine/i, flag: "🇺🇦" },
      { regex: /委内瑞拉|VE|Venezuela/i, flag: "🇻🇪" },
      { regex: /越南|VN|Vietnam/i, flag: "🇻🇳" },
      // 兜底
      { regex: /中国|大陆|北京|上海|广州|深圳|苏州|南京|杭州|武汉|成都|CN|China/i, flag: "🇨🇳" }
    ],
    BLACKLIST: ["官网", "流量", "到期", "重置", "网易云", "Music", "🎵", "客服"]
  };

  // --- 2. 核心处理模块 ---

  // A. 过滤黑名单
  const blacklistReg = new RegExp(CONFIG.BLACKLIST.join('|'), 'i');
  
  // B. 旗帜匹配函数
  function getFlag(name) {
    for (const item of CONFIG.REGIONS) {
      if (item.regex.test(name)) return item.flag;
    }
    return "🌐";
  }

  // C. 名字清理函数
  function cleanName(name) {
    return name
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "") // 删旧旗帜
      .replace(/🏴‍☠️/g, "") // 删海盗旗
      .replace(/^[\s\-\|｜\[\]\(\)\._]+/, "") // 删开头杂符号
      .trim();
  }

  // --- 3. 执行映射逻辑 ---
  return proxies
    .filter(p => !blacklistReg.test(p.name))
    .map(p => {
      const baseName = cleanName(p.name);
      const flag = getFlag(baseName);
      p.name = `${flag} ${CONFIG.PREFIX} | ${baseName}`;
      return p;
    });
}
