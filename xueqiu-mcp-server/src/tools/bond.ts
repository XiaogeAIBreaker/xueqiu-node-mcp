import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const convertibleBondInput = z.object({ page_size: z.number(), page_number: z.number() })
export const convertibleBondOutput = z.object({ raw: z.any() })

export function createConvertibleBondTool(client: XueqiuClient) {
  return async (args: any) => {
    const { page_size, page_number } = args
    const raw = await client.convertibleBond(page_size, page_number)
    return { raw }
  }
}

