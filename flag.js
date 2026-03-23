/**
 * Sub-Store 节点处理脚本 (去简称全称匹配版)
 * 逻辑：常用国家/城市 -> 国内全省份全称 -> 国内中文城市 -> 统一移位 -> 台湾特殊化 -> 速度节点局部排序
 */

/**
 * Sub-Store 节点处理脚本 (增强版)
 * 逻辑：基础过滤 -> 模式筛选 -> 国旗补全 -> 旗帜移位 -> 台湾特殊化 -> 速度节点局部排序
 */

const CONFIG = {
  // --- 模式切换 ---
  // "all": 保留所有节点 | "china_only": 只保留国内节点 | "no_china": 过滤掉国内节点
  mode: "all", 

  // 1. 基础过滤关键词正则 (排除广告、说明等无用信息)
  excludeReg: /官网|以下|校园|灾|群|禁止|自定义|邀请|返利|循环|客服|网站|网址|获取|订阅|流量|总计|到期|机场|下次|重置|重新|设置|版本|官址|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|地址|频道|无法|说明|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|好友|网易|网易云|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author|Traffic/i,

  // 2. 常用国家及其城市映射 (用于自动匹配国旗)
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

  // 3.1 国内省份全称 (去简称版)
  provincesReg: /河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|内蒙古|广西|西藏|宁夏|新疆|北京|天津|上海|重庆/i,
  
  // 3.2 国内主要城市
  citiesReg: /广州|深圳|杭州|成都|武汉|南京|西安|苏州|郑州|长沙|福州|厦门|合肥|徐州|沈阳|大连|长春|哈尔滨|济南|青岛|无锡|宁波|昆明|南宁|石家庄|太原|南昌|贵阳|兰州|西宁|呼和浩特|乌鲁木齐|拉萨/i,
  
  // 3.3 通用中国标识
  chinaCommonReg: /中国|China|国内|回国/i,

  // 4. 台湾节点及城市识别
  taiwanReg: /台湾|TW|Taiwan|Tai Wan|台北|台中|高雄|新北|桃園|台南|Taipei|Taichung|Kaohsiung/i,

  // 5. 正则表达式：识别 Emoji 国旗
  flagEmojiReg: /([\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF])/,

  // 6. 正则表达式：提取速度 (如 10.5 MB/s)
  speedReg: /([\d.]+)\s*(MB\/s|KB\/s|GB\/s)/i
};

function operator(proxies) {
  // --- 第一阶段：节点过滤与基础名称处理 ---
  let processed = proxies
    .filter(p => {
      // 排除无效节点
      if (CONFIG.excludeReg.test(p.name)) return false;

      const isChina = CONFIG.provincesReg.test(p.name) || 
                      CONFIG.citiesReg.test(p.name) || 
                      CONFIG.chinaCommonReg.test(p.name);

      // 根据模式进行过滤
      if (CONFIG.mode === "china_only") return isChina;
      if (CONFIG.mode === "no_china") return !isChina;
      return true; 
    })
    .map(p => {
      let name = p.name;

      // A. 匹配国家/城市并补全旗帜 (仅在原名没旗帜时)
      for (const [key, flag] of Object.entries(CONFIG.flagMap)) {
        const reg = new RegExp(key, 'i');
        if (reg.test(name) && !CONFIG.flagEmojiReg.test(name)) {
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

      // C. 统一将旗帜移到名称最前方
      const match = name.match(CONFIG.flagEmojiReg);
      if (match) {
        const flag = match[1];
        name = flag + ' ' + name.replace(flag, '').trim();
      }

      // D. 台湾节点特殊处理 (替换为 🇼🇸)
      if (CONFIG.taiwanReg.test(name)) {
        const cleanName = name.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, '').trim();
        name = '🇼🇸 ' + cleanName;
      }

      p.name = name.replace(/\s+/g, ' '); // 格式化多余空格
      return p;
    });

  // --- 第二阶段：速度节点局部排序 ---
  // 1. 提取所有带速度标识的节点信息，记录它们当前的索引(Index)
  const speedNodesInfo = [];
  processed.forEach((p, index) => {
    const match = p.name.match(CONFIG.speedReg);
    if (match) {
      let val = parseFloat(match[1]); // 提取数字部分
      const unit = match[2].toUpperCase(); // 提取单位部分
      
      // 统一换算为 MB/s 基础值进行比较
      let sortVal = val;
      if (unit === 'KB/S') sortVal = val / 1024;
      if (unit === 'GB/S') sortVal = val * 1024;
      
      speedNodesInfo.push({ index, sortVal, proxy: p });
    }
  });

  // 2. 如果存在速度节点，则进行排序并回填
  if (speedNodesInfo.length > 0) {
    // 按计算后的 sortVal 从大到小排序
    const sorted = [...speedNodesInfo].sort((a, b) => b.sortVal - a.sortVal);
    
    // 关键逻辑：按照原有的索引位置，依次填入排序后的节点
    // 这样可以保证非速度节点不动，速度节点在自己的“坑”里重新排位
    speedNodesInfo.forEach((originalPos, i) => {
      processed[originalPos.index] = sorted[i].proxy;
    });
  }

  return processed;
}
