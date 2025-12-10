import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const fundCodeInput = z.object({ fund_code: z.string() })
export const fundGrowthInput = z.object({ fund_code: z.string(), day: z.string().optional() })
export const fundNavHistoryInput = z.object({ fund_code: z.string(), page: z.number().optional(), size: z.number().optional() })
export const fundManagerInput = z.object({ fund_code: z.string(), post_status: z.number().optional() })
export const fundOutput = z.object({ raw: z.any() })

export function createFundDetailTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundDetail(String(args.fund_code)) })
}

export function createFundInfoTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundInfo(String(args.fund_code)) })
}

export function createFundGrowthTool(client: XueqiuClient) {
  return async (args: any) => {
    const { fund_code, day = 'ty' } = args
    return { raw: await client.fundGrowth(fund_code, day) }
  }
}

export function createFundNavHistoryTool(client: XueqiuClient) {
  return async (args: any) => {
    const { fund_code, page = 1, size = 10 } = args
    return { raw: await client.fundNavHistory(fund_code, page, size) }
  }
}

export function createFundAchievementTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundAchievement(String(args.fund_code)) })
}

export function createFundAssetTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundAsset(String(args.fund_code)) })
}

export function createFundManagerTool(client: XueqiuClient) {
  return async (args: any) => {
    const { fund_code, post_status = 1 } = args
    return { raw: await client.fundManager(fund_code, post_status) }
  }
}

export function createFundTradeDateTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundTradeDate(String(args.fund_code)) })
}

export function createFundDerivedTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.fundDerived(String(args.fund_code)) })
}

