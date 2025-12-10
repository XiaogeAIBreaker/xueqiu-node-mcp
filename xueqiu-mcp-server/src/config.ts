export type XueqiuCookies = {
  xq_a_token: string
  xq_r_token?: string
  u?: string
  rawCookie?: string
}

export type AppConfig = {
  cookies?: XueqiuCookies
}

export function loadConfig(): AppConfig {
  const envCookies: XueqiuCookies | undefined = process.env.XQ_A_TOKEN
    ? {
        xq_a_token: process.env.XQ_A_TOKEN || '',
        xq_r_token: process.env.XQ_R_TOKEN || process.env.XQ_R || undefined,
        u: process.env.XQ_U || process.env.U || undefined,
        rawCookie: process.env.COOKIE_HEADER
      }
    : undefined
  return { cookies: envCookies }
}
