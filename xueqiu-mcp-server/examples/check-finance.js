// 简单示例：读取财务与资金接口（需设置环境变量 XQ_A_TOKEN）
import { XueqiuClient } from '../dist/xueqiu/client.js'

const symbol = process.env.SYMBOL || 'SH600000'

async function main() {
  const client = new XueqiuClient({ xq_a_token: process.env.XQ_A_TOKEN || '', rawCookie: process.env.COOKIE_HEADER })
  const indicator = await client.financeIndicator(symbol, 0, 2)
  const income = await client.financeIncome(symbol, 0, 2)
  const capital = await client.capitalFlow(symbol)
  console.log('indicator items size:', indicator?.data?.items_size)
  console.log('income items size:', income?.data?.items_size)
  console.log('capital flow keys:', Object.keys(capital || {}))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

