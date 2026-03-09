export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  return Response.json({
    key_set: !!key,
    key_prefix: key ? key.slice(0, 10) + '...' : null,
    node_env: process.env.NODE_ENV,
  });
}
