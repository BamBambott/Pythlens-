// api/prices.js — Vercel Serverless Function
// Proxies Pyth Hermes API to avoid browser CORS restrictions

export default async function handler(req, res) {
  // Allow all origins (needed for browser fetch)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const FEED_IDS = [
    // CRYPTO
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD
    '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL/USD
    '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB/USD
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', // USDC/USD
    '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP/USD
    '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a394849c23c30f4f5c3be4a5c3a', // DOGE/USD
    '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX/USD
    '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221', // LINK/USD
    '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52', // MATIC/USD
    '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf', // OP/USD
    '0x09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723', // ARB/USD
    // FX
    '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30', // EUR/USD
    '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1', // GBP/USD
    '0xef2c98c804ba503c6a707e38be4dfbb16683bab87caf4a1a0f191a7be010853', // USD/JPY
    '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80', // USD/CHF
    '0x7d17b9fe4ea7103be16b6836984fabbc889386d700ca5e5b3d34b7f92e449268', // AUD/USD
    // EQUITIES
    '0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688', // AAPL
    '0x42a7c7b08bdbe53fd1bae4be6bc6e741ba4e47e2a3cc0dbccc8b1285c34c1b5e', // TSLA
    '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5', // AMZN
    '0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1', // GOOGL
    '0xd2c2c1f2bba8e0964f9589e060c2ee97f5e19057267ac3284caef3bd50bd2cb5', // MSFT
    // COMMODITIES
    '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2', // XAU
    '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e', // XAG
    '0x89a93a5e221578f87e5379eee4de5e5a4fcc1b7b9ca5efa29f1ba7c070c0fd6c', // WTI
    '0x7f5cc8d963fc5b3d2ae41fe5685ada89fd4d9d0576cfd5c735ce3b7ccf5fea5a', // BRENT
    '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c', // ETH/BTC
    '0x8f218655050a1476b780185e89f19d2b1e1f49e9bd629efad6ac547a946bf6ab', // BNB/BTC
  ];

  const params = FEED_IDS.map(id => `ids[]=${id}`).join('&');
  const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PythLens/2.0' },
    });

    if (!response.ok) {
      throw new Error(`Hermes returned ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      source: 'pyth-hermes',
      timestamp: Date.now(),
      parsed: data.parsed,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
