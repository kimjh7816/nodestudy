const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`${req.method}${req.url}`);

  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("메인 페이지입니다");
  } else if (req.url === "/posts" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify([{ id: 1, title: "첫 글" }]));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("페이지를 찾을 수 없습니다");
  }
});

server.listen(3000, () => {
  console.log("http://localhost:3000 에서 실행 중");
});