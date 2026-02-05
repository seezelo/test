export default async function handler(req, res) {
  // ✅ 캐시 방지 (브라우저/엣지 캐시로 옛 응답 보는 것 차단)
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const VERSION = "D15_SWITCH__2026-02-05__v1"; // ✅ 이게 응답에 보이면 새 코드 반영된 것

  try {
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

    // ✅ 여기서 D15 엔드포인트로 강제
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
