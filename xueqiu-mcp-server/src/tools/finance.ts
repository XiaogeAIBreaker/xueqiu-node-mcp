import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const financeBaseInput = z.object({
  symbol: z.string(),
  is_annals: z.number().optional(),
  count: z.number().optional()
})

export const financeV2Input = z.object({
  symbol: z.string(),
  count: z.number().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
  is_detail: z.boolean().optional()
})

export const financeOutput = z.object({ raw: z.any() })

export function createCashFlowTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, is_annals = 0, count = 10 } = args
    const raw = await client.financeCashFlow(symbol, is_annals, count)
    return { raw }
  }
}

export function createCashFlowV2Tool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = args
    const raw = await client.financeCashFlowV2({ symbol, count, region, type, is_detail })
    return { raw }
  }
}

export function createIndicatorTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, is_annals = 0, count = 10 } = args
    const raw = await client.financeIndicator(symbol, is_annals, count)
    return { raw }
  }
}

export function createIndicatorV2Tool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = args
    const raw = await client.financeIndicatorV2({ symbol, count, region, type, is_detail })
    return { raw }
  }
}

export function createBalanceTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, is_annals = 0, count = 10 } = args
    const raw = await client.financeBalance(symbol, is_annals, count)
    return { raw }
  }
}

export function createBalanceV2Tool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = args
    const raw = await client.financeBalanceV2({ symbol, count, region, type, is_detail })
    return { raw }
  }
}

export function createIncomeTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, is_annals = 0, count = 10 } = args
    const raw = await client.financeIncome(symbol, is_annals, count)
    return { raw }
  }
}

export function createIncomeV2Tool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 10, region = 'cn', type = 'all', is_detail = true } = args
    const raw = await client.financeIncomeV2({ symbol, count, region, type, is_detail })
    return { raw }
  }
}

export function createBusinessTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, is_annals = 0, count = 10 } = args
    const raw = await client.financeBusiness(symbol, is_annals, count)
    return { raw }
  }
}

