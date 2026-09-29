# node4week

혼자 Node.js를 공부하면서 연습 코드와 주차별 과제를 모아 두는 저장소입니다.

## 실행 환경

- Node.js (CommonJS)
- 의존성 설치: `npm install`

| 패키지 | 용도 |
| --- | --- |
| `express` | 웹 서버 |
| `dayjs` | 날짜 처리 |
| `nodemon` | 파일 변경 시 자동 재시작 (개발용) |

2주차 게시판 API는 [board-api/](board-api/) 폴더에 별도 프로젝트로 있습니다. 의존성도 그 폴더에서 따로 설치합니다. 사용하는 패키지는 `express`, `cors`, `morgan`, `nodemon`입니다.

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| [practice.js](practice.js) | 화살표 함수, 기본 매개변수, 템플릿 리터럴 연습 |
| [memo.js](memo.js) | 1주차 과제: CLI 메모장 |
| `memos.json` | `memo.js`가 만드는 데이터 파일 (실행 시 자동 생성) |
| [raw-server.js](raw-server.js) | Express 없이 `http` 모듈만으로 만든 서버 (비교용) |
| [board-api/](board-api/) | 2주차 과제: Express 게시판 API |
| [test.http](test.http) | 게시판 API 테스트 요청 모음 (VS Code REST Client) |

## practice.js: 함수 기초 연습

```bash
node practice.js
```

- `circleArea(radius)`: 원의 넓이 계산
- `getGrade(score)`: 점수에 따라 A/B/C/F 등급 반환 (early return)
- `introduce(name, age, job = "무직")`: 기본 매개변수와 템플릿 리터럴로 자기소개 문장 만들기

## 1주차 과제: CLI 메모장 (memo.js)

터미널 명령어로 메모를 추가·조회·삭제·완료 처리하는 프로그램입니다.
데이터는 `memos.json`에 저장되므로 프로그램을 다시 실행해도 남아 있습니다.

### 사용법

```bash
node memo.js add "장보기"   # 메모 추가
node memo.js list          # 전체 목록 출력
node memo.js delete 1      # id가 1인 메모 삭제
node memo.js done 2        # id가 2인 메모를 완료 처리
```

출력 예시:

```
[1] ✅ 장보기
[2] ⬜ 운동하기
```

### 데이터 구조

```json
{ "id": 1, "text": "장보기", "done": false, "createdAt": "2026-09-28T10:12:08.146Z" }
```

- `id`는 마지막 메모의 id + 1로 자동 증가합니다. 중간 메모를 지워도 id를 다시 쓰지 않습니다.

### 함수 구성

| 함수 | 역할 |
| --- | --- |
| `loadMemos` | `memos.json` 읽기. 파일이 없으면(`ENOENT`) 빈 배열 반환 |
| `saveMemos` | 메모 배열을 JSON으로 저장 |
| `addMemo` | 새 메모 추가 |
| `listMemos` | 목록 출력. 비어 있으면 `메모가 없습니다` |
| `deleteMemo` | `findIndex`로 찾아 삭제. `-1`이면 `N번 메모를 찾을 수 없습니다` |
| `doneMemo` | `find`로 찾아 완료 처리. `undefined`면 같은 안내 출력 |
| `main` | 명령어를 읽어 해당 함수 호출. 모르는 명령어는 사용법 출력 |

### 이번 과제에서 배운 것

- **`fs.promises` + `async/await`**: 파일 입출력을 기다린 뒤 다음 코드를 실행합니다. `await`를 빠뜨리면 값 대신 `Promise { <pending> }`를 다루게 됩니다.
- **`try/catch`로 파일 없는 상황 처리**: 처음 실행할 때는 `memos.json`이 없으므로 `ENOENT` 오류를 잡아 빈 배열로 시작합니다. 다른 오류는 다시 던져서 `main().catch`에서 출력합니다.
- **`find` / `findIndex`**: 찾는 값이 없을 때 각각 `undefined`와 `-1`을 돌려주므로 따로 처리해야 합니다.
- **`process.argv`**: `process.argv.slice(2)`로 사용자가 입력한 명령어와 인자를 받습니다. 인자는 문자열이므로 id는 `Number()`로 바꿔서 비교합니다.

## raw-server.js: http 모듈로 만든 서버

```bash
node raw-server.js   # http://localhost:3000
```

Express 없이 `if (req.url === ... && req.method === ...)`로 직접 분기하고, `writeHead`로 상태 코드와 헤더를 적습니다. 응답 본문은 `JSON.stringify`로 직접 만듭니다. 경로가 늘어날수록 분기가 길어지는 것을 보고, Express의 라우팅과 `res.json()`이 왜 필요한지 비교하려고 만들었습니다.

## 2주차 과제: 게시판 API (board-api)

메모리(배열)에 저장하는 게시판 REST API입니다. 서버를 끄면 데이터가 초기화됩니다. 3주차에 저장소를 DB로 바꿀 예정입니다.

### 실행

```bash
cd board-api
npm install
npm run dev          # http://localhost:3000 (nodemon)
```

### 엔드포인트

| 메서드 | 경로 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| `GET` | `/posts` | 목록 조회 | 200 | 400 (잘못된 쿼리) |
| `GET` | `/posts/:id` | 단건 조회 | 200 | 404 |
| `POST` | `/posts` | 작성 | 201 | 400 |
| `PUT` | `/posts/:id` | 전체 수정 | 200 | 400, 404 |
| `PATCH` | `/posts/:id` | 부분 수정 | 200 | 400, 404 |
| `DELETE` | `/posts/:id` | 삭제 (댓글도 함께 삭제) | 204 | 404 |
| `GET` | `/posts/:postId/comments` | 댓글 목록 | 200 | 404 |
| `POST` | `/posts/:postId/comments` | 댓글 작성 | 201 | 400, 404 |
| `DELETE` | `/posts/:postId/comments/:commentId` | 댓글 삭제 | 204 | 404 |
| `GET` | `/users/me` | 미들웨어가 넣어준 `req.user` 확인 | 200 | |

