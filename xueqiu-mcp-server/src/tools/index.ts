import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

export const indexInput = z.object({ symbols: z.string() })
export const indexOutput = z.object({ raw: z.any() })

export function createIndexBasicInfoTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexBasicInfo(String(args.symbols)) })
}

export function createIndexDetailsDataTool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexDetailsData(String(args.symbols)) })
}

export function createIndexWeightTop10Tool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexWeightTop10(String(args.symbols)) })
}

export function createIndexPerf7Tool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexPerf7(String(args.symbols)) })
}

export function createIndexPerf30Tool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexPerf30(String(args.symbols)) })
}

export function createIndexPerf90Tool(client: XueqiuClient) {
  return async (args: any) => ({ raw: await client.indexPerf90(String(args.symbols)) })
}

