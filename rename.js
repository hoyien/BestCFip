/**
 * Sub-Store 节点处理脚本 (全量国家模块化版)
 */

// --- 1. 配置参数中心 ---
const CONFIG = {
  PREFIX: "我的机场",
  // 匹配规则：按顺序执行，港澳台最前，中国大陆最后
  REGIONS: [
    { regex: /香港|HK|HongKong|Hark|HKG/i, flag: "🇭🇰" },
    { regex: /澳门|MO|Macao|Macau|MFM/i, flag: "🇲🇴" },
    { regex: /台湾|台北|新北|Taiwan|TW|ROC|TPE/i, flag: "🇼🇸" },
    { regex: /日本|东京|大坂|JP|Japan|Tokyo|Osaka|NRT|HND|KIX/i, flag: "🇯🇵" },
    { regex: /韩国|首尔|春川|KR|Korea|Seoul|ICN/i, flag: "🇰🇷" },
    { regex: /新加坡|狮城|SG|Singapore|SIN/i, flag: "🇸🇬" },
    { regex: /美国|洛杉矶|圣何塞|硅谷|密歇根|US|USA|America|LAX|SJC/i, flag: "🇺🇸" },
    { regex: /英国|伦敦|UK|GB|Britain|London|LHR/i, flag: "🇬🇧" },
    { regex: /法国|巴黎|FR|France|Paris/i, flag: "🇫🇷" },
    { regex: /德国|法兰克福|DE|Germany|Frankfurt|FRA/i, flag: "🇩🇪" },
    { regex: /澳大利亚|澳洲|AU|Australia|Sydney/i, flag: "🇦🇺" },
    { regex: /迪拜|阿联酋|AE|UAE|Dubai|AbuDhabi|DXB/i, flag: "🇦🇪" },
    { regex: /印度|孟买|孟拜|IN|India|Mumbai|BOM/i, flag: "🇮🇳" },
    { regex: /瑞士|苏黎世|CH|Switzerland|Zurich/i, flag: "🇨🇭" },
    { regex: /俄罗斯|莫斯科|RU|Russia|Moscow/i, flag: "🇷🇺" },
    { regex: /加拿大|多伦多|温哥华|CA|Canada/i, flag: "🇨🇦" },
    { regex: /荷兰|阿姆斯特丹|NL|Netherlands/i, flag: "🇳🇱" },
    { regex: /波兰|PL|Poland/i, flag: "🇵🇱" },
    { regex: /留尼旺|留尼汪|RE|Reunion/i, flag: "🇷🇪" },
    // --- 扩充国家 A-Z ---
    { regex: /阿富汗|AF|Afghanistan/i, flag: "🇦🇫" },
    { regex: /阿尔巴尼亚|AL|Albania/i, flag: "🇦🇱" },
    { regex: /阿尔及利亚|DZ|Algeria/i, flag: "🇩🇿" },
    { regex: /安道尔|AD|Andorra/i, flag: "🇦🇩" },
    { regex: /安哥拉|AO|Angola/i, flag: "🇦🇴" },
    { regex: /阿根廷|AR|Argentina/i, flag: "🇦🇷" },
    { regex: /亚美尼亚|AM|Armenia/i, flag: "🇦🇲" },
    { regex: /奥地利|AT|Austria/i, flag: "🇦🇹" },
    { regex: /阿塞拜疆|AZ|Azerbaijan/i, flag: "🇦🇿" },
    { regex: /巴林|BH|Bahrain/i, flag: "🇧🇭" },
    { regex: /孟加拉|BD|Bangladesh/i, flag: "🇧🇩" },
    { regex: /白俄罗斯|BY|Belarus/i, flag: "🇧🇾" },
    { regex: /比利时|BE|Belgium/i, flag: "🇧🇪" },
    { regex: /伯利兹|BZ|Belize/i, flag: "🇧🇿" },
    { regex: /贝宁|BJ|Benin/i, flag: "🇧🇯" },
    { regex: /不丹|BT|Bhutan/i, flag: "🇧🇹" },
    { regex: /玻利维亚|BO|Bolivia/i, flag: "🇧🇴" },
    { regex: /波黑|波斯尼亚和黑塞哥维那|BA|Bosnia/i, flag: "🇧🇦" },
    { regex: /博茨瓦纳|BW|Botswana/i, flag: "🇧🇼" },
    { regex: /巴西|BR|Brazil/i, flag: "🇧🇷" },
    { regex: /维京群岛|VG|Virgin Islands/i, flag: "🇻🇬" },
    { regex: /文莱|BN|Brunei/i, flag: "🇧🇳" },
    { regex: /保加利亚|BG|Bulgaria/i, flag: "🇧🇬" },
    { regex: /布基纳法索|BF|Burkina/i, flag: "🇧🇫" },
    { regex: /布隆迪|BI|Burundi/i, flag: "🇧🇮" },
    { regex: /柬埔寨|KH|Cambodia/i, flag: "🇰🇭" },
    { regex: /喀麦隆|CM|Cameroon/i, flag: "🇨🇲" },
    { regex: /佛得角|CV|Cape Verde/i, flag: "🇨🇻" },
    { regex: /开曼|KY|Cayman/i, flag: "🇰🇾" },
    { regex: /中非|CF|Central African/i, flag: "🇨🇫" },
    { regex: /乍得|TD|Chad/i, flag: "🇹🇩" },
    { regex: /智利|CL|Chile/i, flag: "🇨🇱" },
    { regex: /哥伦比亚|CO|Colombia/i, flag: "🇨🇴" },
    { regex: /科摩罗|KM|Comoros/i, flag: "🇰🇲" },
    { regex: /刚果|CG|CD|Congo/i, flag: "🇨🇬" },
    { regex: /哥斯达黎加|CR|Costa Rica/i, flag: "🇨🇷" },
    { regex: /克罗地亚|HR|Croatia/i, flag: "🇭🇷" },
    { regex: /塞浦路斯|CY|Cyprus/i, flag: "🇨🇾" },
    { regex: /捷克|CZ|Czech/i, flag: "🇨🇿" },
    { regex: /丹麦|DK|Denmark/i, flag: "🇩🇰" },
    { regex: /吉布提|DJ|Djibouti/i, flag: "🇩🇯" },
    { regex: /多米尼加|DO|Dominican/i, flag: "🇩🇴" },
    { regex: /厄瓜多尔|EC|Ecuador/i, flag: "🇪🇨" },
    { regex: /埃及|EG|Egypt/i, flag: "🇪🇬" },
    { regex: /萨尔瓦多|SV|El Salvador/i, flag: "🇸🇻" },
    { regex: /赤道几内亚|GQ|Equatorial Guinea/i, flag: "🇬🇶" },
    { regex: /厄立特里亚|ER|Eritrea/i, flag: "🇪🇷" },
    { regex: /爱沙尼亚|EE|Estonia/i, flag: "🇪🇪" },
    { regex: /埃塞俄比亚|ET|Ethiopia/i, flag: "🇪🇹" },
    { regex: /斐济|FJ|Fiji/i, flag: "🇫🇯" },
    { regex: /芬兰|FI|Finland/i, flag: "🇫🇮" },
    { regex: /加蓬|GA|Gabon/i, flag: "🇬🇦" },
    { regex: /冈比亚|GM|Gambia/i, flag: "🇬🇲" },
    { regex: /格鲁吉亚|GE|Georgia/i, flag: "🇬🇪" },
    { regex: /加纳|GH|Ghana/i, flag: "🇬🇭" },
    { regex: /希腊|GR|Greece/i, flag: "🇬🇷" },
    { regex: /格陵兰|GL|Greenland/i, flag: "🇬🇱" },
    { regex: /危地马拉|GT|Guatemala/i, flag: "🇬🇹" },
    { regex: /几内亚|GN|Guinea/i, flag: "🇬🇳" },
    { regex: /圭亚那|GY|Guyana/i, flag: "🇬🇾" },
    { regex: /海地|HT|Haiti/i, flag: "🇭🇹" },
    { regex: /洪都拉斯|HN|Honduras/i, flag: "🇭🇳" },
    { regex: /匈牙利|HU|Hungary/i, flag: "🇭🇺" },
    { regex: /冰岛|IS|Iceland/i, flag: "🇮🇸" },
    { regex: /印尼|印度尼西亚|ID|Indonesia/i, flag: "🇮🇩" },
    { regex: /伊朗|IR|Iran/i, flag: "🇮🇷" },
    { regex: /伊拉克|IQ|Iraq/i, flag: "🇮🇶" },
    { regex: /爱尔兰|IE|Ireland/i, flag: "🇮🇪" },
    { regex: /马恩岛|IM|Isle of Man/i, flag: "🇮🇲" },
    { regex: /以色列|IL|Israel/i, flag: "🇮🇱" },
    { regex: /意大利|IT|Italy/i, flag: "🇮🇹" },
    { regex: /科特迪瓦|CI|Ivory Coast/i, flag: "🇨🇮" },
    { regex: /牙买加|JM|Jamaica/i, flag: "🇯🇲" },
    { regex: /约旦|JO|Jordan/i, flag: "🇯🇴" },
    { regex: /哈萨克斯坦|KZ|Kazakhstan/i, flag: "🇰🇿" },
    { regex: /肯尼亚|KE|Kenya/i, flag: "🇰🇪" },
    { regex: /科威特|KW|Kuwait/i, flag: "🇰🇼" },
    { regex: /吉尔吉斯斯坦|KG|Kyrgyzstan/i, flag: "🇰🇬" },
    { regex: /老挝|LA|Laos/i, flag: "🇱🇦" },
    { regex: /拉脱维亚|LV|Latvia/i, flag: "🇱🇻" },
    { regex: /黎巴嫩|LB|Lebanon/i, flag: "🇱🇧" },
    { regex: /莱索托|LS|Lesotho/i, flag: "🇱🇸" },
    { regex: /利比里亚|LR|Liberia/i, flag: "🇱🇷" },
    { regex: /利比亚|LY|Libya/i, flag: "🇱🇾" },
    { regex: /立陶宛|LT|Lithuania/i, flag: "🇱🇹" },
    { regex: /卢森堡|LU|Luxembourg/i, flag: "🇱🇺" },
    { regex: /马其顿|MK|Macedonia/i, flag: "🇲🇰" },
    { regex: /马达加斯加|MG|Madagascar/i, flag: "🇲🇬" },
    { regex: /马拉维|MW|Malawi/i, flag: "🇲🇼" },
    { regex: /马来西亚|马来|MY|Malaysia/i, flag: "🇲🇾" },
    { regex: /马尔代夫|MV|Maldives/i, flag: "🇲🇻" },
    { regex: /马里|ML|Mali/i, flag: "🇲🇱" },
    { regex: /马耳他|MT|Malta/i, flag: "🇲🇹" },
    { regex: /毛利塔尼亚|MR|Mauritania/i, flag: "🇲🇷" },
    { regex: /毛里求斯|MU|Mauritius/i, flag: "🇲🇺" },
    { regex: /墨西哥|MX|Mexico/i, flag: "🇲🇽" },
    { regex: /摩尔多瓦|MD|Moldova/i, flag: "🇲🇩" },
    { regex: /摩纳哥|MC|Monaco/i, flag: "🇲🇨" },
    { regex: /蒙古|MN|Mongolia/i, flag: "🇲🇳" },
    { regex: /黑山|ME|Montenegro/i, flag: "🇲🇪" },
    { regex: /摩洛哥|MA|Morocco/i, flag: "🇲🇦" },
    { regex: /莫桑比克|MZ|Mozambique/i, flag: "🇲🇿" },
    { regex: /缅甸|MM|Myanmar/i, flag: "🇲🇲" },
    { regex: /纳米比亚|NA|Namibia/i, flag: "🇳🇦" },
    { regex: /尼泊尔|NP|Nepal/i, flag: "🇳🇵" },
    { regex: /新西兰|NZ|New Zealand/i, flag: "🇳🇿" },
    { regex: /尼加拉瓜|NI|Nicaragua/i, flag: "🇳🇮" },
    { regex: /尼日尔|NE|Niger/i, flag: "🇳🇪" },
    { regex: /尼日利亚|NG|Nigeria/i, flag: "🇳🇬" },
    { regex: /朝鲜|KP|North Korea/i, flag: "🇰🇵" },
    { regex: /挪威|NO|Norway/i, flag: "🇳🇴" },
    { regex: /阿曼|OM|Oman/i, flag: "🇴🇲" },
    { regex: /巴基斯坦|PK|Pakistan/i, flag: "🇵🇰" },
    { regex: /巴拿马|PA|Panama/i, flag: "🇵🇦" },
    { regex: /巴拉圭|PY|Paraguay/i, flag: "🇵🇾" },
    { regex: /秘鲁|PE|Peru/i, flag: "🇵🇪" },
    { regex: /菲律宾|PH|Philippines/i, flag: "🇵🇭" },
    { regex: /葡萄牙|PT|Portugal/i, flag: "🇵🇹" },
    { regex: /波多黎各|PR|Puerto Rico/i, flag: "🇵🇷" },
    { regex: /卡塔尔|QA|Qatar/i, flag: "🇶🇦" },
    { regex: /罗马尼亚|RO|Romania/i, flag: "🇷🇴" },
    { regex: /卢旺达|RW|Rwanda/i, flag: "🇷🇼" },
    { regex: /圣马力诺|SM|San Marino/i, flag: "🇸🇲" },
    { regex: /沙特|SA|Saudi/i, flag: "🇸🇦" },
    { regex: /塞内加尔|SN|Senegal/i, flag: "🇸🇳" },
    { regex: /塞尔维亚|RS|Serbia/i, flag: "🇷🇸" },
    { regex: /塞拉利昂|SL|Sierra Leone/i, flag: "🇸🇱" },
    { regex: /斯洛伐克|SK|Slovakia/i, flag: "🇸🇰" },
    { regex: /斯洛文尼亚|SI|Slovenia/i, flag: "🇸🇮" },
    { regex: /索马里|SO|Somalia/i, flag: "🇸🇴" },
    { regex: /南非|ZA|South Africa/i, flag: "🇿🇦" },
    { regex: /西班牙|ES|Spain/i, flag: "🇪🇸" },
    { regex: /斯里兰卡|LK|Sri Lanka/i, flag: "🇱🇰" },
    { regex: /苏丹|SD|Sudan/i, flag: "🇸🇩" },
    { regex: /苏里南|SR|Suriname/i, flag: "🇸🇷" },
    { regex: /斯威士兰|SZ|Swaziland/i, flag: "🇸🇿" },
    { regex: /瑞典|SE|Sweden/i, flag: "🇸🇪" },
    { regex: /叙利亚|SY|Syria/i, flag: "🇸🇾" },
    { regex: /塔吉克斯坦|TJ|Tajikistan/i, flag: "🇹🇯" },
    { regex: /坦桑尼亚|TZ|Tanzania/i, flag: "🇹🇿" },
    { regex: /泰国|TH|Thailand/i, flag: "🇹🇭" },
    { regex: /多哥|TG|Togo/i, flag: "🇹🇬" },
    { regex: /汤加|TO|Tonga/i, flag: "🇹🇴" },
    { regex: /特立尼达|TT|Trinidad/i, flag: "🇹🇹" },
    { regex: /突尼斯|TN|Tunisia/i, flag: "🇹🇳" },
    { regex: /土耳其|TR|Turkey/i, flag: "🇹🇷" },
    { regex: /土库曼斯坦|TM|Turkmenistan/i, flag: "🇹🇲" },
    { regex: /美属维尔京群岛|VI|Virgin Islands/i, flag: "🇻🇮" },
    { regex: /乌干达|UG|Uganda/i, flag: "🇺🇬" },
    { regex: /乌克兰|UA|Ukraine/i, flag: "🇺🇦" },
    { regex: /乌拉圭|UY|Uruguay/i, flag: "🇺🇾" },
    { regex: /乌兹别克斯坦|UZ|Uzbekistan/i, flag: "🇺🇿" },
    { regex: /梵蒂冈|VA|Vatican/i, flag: "🇻🇦" },
    { regex: /委内瑞拉|VE|Venezuela/i, flag: "🇻🇪" },
    { regex: /越南|VN|Vietnam/i, flag: "🇻🇳" },
    { regex: /也门|YE|Yemen/i, flag: "🇾🇪" },
    { regex: /南斯拉夫|YU|Yugoslavia/i, flag: "🇽🇰" },
    { regex: /扎伊尔|ZR|Zaire/i, flag: "🇨🇩" },
    { regex: /赞比亚|ZM|Zambia/i, flag: "🇿🇲" },
    { regex: /津巴布韦|ZW|Zimbabwe/i, flag: "🇿🇼" },
    // --- 最后兜底 ---
    { regex: /中国|大陆|北京|上海|广州|深圳|苏州|南京|杭州|武汉|成都|CN|China/i, flag: "🇨🇳" }
  ],
  BLACKLIST: [
    "官网", "以下", "校园", "灾", "群", "禁止", "自定义", "邀请", "返利", "循环",
    "客服", "网站", "网址", "获取", "订阅", "流量", "总计", "到期", "机场", "下次",
    "重置", "重新", "设置", "版本", "官址", "过期", "已用", "联系", "邮箱", "工单",
    "贩卖", "通知", "倒卖", "防止", "地址", "频道", "无法", "说明", "提示", "特别",
    "访问", "支持", "教程", "关注", "更新", "作者", "加入", "超时", "收藏", "福利",
    "好友", "网易", "网易云", "网易云音乐", "音乐", "云音乐", "Netease", "Music",
    "𝐌𝐮𝐬𝐢𝐜", "Unbolck", "music", "🎵", "🎶", "🎧", "USE", "USED", "TOTAL", "EXPIRE",
    "EMAIL", "Panel", "Channel", "Author", "Traffic"
  ]
};

