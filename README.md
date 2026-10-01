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

게시판 API는 [board-api/](board-api/) 폴더에 별도 프로젝트로 있습니다. 의존성도 그 폴더에서 따로 설치합니다. 사용하는 패키지는 `express`, `cors`, `morgan`, `dotenv`, `prisma`, `@prisma/client`, `@prisma/adapter-mariadb`, `nodemon`입니다. MySQL 8이 필요합니다.

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| [practice.js](practice.js) | 화살표 함수, 기본 매개변수, 템플릿 리터럴 연습 |
| [memo.js](memo.js) | 1주차 과제: CLI 메모장 |
| `memos.json` | `memo.js`가 만드는 데이터 파일 (실행 시 자동 생성) |
| [raw-server.js](raw-server.js) | Express 없이 `http` 모듈만으로 만든 서버 (비교용) |
| [board-api/](board-api/) | 2·3주차 과제: Express 게시판 API (MySQL + Prisma) |
| [test.http](test.http) | 게시판 API 테스트 요청 73개 (VS Code REST Client) |

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

## 게시판 API (board-api) — 2주차 과제 → 3주차 과제

2주차에 메모리(배열)로 만든 게시판 API를 3주차에 **MySQL + Prisma**로 옮겼습니다. 엔드포인트와 응답 형식은 유지하고 저장소만 바꾼 뒤, 댓글·좋아요·사용자 기능을 DB 관계로 추가했습니다.

| 주차 | 저장소 | 내용 |
| --- | --- | --- |
| 2주차 | 메모리 배열 (`data/store.js`, 현재 삭제됨) | 게시글 CRUD, 댓글, 목록 쿼리, 검증, 라우터 분리, 404·에러 핸들러 |
| 3주차 | MySQL + Prisma 7 | 사용자, 좋아요 토글, 태그(N:M), 관계 조회(include/select/_count), Cascade 삭제, Prisma 에러 변환 |

### 실행

MySQL이 켜져 있어야 합니다.

```bash
cd board-api
npm install
cp .env.example .env            # 값 채우기 (아래 환경변수 참고)
npx prisma migrate dev          # 마이그레이션 적용 (테이블 생성)
npx prisma generate             # Prisma Client 생성 → generated/prisma
npm run seed                    # 테스트용 초기 데이터 (기존 데이터는 모두 지워짐)
npm run dev                     # http://localhost:3000 — "MySQL 연결 성공"이 뜨면 준비 완료
```

| 스크립트 | 내용 |
| --- | --- |
| `npm run dev` | nodemon으로 서버 실행 (파일 저장 시 재시작) |
| `npm start` | node로 서버 실행 |
| `npm run seed` | 모든 테이블을 비우고 id를 1부터 다시 시작해 초기 데이터를 넣음 |

### 환경변수 (`.env`)

`.env`는 Git에 올리지 않고, 값을 비운 견본 `.env.example`만 올립니다.

| 변수 | 쓰는 곳 | 예시 |
| --- | --- | --- |
| `PORT` | 서버 포트 | `3000` |
| `DATABASE_URL` | Prisma CLI (마이그레이션) — `prisma.config.ts` | `mysql://root:비밀번호@localhost:3306/board` |
| `DATABASE_HOST` / `PORT` / `USER` / `PASSWORD` / `NAME` | Prisma Client (서버 실행) — `lib/prisma.js`의 MariaDB 어댑터 | `localhost` / `3306` / `root` / … / `board` |

비밀번호를 바꾸면 `DATABASE_URL`과 `DATABASE_PASSWORD` **두 곳 모두** 고쳐야 합니다.

### 엔드포인트

`authorId`, `userId`는 로그인이 없어서 임시로 요청 본문으로 받습니다. 4주차에 토큰으로 바꿀 예정입니다.

**사용자**

