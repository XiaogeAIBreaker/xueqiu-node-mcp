import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'
import { processData } from '../core/process.js'

export const suggestStockInput = z.object({ keyword: z.string(), count: z.number().optional() })
export const suggestStockOutput = z.object({ raw: z.any() })

export function createSuggestStockTool(client: XueqiuClient) {
  return async (args: any) => {
    const q = String(args?.keyword || '')
    const count = Number(args?.count || 10)
    const raw = await client.search(q, count)
    return { raw: processData(raw) }
  }
}
