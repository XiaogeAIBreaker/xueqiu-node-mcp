/**
 * Node 18 默认没有全局 File；但有 Blob/FormData/fetch。
 * MCP SDK/undici 在加载时需要 globalThis.File 存在。
 * 这里用现有 Blob 简单构造 File 以满足类型断言即可。
 */
const g = globalThis as any

if (!g.Blob) {
  // Node 18 应该内置 Blob；若缺失，尝试从 buffer 获取。
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Blob } = require('buffer')
    g.Blob = Blob
  } catch {
    // no-op
  }
}

if (!g.File && g.Blob) {
  class File extends g.Blob {
    name: string
    lastModified: number
    constructor(fileBits: any[], name: string, options: any = {}) {
      super(fileBits, options)
      this.name = name
      this.lastModified = options.lastModified ?? Date.now()
    }
  }
  g.File = File
}

