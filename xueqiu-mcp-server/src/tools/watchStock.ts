import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const watchStockInput = z.object({ pid: z.string() })
export const watchStockOutput = z.object({ raw: z.any() })

export function createWatchStockTool(client: XueqiuClient) {
  return async (args: any) => {
    const pid = String(args?.pid)
    const raw = await client.watchStock(pid)
    return { raw }
  }
}

