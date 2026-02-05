export default async function handler(req, res) {
  try {
    const { start, goal, waypoints, option } = req.query;

    // 1. 필수 파라미터 체크
    if (!start || !goal) {
      return res.status(400).json({
        ok: false,
        step: "param-check",
        error: "start and goal required",
        example: "/api/directions?start=126.9780,37.5665&goal=127.0276,37.4979"
      });
    }

    // 2. API 엔드포인트 설정 (Directions 15 전용)
    // 주의: 주소 중간에 하이픈(-)이 없는 'map-direction15'가 맞습니다.
    //const baseUrl = "https://naveropenapi.apigw.ntruss.com/map-direction15/v1/driving";
    // 혹시 모르니 v1 앞에 하이픈이 들어간 버전을 시도해 보세요.
    const baseUrl = "https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving";

    // 3. URLSearchParams를 사용하여 쿼리 스트링 조립
    const params = new URLSearchParams();
    params.append("start", start);
    params.append("goal", goal);
    params.append("option", option || "trafast");

    if (waypoints) {
      params.append("waypoints", waypoints);
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // 4. API 호출
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NCP_KEY_ID,
        "X-NCP-APIGW-API-KEY": process.env.NCP_SECRET,
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    // 5. 에러 핸들링
    if (!response.ok) {
      console.error("NCP API Error:", text); // 서버 로그 확인용
      return res.status(response.status).json({
        ok: false,
        step: "upstream-response",
        upstream: {
          status: response.status,
          statusText: response.statusText,
          url: finalUrl
        },
        message: "네이버 API 호출에 실패했습니다.",
        raw_error: text
      });
    }

    const data = JSON.parse(text);

    // 6. 성공 응답
    return res.status(200).json({
      ok: true,
      route: data.route,
      message: data.message
    });

  } catch (err) {
    console.error("Server Crash:", err);
    return res.status(500).json({
      ok: false,
      step: "server-crash",
      error: err.message
    });
  }
}

