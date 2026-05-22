/*

Sub-Store Mega Full

URL 参数示例：

https://sub.xxx.com/link#host=v.qq.com&prefix=[微博混淆]&suffix=[tobe.vip.weibo.com]

支持参数：

disabled=true

title=Mega

prefix=[免流]
suffix=[混淆]

host=v.qq.com
hostPrefix=[腾讯]
hostSuffix=[Host]

path=/
pathPrefix=[路径]
pathSuffix=[WS]

network=ws
networkPrefix=true
networkSuffix=true

defaultNetworkPath=/

ipPrefix=true
ipSuffix=true

port=443

sort=true

resolve=true
resolver=cloudflare

sleep=1

expire=1800

cacheMaxSize=100

notifyOnSuccessDisabled=true

mock=true

clearCache=true

*/

const rootNamespace = '@xream'
const subNamespace = 'sub_store_mega'
const namespace = `${rootNamespace}.${subNamespace}`

const $ = new Env(subNamespace)

const KEY_CACHE = `${namespace}.cache`

/* =========================
   参数
========================= */

const title =
  getVal('title') || 'Mega'

const disabled =
  String(getVal('disabled')) === 'true'

/* host */
const host =
  getVal('host') || 'v.qq.com'

/* path */
const pathOpt =
  getVal('path')

/* network */
const network =
  getVal('network')

/* 默认 path */
const defaultNetworkPath =
  getVal('defaultNetworkPath') || '/'

/* 节点名前后缀 */
const prefix =
  getVal('prefix') || ''

const suffix =
  getVal('suffix') || ''

/* host 前后缀 */
const hostPrefix =
  getVal('hostPrefix') || ''

const hostSuffix =
  getVal('hostSuffix') || ''

/* path 前后缀 */
const pathPrefix =
  getVal('pathPrefix') || ''

const pathSuffix =
  getVal('pathSuffix') || ''

/* ip 前后缀 */
const ipPrefix =
  String(getVal('ipPrefix')) === 'true'

const ipSuffix =
  String(getVal('ipSuffix')) === 'true'

/* network 前后缀 */
const networkPrefix =
  String(getVal('networkPrefix')) === 'true'

const networkSuffix =
  String(getVal('networkSuffix')) === 'true'

/* port */
const port =
  getVal('port')

/* 排序 */
const autoSort =
  String(getVal('sort')) === 'true'

/* 域名解析 */
const resolve =
  String(getVal('resolve')) === 'true'

const resolver =
  getVal('resolver') || 'cloudflare'

/* 等待 */
const sleep =
  Number(getVal('sleep') || 0)

/* 缓存时间 */
const expire =
  Number(getVal('expire') || 1800)

/* 缓存大小 */
const cacheMaxSize =
  Number(getVal('cacheMaxSize') || 100)

/* 成功通知 */
const notifyOnSuccessDisabled =
  String(getVal('notifyOnSuccessDisabled')) === 'true'

/* mock */
const mock =
  String(getVal('mock')) === 'true'

/* 清缓存 */
if (
  String(getVal('clearCache')) === 'true'
) {
  $.setjson({}, KEY_CACHE)
  $.setdata(
    false,
    `${namespace}.clearCache`
  )
}

/* =========================
   缓存
========================= */

let cache =
  $.getjson(KEY_CACHE) || {}

let resolveTimes = 0
let cacheHitTimes = 0
let resolvedCount = 0
let unresolvedCount = 0

/* =========================
   operator
========================= */

async function operator(
  proxies = []
) {

  if (disabled) {
    $.log('已禁用')
    return proxies
  }

  const startedAt = Date.now()

  let result = []

  if (sleep <= 0) {

    result = await Promise.all(
      proxies.map(p =>
        proxyHandler(p)
      )
    )

  } else {

    for (let p of proxies) {

      p = await proxyHandler(p)

      result.push(p)
    }
  }

  if (autoSort) {
    result.sort(
      (a, b) => b._sort - a._sort
    )
  }

  /* 限制缓存大小 */
  let cacheKeys =
    Object.keys(cache)

  cacheKeys =
    cacheKeys.slice(-cacheMaxSize)

  cache = Object.fromEntries(
    Object.entries(cache).filter(
      ([key]) =>
        cacheKeys.includes(key)
    )
  )

  $.setjson(cache, KEY_CACHE)

  const cost =
    Math.round(
      (Date.now() - startedAt) / 1000
    )

  $.log(`耗时 ${cost}s`)

  if (
    !notifyOnSuccessDisabled
  ) {

    $.msg(
      title,
      `✅ 完成 ${cost}s`,
      `缓存:${cacheHitTimes}
解析:${resolveTimes}
成功:${resolvedCount}
失败:${unresolvedCount}`
    )
  }

  return result
}

/* =========================
   节点处理
========================= */

