/**
 * Sub-Store 脚本：中文省份+城市全覆盖（剔除英文二字码映射）
 */

function operator(proxies) {
  const nameToCode = {
    // --- 港澳台 (独立旗帜) ---
    "香港": "HK", "HONGKONG": "HK", "C-HK": "HK", "HKBN": "HK",
    "台湾": "TW", "TAIWAN": "TW", "ROC": "TW", "台北": "TW",
    "澳门": "MO", "MACAU": "MO", "CTM": "MO",

    // --- 中国内地省级行政区 (全部映射为 CN) ---
    "中国": "CN", "内地": "大陆", "北京": "CN", "上海": "CN", "天津": "CN", "重庆": "CN",
    "广东": "CN", "江苏": "CN", "浙江": "CN", "山东": "CN", "河南": "CN", "河北": "CN", "湖北": "CN", "湖南": "CN",
    "福建": "CN", "四川": "CN", "安徽": "CN", "江西": "CN", "陕西": "CN", "山西": "CN", "云南": "CN", "贵州": "CN",
    "辽宁": "CN", "吉林": "CN", "黑龙江": "CN", "海南": "CN", "广西": "CN", "内蒙古": "CN", "内蒙": "CN", "宁夏": "CN", "新疆": "CN", "西藏": "CN", "甘肃": "CN", "青海": "CN",
    // 省份简称
    "粤": "CN", "苏": "CN", "浙": "CN", "沪": "CN", "京": "CN", "鲁": "CN", "豫": "CN", "鄂": "CN", "湘": "CN", "川": "CN", "冀": "CN",

    // --- 常用内地城市 (CN) ---
    "广州": "CN", "深圳": "CN", "杭州": "CN", "南京": "CN", "苏州": "CN", "武汉": "CN", "成都": "CN", "西安": "CN", "郑州": "CN", "合肥": "CN", "福州": "CN", "厦门": "CN", "济南": "CN", "青岛": "CN", "无锡": "CN", "常州": "CN", "徐州": "CN", "南通": "CN", "扬州": "CN", "盐城": "CN", "泰州": "CN", "宁波": "CN", "金华": "CN", "温州": "CN", "绍兴": "CN", "嘉兴": "CN", "泉州": "CN", "东莞": "CN", "佛山": "CN", "中山": "CN", "珠海": "CN", "汕头": "CN", "惠州": "CN", "揭阳": "CN", "沈阳": "CN", "大连": "CN", "长春": "CN", "哈尔滨": "CN", "石家庄": "CN", "太原": "CN", "昆明": "CN", "贵阳": "CN", "南宁": "CN", "兰州": "CN", "乌鲁木齐": "CN", "呼和浩特": "CN", "银川": "CN", "西宁": "CN", "拉萨": "CN",
    // 线路及运营商简称
    "广移": "CN",

    // --- 常用国际节点 ---
    "日本": "JP", "JAPAN": "JP", "东京": "JP", "大阪": "JP",
    "美国": "US", "USA": "US", "洛杉矶": "US", "旧金山": "US", "圣何塞": "US", "纽约": "US",
    "韩国": "KR", "KOREA": "KR", "首尔": "KR",
    "新加坡": "SG", "SINGAPORE": "SG", "狮城": "SG",
    "英国": "GB", "UK": "GB", "伦敦": "GB",
    "德国": "DE", "GERMANY": "DE", "法兰克福": "DE",
    "法国": "FR", "FRANCE": "FR", "巴黎": "FR",
    "俄罗斯": "RU", "RUSSIA": "RU", "伯力": "RU", "莫斯科": "RU",
    "加拿大": "CA", "CANADA": "CA", "温哥华": "CA", "多伦多": "CA",
    "澳大利亚": "AU", "AUSTRALIA": "AU", "悉尼": "AU", "墨尔本": "AU",
    "泰国": "TH", "THAILAND": "TH", "曼谷": "TH",
    "越南": "VN", "VIETNAM": "VN", "胡志明": "VN",
    "菲律宾": "PH", "PHILIPPINES": "PH", "马尼拉": "PH",
    "马来西亚": "MY", "MALAYSIA": "MY", "吉隆坡": "MY",
    "土耳其": "TR", "TURKEY": "TR", "伊斯坦布尔": "TR",
    "荷兰": "NL", "NETHERLANDS": "NL",
    "意大利": "IT", "ITALY": "IT"
  };

  const getFlag = (code) => {
    return String.fromCodePoint(...code.toUpperCase().split("").map(char => 127397 + char.charCodeAt(0)));
  };

  const emojiRegex = /[\u{1F1E6}-\u{1F1FF}]{2}/u;

  return proxies.map(p => {
    if (emojiRegex.test(p.name)) return p;
    let code = "";
    const upperName = p.name.toUpperCase();

    // 1. 遍历映射表匹配 (中文地名优先)
    for (const [key, c] of Object.entries(nameToCode)) {
      if (upperName.includes(key.toUpperCase())) {
        code = c;
        break; 
      }
    }

    // 2. 自动兜底匹配 ISO 二字代码 (针对国际节点如 AR, BR, CL...)
    if (!code) {
      const match = p.name.match(/(?:\s|^|[-_])([A-Z]{2})(?:\s|$|[-_]|\d)/);
      if (match) code = match[1];
    }

    if (code) {
      try {
        p.name = `${getFlag(code)} ${p.name}`;
      } catch (e) {}
    }
    return p;
  });
}
