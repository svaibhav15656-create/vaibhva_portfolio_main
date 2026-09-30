module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ error: 'Visit counter unavailable' });

  try {
    const command = req.method === 'POST' ? 'incr' : 'get';
    const response = await fetch(`${url.replace(/\/$/, '')}/${command}/portfolio%3Avisits`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Redis request failed');
    const payload = await response.json();
    if (payload.error) throw new Error('Redis command failed');
    const count = payload.result === null ? 0 : Number(payload.result);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid Redis count');
    return res.status(200).json({ count });
  } catch (_) {
    return res.status(500).json({ error: 'Visit counter unavailable' });
  }
};