| 메서드 | 경로 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| `POST` | `/users` | 사용자 생성 (`username`, `email`, `bio`) | 201 | 400, 409 (중복) |
| `GET` | `/users` | 사용자 목록 + 글·댓글 수 | 200 | |
| `GET` | `/users/:id` | 프로필 (`postCount`, 최근 글 5개) | 200 | 400, 404 |
| `GET` | `/users/:id/posts` | 특정 사용자의 글 목록 (`/posts`와 같은 형식) | 200 | 400, 404 |
| `GET` | `/users/me` | 미들웨어가 넣어준 `req.user` 확인 (실습용) | 200 | |

**게시글**

| 메서드 | 경로 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| `GET` | `/posts` | 목록 (쿼리는 아래 표) | 200 | 400 |
| `GET` | `/posts/:id` | 단건 (작성자 + 댓글 + 댓글 작성자 + 개수) | 200 | 400, 404 |
| `POST` | `/posts` | 작성 (`title`, `content`, `authorId`, `tags`) | 201 | 400 |
| `PUT` | `/posts/:id` | 전체 수정 (`title`, `content` 필수, `tags` 안 보내면 비워짐) | 200 | 400, 404 |
| `PATCH` | `/posts/:id` | 부분 수정 (보낸 필드만, `tags`를 보내면 태그 교체) | 200 | 400, 404 |
| `DELETE` | `/posts/:id` | 삭제 (댓글·좋아요는 Cascade로 함께 삭제) | 204 | 400, 404 |
| `POST` | `/posts/:id/like` | 좋아요 토글 (`userId`) | 200 | 400, 404 |

**댓글**

| 메서드 | 경로 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| `GET` | `/posts/:id/comments` | 글의 댓글 목록 (오래된 순, 작성자 포함) | 200 | 400, 404 |
| `POST` | `/posts/:id/comments` | 댓글 작성 (`content`, `authorId`) | 201 | 400, 404 |
| `DELETE` | `/comments/:id` | 댓글 삭제 | 204 | 400, 404 |

**태그**

| 메서드 | 경로 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| `GET` | `/tags` | 태그 목록 + 태그별 글 수 (글 많은 순, 글이 없는 태그는 제외) | 200 | |

태그는 글 작성·수정 때 `"tags": ["여행", "제주"]`처럼 이름 배열로 보냅니다. 없는 태그는 새로 만들고 있는 태그는 연결만 합니다(`connectOrCreate`). 앞뒤 공백과 중복은 정리하고, 태그 하나는 30자, 글 하나에 10개까지입니다.

**목록 조회 쿼리** (`GET /posts`, `GET /users/:id/posts`)

| 쿼리 | 설명 | 기본값 |
| --- | --- | --- |
| `authorId` | 작성자 id로 필터 | |
| `author` | 작성자 username으로 필터 (관계 필드 조건) | |
| `tag` | 이 태그가 붙은 글만 (`tags: { some: { name } }`) | |
| `search` | 제목 **또는** 내용에 포함된 글 (`contains` → SQL `LIKE`) | |
| `sort` | `latest`(최신순) / `oldest`(오래된순) / `popular`(좋아요 많은 순) | `latest` |
| `page`, `limit` | 페이지네이션 (`skip` / `take`). `limit` 최대 50 | `1`, `10` |

`page=0`, `sort=abc`처럼 잘못된 값은 400 대신 기본값으로 처리합니다. 숫자가 아닌 `authorId`는 400입니다.

### 응답 형식

`utils/response.js`의 `success` / `fail`로 형식을 통일했습니다. 삭제 성공(204)만 본문이 없습니다.

```json
// 목록 — 각 글에 작성자(id, username만), 좋아요 수, 댓글 수, 내가 눌렀는지
{
  "success": true, "page": 1, "limit": 10, "total": 3, "totalPages": 1,
  "data": [
    {
      "id": 3, "title": "제주도 여행 후기", "content": "날씨가 좋았어요", "authorId": 1,
      "createdAt": "...", "updatedAt": "...",
      "author": { "id": 1, "username": "철수" },
      "tags": ["여행", "제주"],
      "likeCount": 1, "commentCount": 0, "isLiked": true
    }
  ]
}

// 좋아요 토글
{ "success": true, "data": { "liked": true, "likeCount": 1 } }

// 실패
{ "success": false, "message": "게시글을 찾을 수 없습니다" }
```

