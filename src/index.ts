type Env = {
  ENV: string;
  // Add bindings here as you wire them up:
  // RYNE_KV: KVNamespace;
  // RYNE_DB: D1Database;
};

function json(data: unknown, init?: ResponseInit) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const headers = new Headers(init?.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  return new Response(body, { ...init, headers });
}

function notFound() {
  return json({ ok: false, error: 'Not Found' }, { status: 404 });
}

async function handleGenerateSchedule(req: Request, env: Env) {
  // Stub: echo body to prove POST works. Wire to your AI action later.
  const payload = await req.json().catch(() => ({}));
  return json({ ok: true, route: 'POST /schedule/generate', env: env.ENV, payload });
}

async function handleRequest(request: Request, env: Env, _ctx: ExecutionContext) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Basic routing
  if (request.method === 'GET' && pathname === '/health') {
    return json({ ok: true, service: 'ryne-api', env: env.ENV, now: Date.now() });
  }

  if (request.method === 'POST' && pathname === '/schedule/generate') {
    try {
      return await handleGenerateSchedule(request, env);
    } catch (err: any) {
      return json({ ok: false, error: err?.message ?? 'Internal Error' }, { status: 500 });
    }
  }

  // default (root) — keep your original behavior
  if (request.method === 'GET' && pathname === '/') {
    return json({ ok: true, service: 'ryne-api', ts: Date.now() });
  }

  return notFound();
}

export default { fetch: handleRequest };
