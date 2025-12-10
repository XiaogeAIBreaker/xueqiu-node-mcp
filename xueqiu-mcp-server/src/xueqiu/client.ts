import axios, { AxiosInstance } from 'axios'
import { load as loadHtml } from 'cheerio'
import type { XueqiuCookies } from '../config.js'
import {
  BASE_URL_STOCK,
  BASE_URL_MAIN,
  BASE_URL_EASTMONEY,
  BASE_URL_CSINDEX,
  BASE_URL_DANJUAN,
  BASE_URL_HKEX,
  HEADERS_BASE,
  buildCookieHeader
} from '../core/constants.js'

/**
 * 雪球 HTTP 客户端
 * - 统一追加请求头（UA/Referer/Origin）与 Cookie
 * - 指数退避重试：429 与 5xx
 * - 轻量缓存：行情 2s、分钟 10s、K 线 30s、资金/组合 60s、快照 5s
 * - 衍生：财务、公告、F10、基金、指数、东财转债、港交所北向持股
 */

export class XueqiuClient {
  private axios: AxiosInstance
  private axiosMain: AxiosInstance
  private cookies?: XueqiuCookies
  private cache = new Map<string, { expire: number; data: any }>()

  constructor(cookies?: XueqiuCookies) {
    this.cookies = cookies
    this.axios = axios.create({ baseURL: BASE_URL_STOCK, timeout: 15000 })
    this.axiosMain = axios.create({ baseURL: BASE_URL_MAIN, timeout: 15000 })
    this.axios.interceptors.request.use((config) => {
      config.headers = config.headers || {}
      ;(config.headers as any)['User-Agent'] = HEADERS_BASE['User-Agent']
      ;(config.headers as any)['Referer'] = HEADERS_BASE['Referer']
      ;(config.headers as any)['Origin'] = HEADERS_BASE['Origin']
      const cookie =
        this.cookies?.rawCookie ||
        buildCookieHeader({ xq_a_token: this.cookies?.xq_a_token, xq_r_token: this.cookies?.xq_r_token, u: this.cookies?.u })
      if (cookie) (config.headers as any)['Cookie'] = cookie
      return config
    })
    this.axios.interceptors.response.use(
      (resp) => resp,
      async (err) => {
        const status = err?.response?.status
        if (status === 429 || status >= 500) {
          await new Promise((r) => setTimeout(r, 500))
          return this.axios.request(err.config)
        }
        throw err
      }
    )
    this.axiosMain.interceptors.request.use((config) => {
      config.headers = config.headers || {}
      ;(config.headers as any)['User-Agent'] = HEADERS_BASE['User-Agent']
      ;(config.headers as any)['Referer'] = HEADERS_BASE['Referer']
      ;(config.headers as any)['Origin'] = BASE_URL_MAIN
      const cookie =
        this.cookies?.rawCookie ||
        buildCookieHeader({ xq_a_token: this.cookies?.xq_a_token, xq_r_token: this.cookies?.xq_r_token, u: this.cookies?.u })
      if (cookie) (config.headers as any)['Cookie'] = cookie
      return config
    })
  }

  updateCookies(cookies?: XueqiuCookies) {
    this.cookies = cookies
  }

