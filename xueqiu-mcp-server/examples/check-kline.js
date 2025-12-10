import axios from 'axios'

async function main() {
  const a = process.env.XQ_A_TOKEN || ''
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Referer: 'https://xueqiu.com/',
    Origin: 'https://xueqiu.com',
    Cookie: `xq_a_token=${a}`
  }
  const symbol = 'SZ300827'
  const now = Date.now()
  const url = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${encodeURIComponent(symbol)}&period=1d&begin=${now}&count=60&type=normal&indicator=kline,volume`
  const { data } = await axios.get(url, { headers })
  const items = data?.data?.items || []
  console.log('items_size:', data?.data?.items_size, 'last:', items[items.length - 1])
}

main().catch((e) => {
  console.error(e?.response?.status, e?.response?.data || e?.message)
  process.exit(1)
})
