import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'
import { processData } from '../core/process.js'

export const quotecInput = z.object({ symbol: z.string() })
export const quotecOutput = z.object({ raw: z.any() })

export function createQuotecTool(client: XueqiuClient) {
  return async (args: any) => {
    const symbol = String(args?.symbol)
    const raw = await client.realtimeQuotes([symbol])
    return { raw: processData(raw) }
  }
}
