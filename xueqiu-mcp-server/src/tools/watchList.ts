import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const watchListInput = z.object({})
export const watchListOutput = z.object({ raw: z.any() })

export function createWatchListTool(client: XueqiuClient) {
  return async () => {
    const raw = await client.watchList()
    return { raw }
  }
}

