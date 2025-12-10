import './polyfill.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
/**
 * MCP 服务入口：注册工具并通过 stdio 传输与客户端通信。
 * 保持工具顺序与业务逻辑不变；仅整理样板与注释。
 */
import { loadConfig, type XueqiuCookies } from './config.js'
import { XueqiuClient } from './xueqiu/client.js'
import { pingInput, pingOutput } from './tools/ping.js'
import { registerStructuredTool } from './core/registry.js'
import { createUpdateCookiesTool, updateCookiesInput, updateCookiesOutput } from './tools/updateCookies.js'
import { createGetRealtimeQuotesTool, getRealtimeQuotesInput, getRealtimeQuotesOutput } from './tools/getRealtimeQuotes.js'
import { createGetKlineTool, getKlineInput, getKlineOutput } from './tools/getKline.js'
import { createSearchSymbolsTool, searchSymbolsInput, searchSymbolsOutput } from './tools/searchSymbols.js'
import { createGetWatchlistTool, getWatchlistInput, getWatchlistOutput } from './tools/getWatchlist.js'
import { createGetMinuteTimelineTool, getMinuteTimelineInput, getMinuteTimelineOutput } from './tools/getMinuteTimeline.js'
import { createGetCapitalAssortTool, getCapitalAssortInput, getCapitalAssortOutput } from './tools/getCapitalAssort.js'
import { createGetQuoteSnapshotTool, getQuoteSnapshotInput, getQuoteSnapshotOutput } from './tools/getQuoteSnapshot.js'
import { createGetCubeInfoTool, getCubeInfoInput, getCubeInfoOutput } from './tools/getCubeInfo.js'
import { createQuotecTool, quotecInput, quotecOutput } from './tools/quotec.js'
import { createQuoteDetailTool, quoteDetailInput, quoteDetailOutput } from './tools/quoteDetail.js'
import { createSuggestStockTool, suggestStockInput, suggestStockOutput } from './tools/suggestStock.js'
import { createPankouTool, pankouInput, pankouOutput } from './tools/pankou.js'
import {
  createCapitalBlocktransTool,
  createCapitalFlowTool,
  createCapitalHistoryTool,
  createCapitalMarginTool,
  capitalOutput,
  capitalPagedInput,
  capitalSymbolInput
} from './tools/capital.js'
import {
  financeBaseInput,
  financeOutput,
  createCashFlowTool,
  createCashFlowV2Tool,
  financeV2Input,
  createIndicatorTool,
  createIndicatorV2Tool,
  createBalanceTool,
  createBalanceV2Tool,
  createIncomeTool,
  createIncomeV2Tool,
  createBusinessTool
} from './tools/finance.js'
import { createReportTool, createEarningForecastTool, reportInput, reportOutput } from './tools/report.js'
import {
  createBonusTool,
  createBusinessAnalysisTool,
  createHoldersTool,
  createIndustryCompareTool,
  createIndustryTool,
  createMainIndicatorTool,
  createOrgHoldingChangeTool,
  createSharesschgTool,
  createSkholderTool,
  createSkholderchgTool,
  createTopHoldersTool,
  f10BonusInput,
  f10Output,
  f10SharesschgInput,
  f10SymbolInput,
  f10TopHoldersInput
} from './tools/f10.js'
import { createWatchListTool, watchListInput, watchListOutput } from './tools/watchList.js'
import { createWatchStockTool, watchStockInput, watchStockOutput } from './tools/watchStock.js'
import {
  createCubeNavDailyTool,
  createCubeQuoteCurrentTool,
  createCubeRebalancingCurrentTool,
  createCubeRebalancingHistoryTool,
  cubeHistoryInput,
  cubeOutput,
  cubeSymbolInput
} from './tools/cube.js'
import { createConvertibleBondTool, convertibleBondInput, convertibleBondOutput } from './tools/bond.js'
import {
  createIndexBasicInfoTool,
  createIndexDetailsDataTool,
  createIndexPerf30Tool,
  createIndexPerf7Tool,
  createIndexPerf90Tool,
  createIndexWeightTop10Tool,
  indexInput,
  indexOutput
} from './tools/index.js'
import { createHkexTool, hkexInput, hkexOutput } from './tools/hkex.js'
import {
  createFundAchievementTool,
  createFundAssetTool,
  createFundDetailTool,
  createFundDerivedTool,
  createFundGrowthTool,
  createFundInfoTool,
  createFundManagerTool,
  createFundNavHistoryTool,
  createFundTradeDateTool,
  fundCodeInput,
  fundGrowthInput,
  fundManagerInput,
  fundNavHistoryInput,
  fundOutput
} from './tools/fund.js'