async function proxyHandler(p) {

  /* network */
  if (network) {
    p = setNetwork(
      p,
      network
    )
  }

  /* host */
  if (host) {
    p = setHost(
      p,
      host
    )
  }

  /* path */
  if (pathOpt) {
    p = setPath(
      p,
      pathOpt
    )
  }

  /* port */
  if (port) {
    p = setPort(
      p,
      port
    )
  }

  /* network 名称 */
  if (
    networkPrefix ||
    networkSuffix
  ) {

    const txt =
      p.network
        ? `[${p.network.toUpperCase()}]`
        : ''

    p = setName(
      p,
      networkPrefix
        ? txt
        : '',
      networkSuffix
        ? txt
        : ''
    )
  }

  /* resolve */
  if (resolve) {
    p = await resolveServer(p)
  }

  /* 节点名前后缀 */
  p = setName(
    p,
    prefix,
    suffix
  )

  return p
}

/* =========================
   host
========================= */

function setHost(
  p,
  host
) {

  if (
    ![
      'vmess',
      'vless',
      'trojan'
    ].includes(p.type)
  ) {
    return p
  }

  let changed = false

  p.servername = host
  p.sni = host

  if (p.tls) {

    p['skip-cert-verify'] = true

    p['tls-hostname'] = host

    changed = true
  }

  /* ws */
  if (p.network === 'ws') {

    $.lodash_set(
      p,
      'ws-opts.headers.Host',
      host
    )

    changed = true
  }

  /* h2 */
  else if (
    p.network === 'h2'
  ) {

    $.lodash_set(
      p,
      'h2-opts.host',
      [host]
    )

    changed = true
  }

  /* http */
  else if (
    p.network === 'http'
  ) {

    $.lodash_set(
      p,
      'http-opts.headers.Host',
      [host]
    )

    changed = true
  }

  /* grpc */
  else if (
    p.network === 'grpc'
  ) {

    $.lodash_set(
      p,
      'grpc-opts.authority',
      host
    )

    changed = true
  }

  /* 其它 */
  else if (p.network) {

    $.lodash_set(
      p,
      `${p.network}-opts.headers.Host`,
      [host]
    )

    changed = true
  }

  /*
    修复：
    hostPrefix / hostSuffix
  */

  if (
    changed &&
    !p._hostMarked
  ) {

    p._hostMarked = true

    p = setName(
      p,
      hostPrefix,
      hostSuffix
    )
  }

  return p
}

/* =========================
   path
========================= */

function setPath(
  p,
  path
) {

  if (
    ![
      'vmess',
      'vless',
      'trojan'
    ].includes(p.type)
  ) {
    return p
  }

  let changed = false

  /* ws */
  if (p.network === 'ws') {

    $.lodash_set(
      p,
      'ws-opts.path',
      path
    )

    changed = true
  }

  /* h2 */
  else if (
    p.network === 'h2'
  ) {

    $.lodash_set(
      p,
      'h2-opts.path',
      path
    )

    changed = true
  }

  /* http */
  else if (
    p.network === 'http'
  ) {

    $.lodash_set(
      p,
      'http-opts.path',
      [path]
    )

    changed = true
  }

  /* grpc */
  else if (
    p.network === 'grpc'
  ) {

    $.lodash_set(
      p,
      'grpc-opts.serviceName',
      path
    )

    changed = true
  }

  /* 其它 */
  else if (p.network) {

    $.lodash_set(
      p,
      `${p.network}-opts.path`,
      path
    )

    changed = true
  }

  if (
    changed &&
    !p._pathMarked
  ) {

    p._pathMarked = true

    p = setName(
      p,
      pathPrefix,
      pathSuffix
    )
  }

  return p
}

/* =========================
   network
========================= */

function setNetwork(
  p,
  network
) {

  if (
    ![
      'vmess',
      'vless',
      'trojan'
    ].includes(p.type)
  ) {
    return p
  }

  delete p[
    `${p.network}-opts`
  ]

  p.network = network

  setPath(
    p,
    defaultNetworkPath
  )

  return p
}

/* =========================
   port
========================= */

function setPort(
  p,
  port
) {

  p.port = Number(port)

  p = setName(
    p,
    '',
    `[${port}]`
  )

  return p
}

/* =========================
   resolve
========================= */

