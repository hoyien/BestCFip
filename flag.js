/**
 * Sub-Store 节点处理脚本 (前缀隔离处理版)
 * 逻辑：提取前缀 -> 核心处理 -> 恢复前缀 -> 速度局部排序
 */

const CONFIG = {
  // 1. 前缀匹配正则：匹配常见的 “机场名 | ” 或 “机场名 - ” 等格式
  prefixReg: /^(.+?)\s*[\||\-\:_]\s*/,

  // 已去掉 USE 和 USED，并移除末尾的 i 标志，严格区分大小写
  excludeReg: /官网|以下|校园|灾|群|禁止|自定义|邀请|返利|循环|客服|网站|网址|获取|订阅|流量|总计|到期|机场|下次|重置|重新|设置|版本|官址|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|地址|频道|无法|说明|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|好友|网易|网易云|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author|Traffic/,

  flagMap: {
    '香港|HK|Hong Kong|九龙|荃湾|沙田': '🇭🇰',
    '日本|JP|Japan|东京|大阪|京都|埼玉|名古屋|福冈|札幌|Tokyo|Osaka': '🇯🇵',
    '美国|US|United States|USA|洛杉矶|圣何塞|旧金山|西雅图|芝加哥|纽约|达拉斯|波特兰|Los Angeles|San Francisco|Seattle|New York': '🇺🇸',
    '韩国|KR|Korea|首尔|仁川|釜山|Seoul': '🇰🇷',
    '新加坡|SG|Singapore|狮城': '🇸🇬',
    '英国|UK|United Kingdom|伦敦|曼彻斯特|London': '🇬🇧',
    '德国|DE|Germany|法兰克福|柏林|Frankfurt|Berlin': '🇩🇪',
    '法国|FR|France|巴黎|Paris': '🇫🇷',
    '俄罗斯|RU|Russia|莫斯科|圣彼得堡|Moscow': '🇷🇺',
    '加拿大|CA|Canada|多伦多|温哥华|蒙特利尔|Toronto|Vancouver': '🇨🇦',
    '澳大利亚|AU|Australia|悉尼|墨尔本|Sydney|Melbourne': '🇦🇺',
    '荷兰|NL|Netherlands|阿姆斯特丹|Amsterdam': '🇳🇱',
    '泰国|TH|Thailand|曼谷|Bankkok': '🇹🇭'
  },

  // 移除 i 标志，区分大小写
  provincesReg: /河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|内蒙古|广西|西藏|宁夏|新疆|北京|天津|上海|重庆/,
  citiesReg: /广州|深圳|杭州|成都|武汉|南京|西安|苏州|郑州|长沙|福州|厦门|合肥|徐州|沈阳|大连|长春|哈尔滨|济南|青岛|无锡|宁波|昆明|南宁|石家庄|太原|南昌|贵阳|兰州|西宁|呼和浩特|乌鲁木齐|拉萨/,
  chinaCommonReg: /China|国内|回国/,
  taiwanReg: /台湾|TW|Taiwan|Tai Wan|台北|台中|高雄|新北|桃園|台南|Taipei|Taichung|Kaohsiung/,
  flagEmojiReg: /([\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF])/,
  speedReg: /([\d.]+)\s*(MB\/s|KB\/s|GB\/s)/
};

function operator(proxies) {
  const args = (typeof $arguments !== 'undefined') ? $arguments : {};
  const currentMode = args.mode || "all"; 

  // --- 核心处理流水线 ---
  let processed = proxies
    .map(p => {
      // 1. 提取并剥离前缀
      let prefix = "";
      let coreName = p.name;
      const prefixMatch = p.name.match(CONFIG.prefixReg);
      
      if (prefixMatch) {
        prefix = prefixMatch[0]; 
        coreName = p.name.replace(prefix, "").trim();
      }
      
      return { ...p, _rawPrefix: prefix, _coreName: coreName };
    })
    .filter(p => {
      // 2. 基于核心名称进行过滤 (不受前缀干扰)
      if (CONFIG.excludeReg.test(p._coreName)) return false;

      const isChina = CONFIG.provincesReg.test(p._coreName) || 
                      CONFIG.citiesReg.test(p._coreName) || 
                      CONFIG.chinaCommonReg.test(p._coreName);

      if (currentMode === "china_only") return isChina;
      if (currentMode === "no_china") return !isChina;
      return true; 
    })
    .map(p => {
      let name = p._coreName;

      // A. 匹配国家/城市补全旗帜
      for (const [key, flag] of Object.entries(CONFIG.flagMap)) {
        // 此处 new RegExp 默认区分大小写
        if (new RegExp(key).test(name) && !CONFIG.flagEmojiReg.test(name)) {
          name = flag + ' ' + name;
          break; 
        }
      }

      // B. 识别并补齐中国国旗
      if (!CONFIG.flagEmojiReg.test(name)) {
        const isChina = CONFIG.provincesReg.test(name) || 
                        CONFIG.citiesReg.test(name) || 
                        CONFIG.chinaCommonReg.test(name);
        if (isChina) name = '🇨🇳 ' + name;
      }

      // C. 统一旗帜位置
      const match = name.match(CONFIG.flagEmojiReg);
      if (match) {
        const flag = match[1];
        name = flag + ' ' + name.replace(flag, '').trim();
      }

      // D. 台湾特殊处理
      if (CONFIG.taiwanReg.test(name)) {
        const cleanName = name.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, '').trim();
        name = '🇼🇸 ' + cleanName;
      }

      // 3. 将处理后的核心名与原前缀重新组合
      p.name = p._rawPrefix + name.replace(/\s+/g, ' '); 
      return p;
    });

  // --- 第二阶段：局部排序 ---
  const speedNodesInfo = [];
  processed.forEach((p, index) => {
    const match = p.name.match(CONFIG.speedReg);
    if (match) {
      let val = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      let sortVal = val;
      if (unit === 'KB/S') sortVal = val / 1024;
      if (unit === 'GB/S') sortVal = val * 1024;
      speedNodesInfo.push({ index, sortVal, proxy: p });
    }
  });

  if (speedNodesInfo.length > 0) {
    const sorted = [...speedNodesInfo].sort((a, b) => b.sortVal - a.sortVal);
    speedNodesInfo.forEach((originalPos, i) => {
      processed[originalPos.index] = sorted[i].proxy;
    });
  }

  // 清理临时属性并返回
  return processed.map(p => {
    delete p._rawPrefix;
    delete p._coreName;
    return p;
  });
}
