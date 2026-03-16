export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.query.type === 'search') {
    const q = encodeURIComponent(req.query.query || '');
    const r = await fetch(`https://hermes.pyth.network/v2/price_feeds?query=${q}&asset_type=&page=0&limit=50`);
    const d = await r.json();
    return res.status(200).json({ success: true, feeds: d });
  }

  const FEED_IDS = [
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH
    '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL
    '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB
    '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', // USDC
    '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b', // USDT
    '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX
    '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221', // LINK
    '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744', // SUI
    '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819', // ATOM
    '0x6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b', // DOT
    '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b', // LTC
    '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5', // MATIC
    '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf', // OP
    '0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a791579a7433a9a9f5af2', // UNI
    '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5', // AAVE
    '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d', // ADA
    '0x67aed5a24fdaa045e4d679af0346e8ec4ea8523ab9e4b5ebcd9fb73a52d31fdb', // APT
    '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864', // ARB
    '0x8963217838ab4cf5cadc172203c1f0b763fbaa45f346d8ee50ba994bbcac3026', // TON
    '0x0781209c28fda797616212b7f94d77af3a01f3e94a5d421760aef020cf2bcb51', // TRX
    '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996', // NEAR
    '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1', // GBP
    '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30', // EUR
    '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52', // JPY
    '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2', // XAU
    '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e', // XAG
  ];

  const ts = req.query.ts;
  const params = FEED_IDS.map(id => `ids[]=${id}`).join('&');
  const url = ts
    ? `https://hermes.pyth.network/v2/updates/price/${ts}?${params}&parsed=true`
    : `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;

  try {
    res.setHeader('Cache-Control', ts ? 's-maxage=300' : 's-maxage=2,stale-while-revalidate=5');
    const r = await fetch(url, { headers: { 'User-Agent': 'PythLens/2.0' } });
    if (!r.ok) throw new Error(`Hermes ${r.status}`);
    const d = await r.json();
    return res.status(200).json({ success: true, source: 'pyth-hermes', timestamp: Date.now(), parsed: d.parsed });
  } catch(err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
