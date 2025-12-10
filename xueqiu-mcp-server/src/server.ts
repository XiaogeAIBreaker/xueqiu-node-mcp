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