  private async withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const data = await fn()
    this.cache.set(key, { expire: now + ttlMs, data })
    return data
  }

  async realtimeQuotes(symbols: string[]): Promise<any> {
    const query = symbols.join(',')
    const url = `/v5/stock/realtime/quotec.json?symbol=${encodeURIComponent(query)}`
    return this.withCache(`quotes:${url}`, 2000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async kline(params: { symbol: string; period: string; begin: number; count: number; type?: string; indicator?: string }): Promise<any> {
    const mapPeriod = (p: string) => {
      const t = p.toLowerCase()
      if (['1m', '5m', '15m', '30m', '60m', '1d', '1w', '1mo'].includes(t)) return t
      const alias: Record<string, string> = { day: '1d', d: '1d', week: '1w', w: '1w', month: '1mo', mo: '1mo', m1: '1m', m5: '5m' }
      return alias[t] || t
    }
    const { symbol, period, begin, count, type = 'normal', indicator = 'kline,volume' } = params
    const p = mapPeriod(period)
    const buildUrl = (b: number) => `/v5/stock/chart/kline.json?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(p)}&begin=${b}&count=${count}&type=${type}&indicator=${encodeURIComponent(indicator)}`
    const tryFetch = async (b: number) => {
      const url = buildUrl(b)
      return this.withCache(`kline:${url}`, 30000, async () => {
        const { data } = await this.axios.get(url)
        return data
      })
    }
    const first = await tryFetch(begin)
    const zeroItems = !!first?.data && (first.data.items_size === 0 || Array.isArray(first.data.items) && first.data.items.length === 0)
    if (!zeroItems) return first
    const durMap: Record<string, number> = { '1m': 60_000, '5m': 300_000, '15m': 900_000, '30m': 1_800_000, '60m': 3_600_000, '1d': 86_400_000, '1w': 604_800_000, '1mo': 30 * 86_400_000 }
    const dur = durMap[p] || 86_400_000
    const extra = p === '1d' ? 180 : 10
    const fallbackBegin = Math.max(0, begin - dur * (count + extra))
    const second = await tryFetch(fallbackBegin)
    return second
  }

  async search(query: string, count = 10): Promise<any> {
    const base = `${BASE_URL_MAIN}query/v1/suggest.json`
    const { data } = await this.axios.get(`${base}?q=${encodeURIComponent(query)}&count=${count}`)
    return data
  }

  async watchlist(category = 'stock'): Promise<any> {
    const url = `/v5/stock/portfolio/stock/list.json?category=${encodeURIComponent(category)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async minuteTimeline(params: { symbol: string; begin?: number; count?: number }): Promise<any> {
    const { symbol, begin = Date.now(), count = 120 } = params
    const url = `/v5/stock/chart/minute.json?symbol=${encodeURIComponent(symbol)}&begin=${begin}&count=${count}`
    const key = `minute:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 10000, data })
    return data
  }

  async capitalAssort(symbol: string): Promise<any> {
    const url = `/v5/stock/capital/assort.json?symbol=${encodeURIComponent(symbol)}`
    return this.withCache(`capital:${url}`, 60000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async quoteSnapshot(symbols: string[]): Promise<any> {
    const query = symbols.join(',')
    const url = `/v5/stock/quote.json?symbol=${encodeURIComponent(query)}&extend=detail`
    return this.withCache(`snapshot:${url}`, 5000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async cubeInfo(cubeSymbol: string): Promise<any> {
    const base = `${BASE_URL_MAIN}cubes/show.json`
    const url = `${base}?symbols=${encodeURIComponent(cubeSymbol)}`
    return this.withCache(`cube:${url}`, 60000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async pankou(symbol: string): Promise<any> {
    const url = `/v5/stock/realtime/pankou.json?symbol=${encodeURIComponent(symbol)}`
    return this.withCache(`pankou:${url}`, 2000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async capitalMargin(symbol: string, page = 1, size = 180): Promise<any> {
    const url = `/v5/stock/capital/margin.json?symbol=${encodeURIComponent(symbol)}&page=${page}&size=${size}`
    return this.withCache(`margin:${url}`, 30000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async capitalBlocktrans(symbol: string, page = 1, size = 30): Promise<any> {
    const url = `/v5/stock/capital/blocktrans.json?symbol=${encodeURIComponent(symbol)}&page=${page}&size=${size}`
    return this.withCache(`blocktrans:${url}`, 30000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async capitalFlow(symbol: string): Promise<any> {
    const url = `/v5/stock/capital/flow.json?symbol=${encodeURIComponent(symbol)}`
    return this.withCache(`capitalflow:${url}`, 10000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async capitalHistory(symbol: string, count = 20): Promise<any> {
    const url = `/v5/stock/capital/history.json?symbol=${encodeURIComponent(symbol)}&count=${count}`
    return this.withCache(`capitalhistory:${url}`, 60000, async () => {
      const { data } = await this.axios.get(url)
      return data
    })
  }

  async financeCashFlow(symbol: string, isAnnals = 0, count = 10): Promise<any> {
    const suffix = isAnnals === 1 ? `&type=Q4&count=${count}` : `&count=${count}`
    const url = `/v5/stock/finance/cn/cash_flow.json?symbol=${encodeURIComponent(symbol)}${suffix}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeCashFlowV2(params: { symbol: string; count?: number; region?: string; type?: string; is_detail?: boolean }): Promise<any> {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = params
    const url = `/v5/stock/finance/${encodeURIComponent(region)}/cash_flow.json?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}&is_detail=${String(is_detail)}&count=${count}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeIndicator(symbol: string, isAnnals = 0, count = 10): Promise<any> {
    const suffix = isAnnals === 1 ? `&type=Q4&count=${count}` : `&count=${count}`
    const url = `/v5/stock/finance/cn/indicator.json?symbol=${encodeURIComponent(symbol)}${suffix}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeIndicatorV2(params: { symbol: string; count?: number; region?: string; type?: string; is_detail?: boolean }): Promise<any> {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = params
    const url = `/v5/stock/finance/${encodeURIComponent(region)}/indicator.json?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}&is_detail=${String(is_detail)}&count=${count}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeBalance(symbol: string, isAnnals = 0, count = 10): Promise<any> {
    const suffix = isAnnals === 1 ? `&type=Q4&count=${count}` : `&count=${count}`
    const url = `/v5/stock/finance/cn/balance.json?symbol=${encodeURIComponent(symbol)}${suffix}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeBalanceV2(params: { symbol: string; count?: number; region?: string; type?: string; is_detail?: boolean }): Promise<any> {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = params
    const url = `/v5/stock/finance/${encodeURIComponent(region)}/balance.json?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}&is_detail=${String(is_detail)}&count=${count}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeIncome(symbol: string, isAnnals = 0, count = 10): Promise<any> {
    const suffix = isAnnals === 1 ? `&type=Q4&count=${count}` : `&count=${count}`
    const url = `/v5/stock/finance/cn/income.json?symbol=${encodeURIComponent(symbol)}${suffix}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeIncomeV2(params: { symbol: string; count?: number; region?: string; type?: string; is_detail?: boolean }): Promise<any> {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = params
    const url = `/v5/stock/finance/${encodeURIComponent(region)}/income.json?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}&is_detail=${String(is_detail)}&count=${count}`
    const { data } = await this.axios.get(url)
    return data
  }

  async financeBusiness(symbol: string, isAnnals = 0, count = 10): Promise<any> {
    const suffix = isAnnals === 1 ? `&type=Q4&count=${count}` : `&count=${count}`
    const url = `/v5/stock/finance/cn/business.json?symbol=${encodeURIComponent(symbol)}${suffix}`
    const { data } = await this.axios.get(url)
    return data
  }

  async reportLatest(symbol: string): Promise<any> {
    const url = `${BASE_URL_STOCK}stock/report/latest.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async reportEarningForecast(symbol: string): Promise<any> {
    const url = `${BASE_URL_STOCK}stock/report/earningforecast.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Skholderchg(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/skholderchg.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Skholder(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/skholder.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Industry(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/industry.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Holders(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/holders.json?&symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Bonus(symbol: string, page = 1, size = 10): Promise<any> {
    const url = `/v5/stock/f10/cn/bonus.json?&symbol=${encodeURIComponent(symbol)}&page=${page}&size=${size}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10OrgHoldingChange(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/org_holding/change.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10IndustryCompare(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/industry/compare.json?type=single&symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10BusinessAnalysis(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/business_analysis.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10Sharesschg(symbol: string, count = 5): Promise<any> {
    const url = `/v5/stock/f10/cn/business_analysis.json?symbol=${encodeURIComponent(symbol)}&count=${count}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10TopHolders(symbol: string, circula = 1): Promise<any> {
    const url = `/v5/stock/f10/cn/top_holders.json?&symbol=${encodeURIComponent(symbol)}&circula=${circula}`
    const { data } = await this.axios.get(url)
    return data
  }

  async f10MainIndicator(symbol: string): Promise<any> {
    const url = `/v5/stock/f10/cn/indicator.json?symbol=${encodeURIComponent(symbol)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async watchList(): Promise<any> {
    const url = `/v5/stock/portfolio/list.json?system=true`
    const { data } = await this.axios.get(url)
    return data
  }

  async watchStock(pid: string): Promise<any> {
    const url = `/v5/stock/portfolio/stock/list.json?size=1000&category=1&pid=${encodeURIComponent(pid)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async cubeNavDaily(cubeSymbol: string): Promise<any> {
    const url = `${BASE_URL_MAIN}cubes/nav_daily/all.json?cube_symbol=${encodeURIComponent(cubeSymbol)}`
    const { data } = await this.axiosMain.get(url)
    return data
  }

  async cubeRebalancingHistory(cubeSymbol: string, count = 20, page = 1): Promise<any> {
    const url = `${BASE_URL_MAIN}cubes/rebalancing/history.json?cube_symbol=${encodeURIComponent(cubeSymbol)}&count=${count}&page=${page}`
    const { data } = await this.axiosMain.get(url)
    return data
  }

  async cubeRebalancingCurrent(cubeSymbol: string): Promise<any> {
    const url = `${BASE_URL_MAIN}cubes/rebalancing/current.json?cube_symbol=${encodeURIComponent(cubeSymbol)}`
    const { data } = await this.axiosMain.get(url)
    return data
  }

  async cubeQuoteCurrent(cubeSymbol: string): Promise<any> {
    const url = `${BASE_URL_MAIN}cubes/quote.json?code=${encodeURIComponent(cubeSymbol)}`
    const { data } = await this.axiosMain.get(url)
    return data
  }

  async convertibleBond(pageSize: number, pageNumber: number): Promise<any> {
    const url = `${BASE_URL_EASTMONEY}api/data/v1/get?pageSize=${pageSize}&pageNumber=${pageNumber}&sortColumns=PUBLIC_START_DATE&sortTypes=-1&reportName=RPT_BOND_CB_LIST&columns=ALL&quoteColumns=f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE%2Cf235~10~SECURITY_CODE~TRANSFER_PRICE%2Cf236~10~SECURITY_CODE~TRANSFER_VALUE%2Cf2~10~SECURITY_CODE~CURRENT_BOND_PRICE%2Cf237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO%2Cf239~10~SECURITY_CODE~RESALE_TRIG_PRICE%2Cf240~10~SECURITY_CODE~REDEEM_TRIG_PRICE%2Cf23~01~CONVERT_STOCK_CODE~PBV_RATIO&source=WEB&client=WEB`
    const { data } = await axios.get(url, {
      headers: {
        Host: 'datacenter-web.eastmoney.com',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }
    })
    return data
  }

  async indexBasicInfo(symbols: string): Promise<any> {
    const url = `${BASE_URL_CSINDEX}csindex-home/indexInfo/index-basic-info/${encodeURIComponent(symbols)}`
    const { data } = await axios.get(url, {
      headers: {
        Host: 'www.csindex.com.cn',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*'
      }
    })
    return data
  }

  async indexDetailsData(symbols: string): Promise<any> {
    const url = `${BASE_URL_CSINDEX}csindex-home/indexInfo/index-details-data?fileLang=1&indexCode=${encodeURIComponent(symbols)}`
    const { data } = await axios.get(url, {
      headers: {
        Host: 'www.csindex.com.cn',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*'
      }
    })
    return data
  }

  async indexWeightTop10(symbols: string): Promise<any> {
    const url = `${BASE_URL_CSINDEX}csindex-home/index/weight/top10/${encodeURIComponent(symbols)}`
    const { data } = await axios.get(url, {
      headers: {
        Host: 'www.csindex.com.cn',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*'
      }
    })
    return data
  }

  private async indexPerfRange(symbols: string, days: number): Promise<any> {
    const today = new Date()
    const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const url = `${BASE_URL_CSINDEX}csindex-home/perf/index-perf?indexCode=${encodeURIComponent(symbols)}&startDate=${fmt(start)}&endDate=${fmt(today)}`
    const { data } = await axios.get(url, {
      headers: {
        Host: 'www.csindex.com.cn',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*'
      }
    })
    return data
  }

  async indexPerf7(symbols: string): Promise<any> {
    return this.indexPerfRange(symbols, 7)
  }

  async indexPerf30(symbols: string): Promise<any> {
    return this.indexPerfRange(symbols, 30)
  }

  async indexPerf90(symbols: string): Promise<any> {
    return this.indexPerfRange(symbols, 90)
  }

  async hkexNorthbound(exchange: 'sh' | 'sz', txtDate?: string): Promise<any> {
    const today = new Date()
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const payload = new URLSearchParams({
      __VIEWSTATE: '/wEPDwUJNjIxMTYzMDAwZGSFj8kdzCLeVLiJkFRvN5rjsPotqw==',
      __VIEWSTATEGENERATOR: '3C67932C',
      __EVENTVALIDATION: '/wEdAAdbi0fj+ZSDYaSP61MAVoEdVobCVrNyCM2j+bEk3ygqmn1KZjrCXCJtWs9HrcHg6Q64ro36uTSn/Z2SUlkm9HsG7WOv0RDD9teZWjlyl84iRMtpPncyBi1FXkZsaSW6dwqO1N1XNFmfsMXJasjxX85ju3P1WAPUeweM/r0/uwwyYLgN1B8=',
      today: todayStr,
      sortBy: 'stockcode',
      sortDirection: 'asc',
      alertMsg: '',
      txtShareholdingDate: txtDate || `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`,
      btnSearch: 'Search'
    })
    const url = `${BASE_URL_HKEX}sdw/search/mutualmarket.aspx?t=${exchange}`
    const { data: html } = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const $ = loadHtml(html)
    const rows: any[] = []
    $('#mutualmarket-result tbody tr').each((_idx, tr) => {
      const code = $(tr).find('td.col-stock-code div.mobile-list-body').text().trim()
      const name = $(tr).find('td.col-stock-name div.mobile-list-body').text().trim()
      const shareholding = $(tr).find('td.col-shareholding div.mobile-list-body').text().trim().replace(/,/g, '')
      const shareholdingPercent = $(tr).find('td.col-shareholding-percent div.mobile-list-body').text().trim()
      rows.push({ code, name, shareholding: Number(shareholding || 0), shareholding_percent: shareholdingPercent })
    })
    return rows
  }

  async fundDetail(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/detail/${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundInfo(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundGrowth(code: string, day = 'ty'): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/growth/${encodeURIComponent(code)}?day=${encodeURIComponent(day)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundNavHistory(code: string, page = 1, size = 10): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/nav/history/${encodeURIComponent(code)}?page=${page}&size=${size}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundAchievement(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fundx/base/fund/achievement/${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundAsset(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fundx/base/fund/record/asset/percent?fund_code=${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundManager(code: string, post_status = 1): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fundx/base/fund/record/manager/list?fund_code=${encodeURIComponent(code)}&post_status=${post_status}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundTradeDate(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/order/v2/trade_date?fd_code=${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }

  async fundDerived(code: string): Promise<any> {
    const url = `${BASE_URL_DANJUAN}djapi/fund/derived/${encodeURIComponent(code)}`
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return data
  }
}
