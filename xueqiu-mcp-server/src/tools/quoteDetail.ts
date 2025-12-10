import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'
import { processData } from '../core/process.js'

export const quoteDetailInput = z.object({ symbol: z.string() })
export const quoteDetailOutput = z.object({ raw: z.any() })

export function createQuoteDetailTool(client: XueqiuClient) {
  return async (args: any) => {
    const symbol = String(args?.symbol)
    const raw = await client.quoteSnapshot([symbol])
    return { raw: processData(raw) }
  }
}
