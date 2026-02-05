export default async function handler(req, res) {
  try {
    const keyId = process.env.NCP_KEY_ID;
    const secret = process.env.NCP_SECRET;

    if (!keyId || !secret) {
      return res.status(200).json({
        ok: false,
        step: "env-check",
        error: "Missing env vars",
        got: { NCP_KEY_ID: !!keyId, NCP_SECRET: !!secret }
      });
    }

    const { start, goal, waypoints = "" } = req.query;

    if (!start || !goal) {
      return res.status(200).json({
        ok: false,
        step: "param-check",
        error: "start and goal required",
        example:
          "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    const params = new URLSearchParams({ start, goal, option: "trafast" });
    if (waypoints) params.append("waypoints", waypoints);

    // ✅ Directions 15 엔드포인트 (핵심)
    const url =
      "https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving?" +
      params.toString();

    const upstream = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": secret
      }
    });

    const raw = await upstream.text();

    return res.status(200).json({
      ok: upstream.ok,
      step: "upstream-response",
      upstream: {
        status: upstream.status,
        statusText: upstream.statusText,
        url
      },
      raw_head: raw.slice(0, 600)
    });
  } catch (e) {
    return res.status(200).json({
      ok: false,
      step: "crash",
      error: e?.message || String(e)
    });
  }
}
