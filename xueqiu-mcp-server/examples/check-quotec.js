import axios from 'axios'

async function main() {
  const a = process.env.XQ_A_TOKEN || ''
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Referer: 'https://xueqiu.com/',
    Origin: 'https://xueqiu.com',
    Cookie: `xq_a_token=${a}`
  }
  const symbol = process.env.SYMBOL || 'SZ000002'
  const url = `https://stock.xueqiu.com/v5/stock/realtime/quotec.json?symbol=${encodeURIComponent(symbol)}`
  const { data } = await axios.get(url, { headers })
  console.log(JSON.stringify(data, null, 2))
}

main().catch((e) => {
  console.error(e?.response?.status, e?.response?.data || e?.message)
  process.exit(1)
})