- 작성자는 `select`로 `id`, `username`만 가져옵니다. **이메일은 사용자 생성 응답 외에는 노출하지 않습니다.**
- `isLiked`는 지금 "철수(id 1)가 눌렀는지" 기준입니다 (`utils/postList.js`의 `CURRENT_USER_ID`). 4주차에 로그인한 사용자로 바꿉니다.

### 에러 처리

라우트는 모두 `try/catch`로 감싸 `next(err)`로 넘기고, `middlewares/errorHandler.js`가 상태 코드로 바꿉니다.

| 상황 | 원인 | 응답 |
| --- | --- | --- |
| 필수 값 누락, 글자 수 초과, 깨진 JSON | 라우트 검증 / `express.json()` | 400 |
| 숫자가 아닌 id (`/posts/abc`) | `utils/parseId.js` | 400 |
| `findUnique` 결과가 `null` | 라우트에서 직접 확인 | 404 |
| `update` / `delete` 대상 없음 | Prisma `P2025` | 404 |
| UNIQUE 위반 (username, email 중복) | Prisma `P2002` | 409 |
| 외래 키 위반 (없는 `authorId`, `userId`) | Prisma `P2003` | 400 |
| 형식이 맞지 않는 데이터 | `PrismaClientValidationError` | 400 |
| 그 밖의 오류 | | 500 (서버 로그에 출력) |

검증 규칙: 제목 100자, 댓글 500자, username 20자, bio 150자, email 형식, 태그 30자·글당 10개.

### 데이터 모델 (`prisma/schema.prisma`)

| 모델 | 필드 | 관계 |
| --- | --- | --- |
| `User` | `id`, `username`(고유, 20자), `email`(고유), `bio`(150자), `createdAt`, `updatedAt` | 글·댓글·좋아요 1:N |
| `Post` | `id`, `title`(100자), `content`(Text), `authorId`, `createdAt`, `updatedAt` | User N:1, 댓글·좋아요 1:N, 태그 N:M |
| `Comment` | `id`, `content`(500자), `postId`, `authorId`, `createdAt` | Post·User N:1, `@@index([postId])` |
| `Like` | `userId` + `postId` 복합 키 (`@@id`), `createdAt` | User·Post N:M 중간 테이블 |
| `Tag` | `id`, `name`(고유, 30자) | Post 암시적 N:M — 중간 테이블 `_PostToTag`를 Prisma가 자동으로 만듦 |

- 모든 관계에 `onDelete: Cascade`가 걸려 있어, 글을 지우면 댓글·좋아요도 DB가 지웁니다.
- 좋아요 수는 숫자 칸으로 따로 두지 않고 `Like` 행 개수를 셉니다. 숫자와 실제 좋아요가 어긋날 일이 없습니다.
- 마이그레이션: `init` → `add_comment` → `add_likes` → `add_tags` (`prisma/migrations/`, Git에 올림)

### 폴더 구조

```
board-api/
├── index.js                  # dotenv → 전역 미들웨어 → 라우트 → 404 → 에러 핸들러, 시작 시 DB 연결 확인
├── .env                      # Git에 올리지 않음
├── .env.example
├── prisma.config.ts          # Prisma CLI 설정 (DATABASE_URL, 마이그레이션 경로)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/           # Git에 올림
│   └── seed.js               # npm run seed
├── generated/prisma/         # Prisma Client (Git에 올리지 않음, npx prisma generate로 생성)
├── lib/
│   └── prisma.js             # PrismaClient 하나만 만들어 공유 (MariaDB 어댑터, SQL 로그)
├── routes/
│   ├── users.js
│   ├── posts.js
│   ├── comments.js           # /posts/:id/comments, /comments/:id
│   └── tags.js
├── middlewares/
│   └── errorHandler.js       # Prisma 에러 코드 → HTTP 상태 코드
└── utils/
    ├── parseId.js            # 문자열 id → 1 이상의 정수, 아니면 400
    ├── postList.js           # 목록 공통: 정렬·페이지·include·응답 다듬기 (태그는 이름 배열로)
    └── response.js           # success / fail / httpError
```

