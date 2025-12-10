import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const capitalPagedInput = z.object({
  symbol: z.string(),
  page: z.number().optional(),
  size: z.number().optional()
})

export const capitalSymbolInput = z.object({
  symbol: z.string(),
  count: z.number().optional()
})

export const capitalOutput = z.object({ raw: z.any() })

export function createCapitalMarginTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, page = 1, size = 180 } = args
    const raw = await client.capitalMargin(symbol, page, size)
    return { raw }
  }
}

export function createCapitalBlocktransTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, page = 1, size = 30 } = args
    const raw = await client.capitalBlocktrans(symbol, page, size)
    return { raw }
  }
}

export function createCapitalFlowTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol } = args
    const raw = await client.capitalFlow(symbol)
    return { raw }
  }
}

export function createCapitalHistoryTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, count = 20 } = args
    const raw = await client.capitalHistory(symbol, count)
    return { raw }
  }
}

