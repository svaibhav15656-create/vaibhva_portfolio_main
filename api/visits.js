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
    const key = 'portfolio%3Avisits';
    // Seed a new counter at the requested starting total. SET ... NX is atomic,
    // so simultaneous first visits cannot overwrite an established count.
    const seedResponse = await fetch(`${url.replace(/\/$/, '')}/set/${key}/126/NX`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    if (!seedResponse.ok) throw new Error('Redis request failed');
    const seeded = await seedResponse.json();
    if (seeded.error) throw new Error('Redis command failed');

    let count;
    if (req.method === 'POST' && seeded.result !== 'OK') {
      const response = await fetch(`${url.replace(/\/$/, '')}/incr/${key}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Redis request failed');
      const payload = await response.json();
      if (payload.error) throw new Error('Redis command failed');
      count = Number(payload.result);
      if (count < 126) {
        const resetResponse = await fetch(`${url.replace(/\/$/, '')}/set/${key}/126`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        if (!resetResponse.ok) throw new Error('Redis request failed');
        const reset = await resetResponse.json();
        if (reset.error) throw new Error('Redis command failed');
        count = 126;
      }
    } else if (seeded.result === 'OK') {
      count = 126;
    } else {
      const response = await fetch(`${url.replace(/\/$/, '')}/get/${key}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Redis request failed');
      const payload = await response.json();
      if (payload.error) throw new Error('Redis command failed');
      count = Number(payload.result);
      if (count < 126) {
        const resetResponse = await fetch(`${url.replace(/\/$/, '')}/set/${key}/126`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        if (!resetResponse.ok) throw new Error('Redis request failed');
        const reset = await resetResponse.json();
        if (reset.error) throw new Error('Redis command failed');
        count = 126;
      }
    }
    if (!Number.isSafeInteger(count) || count < 126) throw new Error('Invalid Redis count');
    return res.status(200).json({ count });
  } catch (_) {
    return res.status(500).json({ error: 'Visit counter unavailable' });
  }
};
