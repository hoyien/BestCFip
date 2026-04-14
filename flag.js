/**
 * Sub-Store 节点处理脚本
 * 使用方式：在订阅链接后添加 #model=all
 * 可选: all (全部), china (仅国内), proxy (仅国外)
 * 示例：https://example.com/sub#model=all
 * * 功能：
 * 1. 自动剔除广告、流量、官网等无效节点
 * 2. 深度识别澳门各堂区及常用国家/地区
 * 3. 统一旗帜 Emoji 格式
 * 4. 针对带速率标识的节点进行局部降序排列
 * 5. 针对“优选”开头的节点统一替换为美国旗帜 🇺🇸
 */

async function operator(proxies) {
  // 可选: all (全部), china (仅国内), proxy (仅国外)
  // 优先获取链接后的参数 (例如 #model=china)，若无参数则默认为 "all"
  const model = (typeof $arguments !== "undefined" && $arguments.model) ? $arguments.model.toLowerCase() : "all";

  // 边界保护正则：防止误伤包含在单词中间的字符
  const b = {
    l: "(?<![.\\-\\|])",
    r: "(?![.\\-\\|])"
  };

  // --- 2. 黑名单正则 ---
  const blacklist = /备用|版本|报错|测试|尝试|超时|重置|重新|到期|倒卖|地址|订阅|当前|电报|订阅|翻墙|返利|贩卖|访问|防止|福利|更新|关注|官方|官网|官址|广告|过期|好友|会员|获取|机场|加入|建议|教程|禁止|距离|客服|联系|流量|免翻|群|软件|设置|失联|剩余|收藏|刷新|说明|套餐|提示|特别|通知|网址|网站|无法|无效|下次|校园|学术|邀请|已用|以下|有效|邮箱|佣金|账号|支持|自定义|总计|作者 |(?<!\.)\b(App|Author|Channel|Date|Days|Email|Expire|Panel|Premium|Soft|Test|Total|Traffic|Use)\b(?!\.)/i;

  // --- 3. 地区映射库 ---
  const countryMap = {
    "🇭🇰": new RegExp(`香港|九龙|铜锣湾|旺角|中环|沙田|荃湾|将军澳|离岛|葵涌|观塘|柴湾|${b.l}(HongKong|HK|Kowloon|Causeway\\s?Bay|Mong\\s?Kok|Central|Sha\\s?Tin|Tsuen\\s?Wan|Tseung\\s?Kwan\\s?O|Kwai\\s?Chung|Kwun\\s?Tong|Chai\\s?Wan)${b.r}`, "gi"),
    "🇲🇴": new RegExp(`澳门|氹仔|路环|路氹|花地玛|圣安多尼|大堂区|望德堂|风顺堂|${b.l}(Macao|Macau|Taipa|Coloane|Cotai|Fatima|Anthony|Lazarus|Lawrence|MO)${b.r}`, "gi"),
    "🇼🇸": new RegExp(`台湾|台北|台中|高雄|桃园|新北|台南|新竹|基隆|嘉义|彰化|苗栗|屏东|云林|南投|宜兰|花莲|台东|澎湖|${b.l}(Taibei|Taipei|Taiwan|Taichung|Kaohsiung|Taoyuan|Tainan|Hsinchu|Keelung|Chiayi|Changhua|Miaoli|Pingtung|Yunlin|Nantou|Yilan|Hualien|Taitung|Penghu|TW)${b.r}`, "gi"),
    "🇯🇵": new RegExp(`(?<!尼)日本|东京|大阪|京都|横滨|名古屋|福冈|神户|广岛|札幌|${b.l}(Japan|Tokyo|Osaka|Kyoto|Yokohama|Nagoya|Fukuoka|Kobe|Hiroshima|Sapporo|JP)${b.r}`, "gi"),
    "🇰🇷": new RegExp(`韩国|首尔|釜山|仁川|大邱|大田|光州|蔚山|水原|${b.l}(Korea|Seoul|Busan|Incheon|Daegu|Daejeon|Gwangju|Ulsan|Suwon|KR)${b.r}`, "gi"),
    "🇸🇬": new RegExp(`新加坡|狮城|樟宜|裕廊|乌节|圣淘沙|义顺|${b.l}(Singapore|Lion\\s?City|Changi|Jurong|Orchard|Sentosa|Yishun|SG)${b.r}`, "gi"),
    "🇺🇸": new RegExp(`美国|洛杉矶|圣何塞|西雅图|芝加哥|纽约|达拉斯|波士顿|旧金山|波特兰|${b.l}(United\\s?States|America|Los\\s?Angeles|San\\s?Jose|Seattle|Chicago|New\\s?York|Dallas|Boston|San\\s?Francisco|Portland|US)${b.r}`, "gi"),
    "🇬🇧": new RegExp(`英国|伦敦|曼彻斯特|伯明翰|格拉斯哥|利物浦|爱丁堡|贝尔法斯特|利兹|${b.l}(United\\s?Kingdom|Britain|London|Manchester|Birmingham|Glasgow|Liverpool|Edinburgh|Belfast|Leeds|UK|GB)${b.r}`, "gi"),
    "🇩🇪": new RegExp(`德国|法兰克福|柏林|慕尼黑|汉堡|杜塞尔多夫|科隆|斯图加特|莱比锡|${b.l}(Germany|Frankfurt|Berlin|Munich|Hamburg|Dusseldorf|Cologne|Stuttgart|Leipzig|DE)${b.r}`, "gi"),
    "🇫🇷": new RegExp(`法国|巴黎|马赛|里昂|图卢兹|尼斯|南特|斯特拉斯堡|波尔多|${b.l}(France|Paris|Marseille|Lyon|Toulouse|Nice|Nantes|Strasbourg|Bordeaux|FR)${b.r}`, "gi"),
    "🇷🇺": new RegExp(`俄罗斯|莫斯科|圣彼得堡|新西伯利亚|叶卡捷琳堡|喀山|海参崴|下诺夫哥罗德|索契|${b.l}(Russia|Moscow|Saint\\s?Petersburg|Novosibirsk|Yekaterinburg|Kazan|Vladivostok|Sochi|RU)${b.r}`, "gi"),
    "🇨🇳": new RegExp(`中国(?!(国际|香港|澳门|台湾))|北京|上海|天津|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|内蒙古|广西|西藏|宁夏|新疆|徐州|武汉|济南|青岛|苏州|南京|杭州|深圳|广州|成都|${b.l}(China|Beijing|Shanghai|Tianjin|Chongqing|Hebei|Shanxi|Liaoning|Jilin|Heilongjiang|Jiangsu|Zhejiang|Anhui|Fujian|Jiangxi|Shandong|Henan|Hubei|Hunan|Guangdong|Hainan|Sichuan|Guizhou|Yunnan|Shaanxi|Gansu|Qinghai|Inner\\s?Mongolia|Guangxi|Tibet|Ningxia|Xinjiang|Xuzhou|Wuhan|Jinan|Qingdao|Suzhou|Nanjing|Hangzhou|Shenzhen|Guangzhou|Chengdu|CN)${b.r}`, "gi")
  };

  // --- 4. 过滤与重命名逻辑 ---
  let list = proxies.filter(p => !blacklist.test(p.name));

  list = list.filter(p => {
    const originalFlag = ProxyUtils.getFlag(p.name).replace(/🇹🇼|🇼🇸|🇨🇳|🏴‍☠️/g, '');
    let cleanName = ProxyUtils.removeFlag(p.name).trim();
    
    let matchedEmoji = "";

    // 新增：判断是否以“优选”开头，如果是，直接赋美国国旗
    if (cleanName.startsWith("优选")) {
      matchedEmoji = "🇺🇸";
    } else {
      // 遍历正则匹配
      for (const [emoji, regex] of Object.entries(countryMap)) {
        if (new RegExp(regex.source, "gi").test(cleanName)) {
          matchedEmoji = emoji;
          break;
        }
      }
    }

    // 兜底：若正则未匹配到但原名有旗帜，则沿用
    if (!matchedEmoji && originalFlag) {
      matchedEmoji = originalFlag;
    }

    // 模式筛选
    const isChina = (matchedEmoji === "🇨🇳");
    if (model === "china" && !isChina) return false;
    if (model === "proxy" && isChina) return false;

    // 旗帜规范化
    const finalFlag = (matchedEmoji || '').replace(/🏴‍☠️/g, '').replace(/🇹🇼/g, '🇼🇸');

    // 重新组合名称
    p.name = `${finalFlag} ${cleanName}`.trim();
    
    return true;
  });

  // --- 5. 速率局部排序 (降序) ---
  const getSpeedValue = (name) => {
    const m = name.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB)\/s/i);
    if (!m) return null;
    const num = parseFloat(m[1]);
    const unit = m[2].toUpperCase();
    const factor = { "KB": 1, "MB": 1024, "GB": 1024 * 1024 };
    return num * (factor[unit] || 0);
  };

  const speedIndices = [];
  list.forEach((p, i) => {
    const val = getSpeedValue(p.name);
    if (val !== null) speedIndices.push({ index: i, val: val, proxy: p });
  });

  if (speedIndices.length > 0) {
    const sorted = [...speedIndices].sort((a, b) => b.val - a.val);
    speedIndices.forEach((item, i) => {
      list[item.index] = sorted[i].proxy;
    });
  }

  return list;
}
