export default async function handler(req, res) {
  const { start, goal, waypoints = "" } = req.query;

  const url =
    "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving" +
    `?start=${start}` +
    `&goal=${goal}` +
    (waypoints ? `&waypoints=${waypoints}` : "") +
    `&option=trafast`;

  const response = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": process.env."8vgpjrgiyy",
      "X-NCP-APIGW-API-KEY": process.env."R9xfzjMz2isJRQAQqv4xVWU6Rf0oyD9NQGJXjja1"
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
