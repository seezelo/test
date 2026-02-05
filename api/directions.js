export default async function handler(req, res) {
  try {
    /***********************
     * ⚠️ 테스트용 하드코딩 키
     ***********************/
    const keyId = "8vgpjrgiyy";
    const secret = "R9xfzjMz2isJRQAQqv4xVWU6Rf0oyD9NQGJXjja1";

    const { start, goal, waypoints = "" } = req.query;

    if (!start || !goal) {
      return res.status(400).json({
        error: "start and goal required",
        example:
          "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    const params = new URLSearchParams({
      start,
      goal,
      option: "trafast"
    });

    if (waypoints) params.append("waypoints", waypoints);

    const url =
      "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?" +
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
        error: "NAVER returned non-JSON",
        raw: text.slice(0, 300)
      });
    }

    return res.status(upstream.status).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      message: err.message
    });
  }
}
