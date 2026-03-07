export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const FEED_IDS = [
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD
    '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL/USD
    '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB/USD
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', // USDC/USD
    '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP/USD
    '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a394849c23c30f4f5c3be4a5c3a', // DOGE/USD
    '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX/USD
    '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221', // LINK/USD
    '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1', // GBP/USD
    '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2', // XAU/USD
    '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e',  // XAG/USD
    '0x89a93a5e221578f87e5379eee4de5e5a4fcc1b7b9ca5efa29f1ba7c070c0fd6c', // WTI/USD
  ];

  const params = FEED_IDS.map(id => `ids[]=${id}`).join('&');
  const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'PythLens/2.0' } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Hermes returned ${response.status}: ${text}`);
    }
    const data = await response.json();
    return res.status(200).json({ success: true, source: 'pyth-hermes', timestamp: Date.now(), parsed: data.parsed });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
