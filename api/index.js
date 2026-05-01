/**
 * Vercel Serverless Proxy — CNJ/DJEN API
 * Região: gru1 (São Paulo, Brasil) — obrigatório para contornar geo-block da CloudFront do CNJ
 *
 * Deploy: https://vercel.com/new/clone?repository-url=https://github.com/wnevesadvocacia-cpu/djen-proxy
 * Após deploy, vá em Configurações → Integrações DJEN no WnevesBox e cole a URL do proxy.
 */

export const config = {
  runtime: 'edge',
  regions: ['gru1'], // São Paulo — CRÍTICO: CNJ bloqueia IPs fora do Brasil
};

const CNJ_BASE = 'https://comunicaapi.pje.jus.br';
const ALLOWED_PATHS = ['/api/v1/comunicacao'];

export default async function handler(request) {
  const url = new URL(request.url);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Valida path (whitelist de segurança)
  const pathname = url.pathname.replace(/^\/api\/proxy/, '') || '/';
  const isAllowed = ALLOWED_PATHS.some(p => pathname.startsWith(p));
  if (!isAllowed && pathname !== '/health') {
    return new Response(JSON.stringify({ error: 'Path not allowed', path: pathname }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Health check
  if (pathname === '/health') {
    return new Response(JSON.stringify({ ok: true, region: 'gru1', ts: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Forward para a API do CNJ com headers de navegador brasileiro
  const target = `${CNJ_BASE}${pathname}${url.search}`;

  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Referer': 'https://comunica.pje.jus.br/',
      'Origin': 'https://comunica.pje.jus.br',
      'Cache-Control': 'no-cache',
    },
  });

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Proxy-Region': 'gru1',
      'X-Upstream-Status': String(upstream.status),
    },
  });
}