const cfg = loadConfig()
let cookies: XueqiuCookies | undefined = cfg.cookies
const client = new XueqiuClient(cookies)

function hasAuth() {
  return !!(cookies && cookies.xq_a_token)
}

// 无需额外脱敏；日志不打印结构化内容，此处删除未使用的辅助。

const mcp = new McpServer({ name: 'xueqiu-mcp', version: '0.1.0' }, {})

mcp.registerTool(
  'ping',
  { description: '健康检查与鉴权状态', inputSchema: pingInput, outputSchema: pingOutput },
  async () => ({ content: [{ type: 'text', text: `ok auth=${hasAuth()}` }], structuredContent: { status: 'ok', auth: hasAuth() } })
)

mcp.registerTool(
  'updateCookies',
  { description: '更新雪球 Cookie（仅内存）', inputSchema: updateCookiesInput, outputSchema: updateCookiesOutput },
  async (args: any) => {
    const handler = createUpdateCookiesTool((c) => {
      cookies = c
      client.updateCookies(c)
    })
    const result = await handler(args)
    return { content: [{ type: 'text', text: `updated=${result.updated}` }], structuredContent: result }
  }
)

// 统一工具注册，保持单一样板

registerStructuredTool(mcp, 'getRealtimeQuotes', '获取实时行情', getRealtimeQuotesInput, getRealtimeQuotesOutput, async (args) => {
  const handler = createGetRealtimeQuotesTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getKline', '获取 K 线数据', getKlineInput, getKlineOutput, async (args) => {
  const handler = createGetKlineTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'searchSymbols', '搜索标的', searchSymbolsInput, searchSymbolsOutput, async (args) => {
  const handler = createSearchSymbolsTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getWatchlist', '获取自选列表', getWatchlistInput, getWatchlistOutput, async (args) => {
  const handler = createGetWatchlistTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getMinuteTimeline', '获取分钟/分时数据', getMinuteTimelineInput, getMinuteTimelineOutput, async (args) => {
  const handler = createGetMinuteTimelineTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getCapitalAssort', '获取资金成交分布', getCapitalAssortInput, getCapitalAssortOutput, async (args) => {
  const handler = createGetCapitalAssortTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getQuoteSnapshot', '获取行情快照详情', getQuoteSnapshotInput, getQuoteSnapshotOutput, async (args) => {
  const handler = createGetQuoteSnapshotTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'getCubeInfo', '获取组合信息', getCubeInfoInput, getCubeInfoOutput, async (args) => {
  const handler = createGetCubeInfoTool(client)
  return handler(args)
})

const transport = new StdioServerTransport()
await mcp.connect(transport)
registerStructuredTool(mcp, 'quotec', '获取某支股票的行情数据', quotecInput, quotecOutput, async (args) => {
  const handler = createQuotecTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'quote_detail', '获取某支股票的行情数据-详细', quoteDetailInput, quoteDetailOutput, async (args) => {
  const handler = createQuoteDetailTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'suggest_stock', '关键词搜索股票代码', suggestStockInput, suggestStockOutput, async (args) => {
  const handler = createSuggestStockTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'pankou', '获取盘口明细', pankouInput, pankouOutput, async (args) => {
  const handler = createPankouTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'capital_margin', '融资融券数据', capitalPagedInput, capitalOutput, async (args) => {
  const handler = createCapitalMarginTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'capital_blocktrans', '大宗交易', capitalPagedInput, capitalOutput, async (args) => {
  const handler = createCapitalBlocktransTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'capital_flow', '资金流向', capitalSymbolInput, capitalOutput, async (args) => {
  const handler = createCapitalFlowTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'capital_history', '资金历史', capitalSymbolInput, capitalOutput, async (args) => {
  const handler = createCapitalHistoryTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_cash_flow', '现金流', financeBaseInput, financeOutput, async (args) => {
  const handler = createCashFlowTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_cash_flow_v2', '现金流（区域/类型可配）', financeV2Input, financeOutput, async (args) => {
  const handler = createCashFlowV2Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_indicator', '指标汇总', financeBaseInput, financeOutput, async (args) => {
  const handler = createIndicatorTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_indicator_v2', '指标汇总（区域/类型可配）', financeV2Input, financeOutput, async (args) => {
  const handler = createIndicatorV2Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_balance', '资产负债表', financeBaseInput, financeOutput, async (args) => {
  const handler = createBalanceTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_balance_v2', '资产负债表（区域/类型可配）', financeV2Input, financeOutput, async (args) => {
  const handler = createBalanceV2Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_income', '利润表', financeBaseInput, financeOutput, async (args) => {
  const handler = createIncomeTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_income_v2', '利润表（区域/类型可配）', financeV2Input, financeOutput, async (args) => {
  const handler = createIncomeV2Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'finance_business', '经营分析', financeBaseInput, financeOutput, async (args) => {
  const handler = createBusinessTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'report_latest', '最新研报', reportInput, reportOutput, async (args) => {
  const handler = createReportTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'report_earningforecast', '业绩预告', reportInput, reportOutput, async (args) => {
  const handler = createEarningForecastTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_skholderchg', '股东人数变动', f10SymbolInput, f10Output, async (args) => {
  const handler = createSkholderchgTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_skholder', '股东信息', f10SymbolInput, f10Output, async (args) => {
  const handler = createSkholderTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_industry', '行业分类', f10SymbolInput, f10Output, async (args) => {
  const handler = createIndustryTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_holders', '持股变动', f10SymbolInput, f10Output, async (args) => {
  const handler = createHoldersTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_bonus', '分红送转', f10BonusInput, f10Output, async (args) => {
  const handler = createBonusTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_org_holding_change', '机构持股变动', f10SymbolInput, f10Output, async (args) => {
  const handler = createOrgHoldingChangeTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_industry_compare', '同行业比较', f10SymbolInput, f10Output, async (args) => {
  const handler = createIndustryCompareTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_business_analysis', '业务分析', f10SymbolInput, f10Output, async (args) => {
  const handler = createBusinessAnalysisTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_shareschg', '股本变动', f10SharesschgInput, f10Output, async (args) => {
  const handler = createSharesschgTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_top_holders', '前十大股东', f10TopHoldersInput, f10Output, async (args) => {
  const handler = createTopHoldersTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'f10_main_indicator', '主要指标', f10SymbolInput, f10Output, async (args) => {
  const handler = createMainIndicatorTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'watch_list', '系统自选列表', watchListInput, watchListOutput, async () => {
  const handler = createWatchListTool(client)
  return handler()
})

registerStructuredTool(mcp, 'watch_stock', '指定自选 PID 下股票列表', watchStockInput, watchStockOutput, async (args) => {
  const handler = createWatchStockTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'cube_nav_daily', '组合净值曲线', cubeSymbolInput, cubeOutput, async (args) => {
  const handler = createCubeNavDailyTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'cube_rebalancing_history', '组合调仓历史', cubeHistoryInput, cubeOutput, async (args) => {
  const handler = createCubeRebalancingHistoryTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'cube_rebalancing_current', '组合当前持仓', cubeSymbolInput, cubeOutput, async (args) => {
  const handler = createCubeRebalancingCurrentTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'cube_quote_current', '组合实时估值', cubeSymbolInput, cubeOutput, async (args) => {
  const handler = createCubeQuoteCurrentTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'convertible_bond', '东财可转债列表', convertibleBondInput, convertibleBondOutput, async (args) => {
  const handler = createConvertibleBondTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_basic_info', '中证指数基础信息', indexInput, indexOutput, async (args) => {
  const handler = createIndexBasicInfoTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_details_data', '中证指数详情', indexInput, indexOutput, async (args) => {
  const handler = createIndexDetailsDataTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_weight_top10', '指数前十大权重', indexInput, indexOutput, async (args) => {
  const handler = createIndexWeightTop10Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_perf_7', '指数近7日表现', indexInput, indexOutput, async (args) => {
  const handler = createIndexPerf7Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_perf_30', '指数近30日表现', indexInput, indexOutput, async (args) => {
  const handler = createIndexPerf30Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'index_perf_90', '指数近90日表现', indexInput, indexOutput, async (args) => {
  const handler = createIndexPerf90Tool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'hkex_northbound', '港交所北向持股明细', hkexInput, hkexOutput, async (args) => {
  const handler = createHkexTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_detail', '基金详情', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundDetailTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_info', '基金信息', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundInfoTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_growth', '基金增长曲线', fundGrowthInput, fundOutput, async (args) => {
  const handler = createFundGrowthTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_nav_history', '基金净值历史', fundNavHistoryInput, fundOutput, async (args) => {
  const handler = createFundNavHistoryTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_achievement', '基金业绩', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundAchievementTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_asset', '基金持仓资产', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundAssetTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_manager', '基金经理', fundManagerInput, fundOutput, async (args) => {
  const handler = createFundManagerTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_trade_date', '基金交易日', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundTradeDateTool(client)
  return handler(args)
})

registerStructuredTool(mcp, 'fund_derived', '基金衍生数据', fundCodeInput, fundOutput, async (args) => {
  const handler = createFundDerivedTool(client)
  return handler(args)
})
