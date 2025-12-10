/**
 * 雪球接口常量与通用请求头构造函数
 * 保持单一数据源，避免在多个文件重复硬编码字符串。
 */
export const BASE_URL_STOCK = 'https://stock.xueqiu.com/'
export const BASE_URL_MAIN = 'https://xueqiu.com/'
export const BASE_URL_EASTMONEY = 'https://datacenter-web.eastmoney.com/'
export const BASE_URL_CSINDEX = 'https://www.csindex.com.cn/'
export const BASE_URL_DANJUAN = 'https://danjuanapp.com/'
export const BASE_URL_HKEX = 'http://www.hkexnews.hk/'

/**
 * 构造统一的请求头（不含 Cookie）。
 * Cookie 由调用方按需追加，避免在多处散落。
 */
export const HEADERS_BASE = {
  'User-Agent': 'Xueqiu iPhone 14.15.1',
  Referer: BASE_URL_MAIN,
  Origin: BASE_URL_MAIN
}

/**
 * 根据 xq_a_token 构造 Cookie 字符串。
 */
export function buildCookieHeader(params: { xq_a_token?: string; xq_r_token?: string; u?: string }): string | undefined {
  const pairs: string[] = []
  if (params.xq_a_token) pairs.push(`xq_a_token=${params.xq_a_token}`)
  if (params.xq_r_token) pairs.push(`xq_r_token=${params.xq_r_token}`)
  if (params.u) pairs.push(`u=${params.u}`)
  if (!pairs.length) return undefined
  return pairs.join('; ')
}
