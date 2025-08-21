import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function DevProbe() {
  const [status, setStatus] = useState<'idle'|'ok'|'fail'>('idle');
  const [message, setMessage] = useState<string>('');

  async function ping() {
    try {
      // Hit a known GET endpoint. If your server exposes /api/health, keep '/health' here.
      const res = await api.get('/health');
      setStatus('ok');
      setMessage(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setStatus('fail');
      setMessage(JSON.stringify({
        msg: e?.message,
        baseURL: e?.config?.baseURL,
        url: e?.config?.url,
        status: e?.response?.status,
        data: e?.response?.data,
      }, null, 2));
    }
  }

  useEffect(() => { ping(); }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dev Probe</h1>
      <p>API base: <code>{String(api.defaults.baseURL ?? '')}</code></p>
      <p>Status: <strong>{status}</strong></p>
      <pre style={{ background: '#eee', padding: 12, overflowX: 'auto' }}>{message}</pre>
      <button onClick={ping}>Retry</button>
    </div>
  );
}
