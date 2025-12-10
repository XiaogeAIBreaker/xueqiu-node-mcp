import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const pankouInput = z.object({ symbol: z.string() })
export const pankouOutput = z.object({ raw: z.any() })

export function createPankouTool(client: XueqiuClient) {
  return async (args: any) => {
    const symbol = String(args?.symbol)
    const raw = await client.pankou(symbol)
    return { raw }
  }
}