### 테스트

1. `npm run seed`로 DB를 초기화합니다. 모든 id가 1부터 다시 시작하므로 test.http의 id가 맞습니다.
   - 사용자 1 철수, 2 영희, 3 민수
   - 게시글 1 "첫 글"(철수), 2 "두 번째"(영희), 3 "제주도 여행 후기"(철수)
   - 댓글 2개(1번 글), 좋아요 3개(1번 글 ← 영희·민수, 3번 글 ← 철수)
   - 태그: 1번 글 [일상], 3번 글 [여행, 제주]
2. `npm run dev`로 서버를 켭니다.
3. VS Code REST Client로 [test.http](test.http)를 **1번부터 순서대로** 실행합니다. 모든 엔드포인트의 성공·실패 케이스 73개가 있고, 각 요청 제목에 기대 상태 코드(`→ 200` 등)를 적어두었습니다.

데이터를 눈으로 확인할 때는 `npx prisma studio`를 씁니다. 글을 삭제한 뒤 Comment 테이블을 새로고침하면 Cascade로 댓글이 사라진 것을 볼 수 있습니다.

### PUT과 PATCH의 차이

- **PUT**: 수정 가능한 필드(`title`, `content`, `tags`) 전체를 교체합니다. `title`, `content`는 필수이고, `tags`를 안 보내면 태그가 모두 떼어집니다.
- **PATCH**: 보낸 필드만 수정합니다. Prisma는 `data`에서 `undefined`인 필드를 무시하므로 `{ title, content }`를 그대로 넘겨도 보낸 것만 바뀝니다.

### 2주차에서 배운 것

- **`req.params` / `req.query` / `req.body`**: 특정 자원을 가리킬 때는 params(`/posts/1`), 목록을 거르거나 정렬할 때는 query(`?author=철수`), 보낼 데이터는 body를 씁니다. params와 query 값은 **항상 문자열**이라 숫자로 바꿔서 씁니다.
- **`express.json()`**: 요청 본문(JSON 문자열)을 객체로 바꿔 `req.body`에 넣습니다. 이 미들웨어가 없으면 `req.body`가 `undefined`입니다.
- **미들웨어와 `next()`**: 미들웨어는 등록한 순서대로 실행됩니다. `next()`로 넘기거나 직접 응답해야 하고, 둘 다 안 하면 클라이언트는 응답을 받지 못하고 계속 기다립니다.
- **`req`에 값 심기**: `comments.js`의 `loadPost`가 글을 확인해 `req.postId`에 넣어두고, 다음 핸들러가 꺼내 씁니다. 4주차 인증(`req.user`)에서 같은 패턴을 씁니다.
- **에러 핸들러**: 인자가 4개(`err, req, res, next`)인 미들웨어를 Express가 에러 처리기로 인식합니다. 라우트에서 `next(err)`를 호출하면 여기로 옵니다. 반드시 맨 마지막에 등록합니다.
- **`express.Router`**: 라우터를 파일로 나누고 `index.js`에서 경로 접두사를 붙입니다. 상위 경로의 파라미터를 라우터 안에서 읽으려면 `mergeParams: true`가 필요합니다.
- **상태 코드**: 생성 201, 삭제 204(본문 없음), 클라이언트가 잘못 보낸 요청 400, 없는 자원 404, 중복 409, 서버 오류 500. 4xx는 클라이언트 잘못, 5xx는 서버 잘못입니다.
- **삭제된 id는 재사용하지 않음**: 배열의 `nextId++`도, MySQL의 `AUTO_INCREMENT`도 늘어나기만 합니다.

