import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const f10SymbolInput = z.object({ symbol: z.string() })
export const f10BonusInput = z.object({ symbol: z.string(), page: z.number().optional(), size: z.number().optional() })
export const f10SharesschgInput = z.object({ symbol: z.string(), count: z.number().optional() })
export const f10TopHoldersInput = z.object({ symbol: z.string(), circula: z.number().optional() })
export const f10Output = z.object({ raw: z.any() })

export function createSkholderchgTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10Skholderchg(String(args.symbol)) })
}

export function createSkholderTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10Skholder(String(args.symbol)) })
}

export function createIndustryTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10Industry(String(args.symbol)) })
}

export function createHoldersTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10Holders(String(args.symbol)) })
}

export function createBonusTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, page = 1, size = 10 } = args
    return { raw: await client.f10Bonus(symbol, page, size) }
  }
}

export function createOrgHoldingChangeTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10OrgHoldingChange(String(args.symbol)) })
}

export function createIndustryCompareTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10IndustryCompare(String(args.symbol)) })
}

export function createBusinessAnalysisTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10BusinessAnalysis(String(args.symbol)) })
}

export function createSharesschgTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 5 } = args
    return { raw: await client.f10Sharesschg(symbol, count) }
  }
}

export function createTopHoldersTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, circula = 1 } = args
    return { raw: await client.f10TopHolders(symbol, circula) }
  }
}

export function createMainIndicatorTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.f10MainIndicator(String(args.symbol)) })
}

