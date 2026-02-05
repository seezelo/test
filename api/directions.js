export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const VERSION = "D15_ENV_FIX__2026-02-05__v1";

  try {
    // ✅ Vercel에 있는 변수명과 맞춤
    const keyId = process.env.NCP_KEY_ID;
    const secret = process.env.NCP_SECRET;

    if (!keyId || !secret) {
      return res.status(200).json({
        ok: false,
        version: VERSION,
        step: "env-check",
        error: "Missing env vars",
        got: { NCP_KEY_ID: !!keyId, NCP_SECRET: !!secret }
      });
    }

    const { start, goal, waypoints = "" } = req.query;

    if (!start || !goal) {
      return res.status(200).json({
        ok: false,
        version: VERSION,
        step: "param-check",
        error: "start and goal required",
        example:
          "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    const params = new URLSearchParams({ start, goal, option: "trafast" });
    if (waypoints) params.append("waypoints", waypoints);

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
      version: VERSION,
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
      version: VERSION,
      step: "crash",
      error: e?.message || String(e)
    });
  }
}