### 3주차에서 배운 것

- **`.env`와 dotenv**: DB 접속 정보는 코드가 아니라 `.env`에 두고 Git에 올리지 않습니다. `require("dotenv").config()`는 `lib/prisma`보다 **먼저** 실행돼야 어댑터가 환경변수를 읽을 수 있습니다.
- **마이그레이션**: 스키마를 바꿀 때마다 `migrate dev`(DB에 반영 + 마이그레이션 파일 생성)와 `generate`(Client 코드 갱신)를 실행합니다. 마이그레이션 폴더는 Git에 올려서 다른 사람도 같은 테이블을 만들 수 있게 합니다.
- **관계 필드는 양쪽에**: `Comment.post`를 만들면 `Post.comments`도 있어야 합니다. `Comment[]` 같은 필드는 DB에 칸이 생기지 않고, Prisma 코드에서 관계를 따라가기 위한 연결 고리입니다.
- **`findUnique`는 `null`, `update`/`delete`는 에러**: 못 찾았을 때의 동작이 달라서 각각 `if (!post)` 확인과 `P2025` → 404 변환이 필요합니다.
- **`req.body`를 통째로 넘기지 않기**: `prisma.post.create({ data: req.body })`는 클라이언트가 `id` 같은 필드를 마음대로 넣을 수 있어서 위험합니다. 필요한 필드만 꺼내 씁니다.
- **`include` vs `select`**: `include`는 기본 필드 전부 + 관계, `select`는 지정한 것만 가져옵니다. 관계 안에서도 `select`로 이메일 같은 필드가 나가지 않게 막습니다.
- **`_count`**: 목록 전체가 아니라 개수만 필요할 때 씁니다. SQL의 `LEFT JOIN … GROUP BY … COUNT`를 한 줄로 대신합니다.
- **암시적 N:M (태그)**: `Post.tags Tag[]` / `Tag.posts Post[]`만 적으면 Prisma가 중간 테이블을 만들어 줍니다. 좋아요처럼 중간 테이블에 `createdAt` 같은 추가 정보가 필요하면 `Like`처럼 직접 모델을 만듭니다(명시적 N:M). 태그를 교체할 때는 `set: []`로 기존 연결을 끊고 `connectOrCreate`로 다시 연결합니다.
- **복합 키**: `@@id([userId, postId])`로 같은 사람이 같은 글에 좋아요를 두 번 누르는 것을 DB가 막습니다. `findUnique`에서는 `userId_postId`라는 이름으로 찾습니다.
- **DB 제약으로 검증하기**: 이메일 중복을 라우트에서 미리 조회하지 않고, UNIQUE 제약이 막은 `P2002`를 에러 핸들러에서 409로 바꿉니다.
- **`Promise.all`**: 목록 조회와 전체 개수 세기는 서로 기다릴 필요가 없어서 동시에 실행합니다.
- **연결 풀**: 클라이언트는 하나만 만들어 공유합니다. 연결이 여러 개(`connectionLimit: 5`)라서 `SET` 같은 세션 설정이 다음 쿼리와 다른 연결에서 실행될 수 있습니다. 시드에서 `SET FOREIGN_KEY_CHECKS` 대신 `deleteMany`를 쓴 이유입니다.
- **`ORDER BY`를 꼭 쓰기**: 정렬을 지정하지 않으면 MySQL은 순서를 약속하지 않습니다. JOIN 결과가 인덱스 순서(이름순)로 나온 것을 직접 확인했습니다.

## 진행 기록

- [x] 함수 기초 연습 (`practice.js`)
- [x] 1주차: CLI 메모장
- [x] 2주차: Express 게시판 API
- [x] 3주차: 게시판을 MySQL + Prisma로 이전
- [ ] 4주차
