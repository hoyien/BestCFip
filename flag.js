/**
 * Sub-Store 节点处理脚本 (去简称全称匹配版)
 * 逻辑：常用国家/城市 -> 国内全省份全称 -> 国内中文城市 -> 统一移位 -> 台湾特殊化
 */

const CONFIG = {
  // --- 模式切换 ---
  // "all": 保留所有节点
  // "china_only": 只保留国内节点
  // "no_china": 过滤掉国内节点
  mode: "all", 

  // 1. 基础过滤关键词正则 (无用信息)
  excludeReg: /官网|以下|校园|灾|群|禁止|自定义|邀请|返利|循环|客服|网站|网址|获取|订阅|流量|总计|到期|机场|下次|重置|重新|设置|版本|官址|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|地址|频道|无法|说明|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|好友|网易|网易云|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author|Traffic/i,

  // 2. 常用国家及其城市映射 (优先匹配)
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
    '泰国|TH|Thailand|曼谷|Bangkok': '🇹🇭'
  },

  // 3.1 国内省份/自治区/直辖市 (仅保留全称，已去掉简称)
  provincesReg: /河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|内蒙古|广西|西藏|宁夏|新疆|北京|天津|上海|重庆/i,
  
  // 3.2 国内城市 (纯中文匹配，含徐州)
  citiesReg: /广州|深圳|杭州|成都|武汉|南京|西安|苏州|郑州|长沙|福州|厦门|合肥|徐州|沈阳|大连|长春|哈尔滨|济南|青岛|无锡|宁波|昆明|南宁|石家庄|太原|南昌|贵阳|兰州|西宁|呼和浩特|乌鲁木齐|拉萨/i,
  
  // 3.3 通用国内标识 (不含 CN)
  chinaCommonReg: /中国|China|国内|回国/i,

  // 4. 台湾节点及城市识别
  taiwanReg: /台湾|TW|Taiwan|Tai Wan|台北|台中|高雄|新北|桃園|台南|Taipei|Taichung|Kaohsiung/i,

  // 5. Emoji 国旗识别正则
  flagEmojiReg: /([\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF])/
};

function operator(proxies) {
  return proxies
    .filter(p => {
      // 步骤 1: 基础排除过滤
      if (CONFIG.excludeReg.test(p.name)) return false;

      // 判断是否为国内节点
      const isChina = CONFIG.provincesReg.test(p.name) || 
                      CONFIG.citiesReg.test(p.name) || 
                      CONFIG.chinaCommonReg.test(p.name);

      // 步骤 2: 根据模式过滤 (all / china_only / no_china)
      if (CONFIG.mode === "china_only") {
        return isChina;
      } else if (CONFIG.mode === "no_china") {
        return !isChina;
      }
      
      return true; 
    })
    .map(p => {
      let name = p.name;

      // 步骤 A：优先匹配常用国家/城市
      for (const [key, flag] of Object.entries(CONFIG.flagMap)) {
        const reg = new RegExp(key, 'i');
        if (reg.test(name) && !CONFIG.flagEmojiReg.test(name)) {
          name = flag + ' ' + name;
          break; 
        }
      }

      // 步骤 B：识别并补全中国国旗 (如果前面未识别到旗帜)
      if (!CONFIG.flagEmojiReg.test(name)) {
        const isChina = CONFIG.provincesReg.test(name) || 
                        CONFIG.citiesReg.test(name) || 
                        CONFIG.chinaCommonReg.test(name);
        if (isChina) {
          name = '🇨🇳 ' + name;
        }
      }

      // 步骤 C：统一移动旗帜到最前面
      const match = name.match(CONFIG.flagEmojiReg);
      if (match) {
        const flag = match[1];
        // 移除原位旗帜并重新拼接到头部
        name = flag + ' ' + name.replace(flag, '').trim();
      }

      // 步骤 D：最后处理台湾节点 (统一强制替换图标 🇼🇸)
      if (CONFIG.taiwanReg.test(name)) {
        const cleanName = name.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, '').trim();
        name = '🇼🇸 ' + cleanName;
      }

      // 格式化空格
      p.name = name.replace(/\s+/g, ' ');
      return p;
    });
}
