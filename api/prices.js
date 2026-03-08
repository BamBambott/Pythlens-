export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, query, ts } = req.query;
  const rawIds = req.query['ids[]'];
  const ids = rawIds ? (Array.isArray(rawIds) ? rawIds : [rawIds]) : [];

  try {
    // Search feeds by name
    if (type === 'search') {
      const q = query ? encodeURIComponent(query) : '';
      const url = `https://hermes.pyth.network/v2/price_feeds?query=${q}&asset_type=&page=0&limit=50`;
      const r = await fetch(url, { headers: { 'User-Agent': 'PythLens/2.0' } });
      if (!r.ok) throw new Error(`Search failed: ${r.status}`);
      const data = await r.json();
      return res.status(200).json({ success: true, feeds: data });
    }

    if (ids.length === 0) return res.status(400).json({ success: false, error: 'No IDs' });

    const params = ids.map(id => `ids[]=${id}`).join('&');

    // Historical price (for 24h change)
    if (ts) {
      res.setHeader('Cache-Control', 's-maxage=300');
      const url = `https://hermes.pyth.network/v2/updates/price/${ts}?${params}&parsed=true`;
      const r = await fetch(url, { headers: { 'User-Agent': 'PythLens/2.0' } });
      if (!r.ok) { const t = await r.text(); throw new Error(`Hermes ${r.status}: ${t}`); }
      const data = await r.json();
      return res.status(200).json({ success: true, source: 'pyth-historical', parsed: data.parsed });
    }

    // Latest prices
    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;
    const r = await fetch(url, { headers: { 'User-Agent': 'PythLens/2.0' } });
    if (!r.ok) { const t = await r.text(); throw new Error(`Hermes ${r.status}: ${t}`); }
    const data = await r.json();
    return res.status(200).json({ success: true, source: 'pyth-hermes', timestamp: Date.now(), parsed: data.parsed });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
