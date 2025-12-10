import { z } from 'zod'
import type { XueqiuCookies } from '../config.js'

/**
 * 更新 Cookie（仅内存持有）
 * 支持传入完整 cookieHeader 或结构化 { xq_a_token }。
 */

export const updateCookiesInput = z.object({
  cookieHeader: z.string().optional(),
  cookies: z
    .object({
      xq_a_token: z.string()
    })
    .optional()
})
export const updateCookiesOutput = z.object({ updated: z.boolean() })

export function createUpdateCookiesTool(apply: (c: XueqiuCookies | undefined) => void) {
  return async (args: any) => {
    let next: XueqiuCookies | undefined
    if (args?.cookieHeader) {
      const parts = String(args.cookieHeader)
        .split(';')
        .map((s) => s.trim())
      const map: Record<string, string> = {}
      for (const p of parts) {
        const [k, v] = p.split('=')
        if (k && v) map[k] = v
      }
      if (map['xq_a_token']) {
        next = { xq_a_token: map['xq_a_token'], rawCookie: args.cookieHeader }
      }
    }
    if (!next && args?.cookies) next = args.cookies as XueqiuCookies
    apply(next)
    return { updated: !!next }
  }
}