async function resolveServer(
  p
) {

  if (
    isIPV4(p.server)
  ) {
    return p
  }

  let ip

  const cacheKey =
    p.server.replace(
      /\./g,
      '_'
    )

  const cached =
    $.lodash_get(
      cache,
      cacheKey
    )

  if (cached) {

    const [
      cachedIP,
      timestamp
    ] = cached

    const diff =
      (Date.now() -
        timestamp) /
      1000

    if (
      diff <= expire &&
      isIPV4(cachedIP)
    ) {

      ip = cachedIP

      cacheHitTimes++
    }
  }

  if (!ip) {

    resolveTimes++

    try {

      if (mock) {

        ip = `1.1.1.${Math.floor(
          Math.random() * 200
        )}`

      } else {

        ip =
          await dnsResolve(
            p.server
          )
      }

      if (
        isIPV4(ip)
      ) {

        resolvedCount++

        cache[
          cacheKey
        ] = [
          ip,
          Date.now()
        ]

      } else {

        unresolvedCount++
      }

    } catch (e) {

      unresolvedCount++
    }

    if (sleep > 0) {

      await $.wait(
        sleep * 1000
      )
    }
  }

  if (
    isIPV4(ip)
  ) {

    p.server = ip

    if (
      ipPrefix ||
      ipSuffix
    ) {

      const txt =
        `[${ip}]`

      p = setName(
        p,
        ipPrefix
          ? txt
          : '',
        ipSuffix
          ? txt
          : ''
      )
    }
  }

  return p
}

/* =========================
   dns
========================= */

async function dnsResolve(
  host
) {

  let url

  if (
    resolver === 'google'
  ) {

    url =
      `https://8.8.4.4/resolve?name=${encodeURIComponent(host)}&type=A`

  } else if (
    resolver === 'ip-api'
  ) {

    url =
      `http://ip-api.com/json/${encodeURIComponent(host)}?lang=zh-CN`

  } else {

    url =
      `https://1.0.0.1/dns-query?name=${encodeURIComponent(host)}&type=A`
  }

  const res =
    await $.http.get({
      url,
      headers: {
        accept:
          'application/dns-json',
        'User-Agent':
          'Mozilla/5.0'
      }
    })

  const body =
    $.toObj(
      res.body
    )

  if (
    resolver === 'ip-api'
  ) {

    return body.query

  } else {

    const answers =
      body.Answer || []

    return $.lodash_get(
      answers,
      `${answers.length - 1}.data`
    )
  }
}

/* =========================
   排序
========================= */

function sort(p) {

  let score = 0

  if (
    p.name.includes('香港')
  ) {
    score = 20
  }

  else if (
    p.name.includes('日本')
  ) {
    score = 19
  }

  else if (
    p.name.includes('美国')
  ) {
    score = 18
  }

  else if (
    p.name.includes('韩国')
  ) {
    score = 17
  }

  p._sort = score

  return p
}

/* =========================
   util
========================= */

function setName(
  p,
  prefix = '',
  suffix = ''
) {

  p.name =
    `${prefix}${p.name}${suffix}`

  return p
}

function isIPV4(ip) {

  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(
    ip
  )
}

function getVal(key) {

  return (
    $.lodash_get(
      $arguments,
      key
    ) ||
    $.getdata(
      `${namespace}.${key}`
    )
  )
}

/* =========================
   Env
========================= */

function Env(name) {

  return {

    name,

    data: {},

    log(...args) {
      console.log(...args)
    },

    msg(
      title,
      sub,
      body
    ) {
      console.log(
`${title}
${sub}
${body}`
      )
    },

    wait(t) {
      return new Promise(
        r => setTimeout(r, t)
      )
    },

    getdata(key) {
      return this.data[key]
    },

    setdata(
      val,
      key
    ) {
      this.data[key] = val
    },

    getjson(key) {

      try {

        return JSON.parse(
          this.data[key]
        )

      } catch {

        return null
      }
    },

    setjson(
      val,
      key
    ) {

      this.data[key] =
        JSON.stringify(val)
    },

    toObj(str) {

      try {

        return JSON.parse(str)

      } catch {

        return {}
      }
    },

    lodash_get(
      obj,
      path,
      def
    ) {

      const paths =
        path
          .replace(
            /\[(\d+)\]/g,
            '.$1'
          )
          .split('.')

      let result = obj

      for (const p of paths) {

        result =
          Object(result)[p]

        if (
          result === undefined
        ) {
          return def
        }
      }

      return result
    },

    lodash_set(
      obj,
      path,
      value
    ) {

      if (
        Object(obj) !== obj
      ) {
        return obj
      }

      if (
        !Array.isArray(path)
      ) {

        path =
          path
            .toString()
            .match(
              /[^.[\]]+/g
            ) || []
      }

      path
        .slice(0, -1)
        .reduce(
          (
            a,
            c,
            i
          ) => {

            return Object(
              a[c]
            ) === a[c]

              ? a[c]

              : (
                a[c] =
                  Math.abs(
                    path[i + 1]
                  ) >> 0 ===
                  +path[i + 1]

                    ? []

                    : {}
              )

          },
          obj
        )[path[path.length - 1]] = value

      return obj
    },

    http: {

      get(opts) {

        return new Promise(
          (
            resolve,
            reject
          ) => {

            $httpClient.get(
              opts,
              (
                err,
                resp,
                body
              ) => {

                if (err) {

                  reject(err)

                } else {

                  resolve({
                    status:
                      resp.status,
                    body
                  })
                }
              }
            )
          }
        )
      }
    }
  }
}
