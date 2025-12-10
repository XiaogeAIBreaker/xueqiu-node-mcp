export function convertTimestamps(data: any): any {
  if (Array.isArray(data)) return data.map(convertTimestamps)
  if (data && typeof data === 'object') {
    const out: any = {}
    for (const k of Object.keys(data)) {
      const v = (data as any)[k]
      if ((k === 'timestamp' || k.endsWith('_date')) && typeof v === 'number') {
        const isMs = v > 1000000000000
        const ts = isMs ? Math.floor(v / 1000) : v
        out[k] = new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19)
      } else {
        out[k] = convertTimestamps(v)
      }
    }
    return out
  }
  return data
}

export function processData(data: any): any {
  return convertTimestamps(data)
}