목록 조회 쿼리:

| 쿼리 | 설명 | 기본값 |
| --- | --- | --- |
| `author` | 작성자가 일치하는 글만 | |
| `search` | 제목에 문자열이 포함된 글만 (`includes`) | |
| `sort` | `latest`(최신순) / `oldest`(오래된순) | `latest` |
| `page`, `limit` | 페이지네이션 (`slice`) | `1`, `10` |

```
GET /posts?author=철수&search=여행&sort=latest&page=1&limit=10
```

### 응답 형식

모든 응답을 `utils/response.js`의 `success` / `fail`로 만들어 형식을 통일했습니다. 삭제 성공(204)만 본문이 없습니다.

```json
// 성공 (목록)
{ "success": true, "page": 1, "limit": 10, "total": 3, "totalPages": 1, "data": [ ... ] }

// 성공 (단건)
{ "success": true, "data": { "id": 1, "title": "첫 글", ... } }

// 실패
{ "success": false, "message": "게시글을 찾을 수 없습니다" }
```

### 검증 규칙

- `title`, `content`가 없거나 빈 문자열이면 400
- `title`이 100자를 넘으면 400
- 없는 게시글·댓글이면 404. 없는 게시글에 댓글을 달거나 조회해도 404입니다.
- 다른 게시글의 댓글을 지우려 하면 404 (예: 1번 글의 댓글을 `/posts/2/comments/1`로 삭제)
- 깨진 JSON 본문은 400

### 폴더 구조

```
board-api/
├── index.js                  # 1. 전역 미들웨어 → 2. 라우트 → 3. 404 핸들러 → 4. 에러 핸들러
├── routes/
│   ├── posts.js              # 게시글 (목록 쿼리, 검증, PUT/PATCH)
│   ├── comments.js           # 댓글 (mergeParams로 :postId 사용)
│   └── users.js              # req.user 심기 실습
├── middlewares/
│   └── errorHandler.js       # 인자 4개짜리 에러 처리 미들웨어
├── data/
│   └── store.js              # 메모리 저장소 (3주차에 DB로 교체)
└── utils/
    └── response.js           # success / fail / httpError
```

라우터는 `data/store.js`의 함수만 호출하고 배열을 직접 다루지 않습니다. 그래서 3주차에는 `store.js`의 함수 안쪽만 DB 쿼리로 바꾸면 라우터를 그대로 쓸 수 있습니다.

### 테스트

VS Code REST Client로 [test.http](test.http)를 **1번부터 순서대로** 실행합니다. 모든 엔드포인트의 성공·실패 케이스 38개가 있고, 각 요청 제목에 기대 상태 코드(`→ 200` 등)를 적어두었습니다. 중간에 서버가 재시작되면 데이터가 초기화되므로 처음부터 다시 실행합니다.

### PUT과 PATCH의 차이

- **PUT**: 자원 전체를 보낸 내용으로 교체합니다. `title`, `content`가 모두 필수이고, `author`를 빼고 보내면 `"익명"`으로 바뀝니다.
- **PATCH**: 보낸 필드만 수정하고 나머지는 그대로 둡니다.

### 이번 과제에서 배운 것

- **`req.params` / `req.query` / `req.body`**: 특정 자원을 가리킬 때는 params(`/posts/1`), 목록을 거르거나 정렬할 때는 query(`?author=철수`), 보낼 데이터는 body를 씁니다. params와 query 값은 **항상 문자열**이라 `Number()`로 바꿔서 비교합니다.
- **`express.json()`**: 요청 본문(JSON 문자열)을 객체로 바꿔 `req.body`에 넣습니다. 이 미들웨어가 없으면 `req.body`가 `undefined`입니다.
- **미들웨어와 `next()`**: 미들웨어는 등록한 순서대로 실행됩니다. `next()`로 넘기거나 직접 응답해야 하고, 둘 다 안 하면 클라이언트는 응답을 받지 못하고 계속 기다립니다.
- **`req`에 값 심기**: `comments.js`의 `loadPost`가 게시글을 찾아 `req.post`에 넣어두고, 다음 핸들러가 꺼내 씁니다. 4주차 인증(`req.user`)에서 같은 패턴을 씁니다.
- **에러 핸들러**: 인자가 4개(`err, req, res, next`)인 미들웨어를 Express가 에러 처리기로 인식합니다. 라우트에서 `next(err)`를 호출하면 여기로 옵니다. 반드시 맨 마지막에 등록합니다.
- **`express.Router`와 `mergeParams`**: 라우터를 파일로 나누고 `index.js`에서 경로 접두사를 붙입니다. 상위 경로의 `:postId`를 라우터 안에서 읽으려면 `mergeParams: true`가 필요합니다.
- **상태 코드**: 생성 201, 삭제 204(본문 없음), 클라이언트가 잘못 보낸 요청 400, 없는 자원 404, 서버 오류 500. 4xx는 클라이언트 잘못, 5xx는 서버 잘못입니다.
- **삭제된 id는 재사용하지 않음**: `nextId++`로만 증가하므로 글을 지워도 번호가 다시 쓰이지 않습니다.

## 진행 기록

- [x] 함수 기초 연습 (`practice.js`)
- [x] 1주차: CLI 메모장
- [x] 2주차: Express 게시판 API
- [ ] 3주차
- [ ] 4주차
