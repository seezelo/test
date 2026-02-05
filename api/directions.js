export default async function handler(req, res) {
  try {
    const keyId = process.env.NCP_KEY_ID;
    const secret = process.env.NCP_SECRET;

    if (!keyId || !secret) {
      return res.status(500).json({
        error: "Missing env vars",
        need: ["NCP_KEY_ID", "NCP_SECRET"],
        got: { NCP_KEY_ID: !!keyId, NCP_SECRET: !!secret }
      });
    }

    const { start, goal, waypoints = "" } = req.query;
    if (!start || !goal) {
      return res.status(400).json({
        error: "start and goal required",
        example: "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    const params = new URLSearchParams({
      start,
      goal,
      option: "trafast"
    });
    if (waypoints) params.append("waypoints", waypoints);

    // ✅ Directions 15 엔드포인트 (핵심 변경)
    const url =
      "https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving?" +
      params.toString();

    const upstream = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": secret
      }
    });

    const text = await upstream.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Upstream returned non-JSON",
        upstream_status: upstream.status,
        raw_head: text.slice(0, 300)
      });
    }

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server crashed", message: err.message });
  }
}
