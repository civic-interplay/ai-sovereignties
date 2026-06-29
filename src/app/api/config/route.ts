// Runtime client config. The Mapbox token is served from the worker environment
// at runtime because build-time NEXT_PUBLIC_ inlining is unreliable on this
// Next + Turbopack + OpenNext stack. The token is a public (pk.) Mapbox
// publishable token and is restricted by URL in the Mapbox account.

export const dynamic = 'force-dynamic';

export async function GET() {
  const mapboxToken =
    process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  return Response.json(
    { mapboxToken },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
