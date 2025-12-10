import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const cubeSymbolInput = z.object({ cube_symbol: z.string() })
export const cubeHistoryInput = z.object({ cube_symbol: z.string(), count: z.number().optional(), page: z.number().optional() })
export const cubeOutput = z.object({ raw: z.any() })

export function createCubeNavDailyTool(client: XueqiuClient) {
  return async (args: any) => {
    const { cube_symbol } = args
    const raw = await client.cubeNavDaily(cube_symbol)
    return { raw }
  }
}

export function createCubeRebalancingHistoryTool(client: XueqiuClient) {
  return async (args: any) => {
    const { cube_symbol, count = 20, page = 1 } = args
    const raw = await client.cubeRebalancingHistory(cube_symbol, count, page)
    return { raw }
  }
}

export function createCubeRebalancingCurrentTool(client: XueqiuClient) {
  return async (args: any) => {
    const { cube_symbol } = args
    const raw = await client.cubeRebalancingCurrent(cube_symbol)
    return { raw }
  }
}

export function createCubeQuoteCurrentTool(client: XueqiuClient) {
  return async (args: any) => {
    const { cube_symbol } = args
    const raw = await client.cubeQuoteCurrent(cube_symbol)
    return { raw }
  }
}

