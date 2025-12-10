import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const reportInput = z.object({ symbol: z.string() })
export const reportOutput = z.object({ raw: z.any() })

export function createReportTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol } = args
    const raw = await client.reportLatest(symbol)
    return { raw }
  }
}

export function createEarningForecastTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol } = args
    const raw = await client.reportEarningForecast(symbol)
    return { raw }
  }
}

