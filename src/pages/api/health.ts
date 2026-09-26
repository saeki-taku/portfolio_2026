import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = () => Response.json(
  { status: 'ok', service: 'ennui' },
  { headers: { 'Cache-Control': 'no-store' } },
);
