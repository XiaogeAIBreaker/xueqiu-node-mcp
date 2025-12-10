import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const hkexInput = z.object({ exchange: z.enum(['sh', 'sz']), txt_date: z.string().optional() })
export const hkexOutput = z.object({ raw: z.any() })

export function createHkexTool(client: XueqiuClient) {
  return async (args: any) => {
    const { exchange, txt_date } = args
    const raw = await client.hkexNorthbound(exchange, txt_date)
    return { raw }
  }
}

