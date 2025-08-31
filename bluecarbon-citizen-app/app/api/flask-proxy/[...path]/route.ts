// File: app/api/flask-proxy/[...path]/route.ts
// Catch-all proxy for Flask API

const FLASK_BASE = "http://localhost:5000";

export async function GET(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const url = `${FLASK_BASE}/${params.path.join("/")}${new URL(req.url).search}`;
  const res = await fetch(url, { method: "GET" });
  const data = await res.arrayBuffer();
  return new Response(data, { headers: res.headers });
}

export async function POST(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  console.log("Proxying POST request to:", params);
  const url = `${FLASK_BASE}/${params.path.join("/")}`;
  const res = await fetch(url, {
    method: "POST",
    headers: req.headers,
    body: req.body,
    duplex: "half",
  } as any);
  const data = await res.arrayBuffer();
  console.log("Response status:", res.status);
  return new Response(data, { headers: res.headers });
}