// --- 2. 功能函数模块 ---

/**
 * 模块 A: 过滤黑名单
 */
function filterProxies(proxies) {
  const blacklistReg = new RegExp(CONFIG.BLACKLIST.join('|'), 'i');
  return proxies.filter(p => !blacklistReg.test(p.name));
}

/**
 * 模块 B: 清理原名杂质
 */
function cleanName(name) {
  let res = name;
  // 移除 Emoji 国旗、海盗旗
  res = res.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, ""); 
  res = res.replace(/🏴‍☠️/g, "");
  // 移除开头/结尾的修饰符和空格
  res = res.replace(/^[\s\-\|｜\[\]\(\)\._]+/, "");
  return res.trim();
}

/**
 * 模块 C: 匹配旗帜
 */
function getFlag(name) {
  for (const item of CONFIG.REGIONS) {
    if (item.regex.test(name)) {
      return item.flag;
    }
  }
  return "🌐"; 
}

/**
 * 模块 D: 组合最终名称
 * 逻辑：[旗帜] [前缀] | [清理后的原名]
 */
function renameProxy(proxy) {
  const baseName = cleanName(proxy.name);
  const flag = getFlag(baseName);
  
  proxy.name = `${flag} ${CONFIG.PREFIX} | ${baseName}`;
  return proxy;
}

// --- 3. 主程序入口 (Operator) ---
function operator(proxies) {
  // 先过滤，再处理
  return filterProxies(proxies).map(renameProxy);
}
