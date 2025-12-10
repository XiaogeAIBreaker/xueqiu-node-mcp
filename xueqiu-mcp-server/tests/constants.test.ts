import { describe, expect, it } from 'vitest'
import { buildCookieHeader } from '../src/core/constants.js'

describe('buildCookieHeader', () => {
  it('returns undefined when missing token', () => {
    expect(buildCookieHeader({})).toBeUndefined()
  })

  it('concats tokens when provided', () => {
    const cookie = buildCookieHeader({ xq_a_token: 'a', xq_r_token: 'r', u: 'u' })
    expect(cookie).toContain('xq_a_token=a')
    expect(cookie).toContain('xq_r_token=r')
    expect(cookie).toContain('u=u')
  })
})

