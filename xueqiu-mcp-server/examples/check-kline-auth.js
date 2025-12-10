import axios from 'axios'

async function main() {
  const a = process.env.XQ_A_TOKEN || ''
  const u = process.env.XUEQIU_U || ''
  const d = process.env.DEVICE_ID || ''
  const symbol = process.env.SYMBOL || 'SZ300827'
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Referer: `https://xueqiu.com/${symbol}`,
    Origin: 'https://xueqiu.com',
    Cookie: `xq_a_token=${a}; xq_r_token=${process.env.XQ_R_TOKEN || ''}; u=${u}; device_id=${d}`
  }

  const now = Date.now()

  const dayUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${encodeURIComponent(symbol)}&period=1d&begin=${now}&count=104&type=normal&indicator=kline,volume`
  const weekUrl = `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${encodeURIComponent(symbol)}&period=1w&begin=${now}&count=104&type=normal&indicator=kline,volume`

  const day = await axios.get(dayUrl, { headers }).then(r => r.data)
  const week = await axios.get(weekUrl, { headers }).then(r => r.data)

  const dayItems = day?.data?.items || []
  const weekItems = week?.data?.items || []
  console.log('[1d] items_size:', day?.data?.items_size, 'last:', dayItems[dayItems.length - 1])
  console.log('[1w] items_size:', week?.data?.items_size, 'last:', weekItems[weekItems.length - 1])
}

main().catch((e) => {
  console.error(e?.response?.status, e?.response?.data || e?.message)
  process.exit(1)
})
