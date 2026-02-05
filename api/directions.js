export default async function handler(req, res) {
  try {
    const { start, goal, waypoints, option } = req.query;

    if (!start || !goal) {
      return res.status(400).json({
        ok: false,
        step: "param-check",
        error: "start and goal required",
        example: "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    const url = new URL("https://naveropenapi.apigw.ntruss.com/map-direction15/v1/driving");

    url.searchParams.set("start", start);
    url.searchParams.set("goal", goal);
    url.searchParams.set("option", option || "trafast");

    if (waypoints) {
      url.searchParams.set("waypoints", waypoints);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NCP_KEY_ID,
        "X-NCP-APIGW-API-KEY": process.env.NCP_SECRET
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        step: "upstream-response",
        upstream: {
          status: response.status,
          statusText: response.statusText,
          url: url.toString()
        },
        raw_head: text.slice(0, 300)
      });
    }

    const data = JSON.parse(text);

    return res.status(200).json({
      ok: true,
      route: data.route || data
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      step: "server-crash",
      error: err.message
    });
  }
}
