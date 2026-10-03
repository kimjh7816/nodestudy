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

게시판 API는 [board-api/](board-api/) 폴더에 별도 프로젝트로 있습니다. 의존성도 그 폴더에서 따로 설치합니다. 사용하는 패키지는 `express`, `cors`, `morgan`, `dotenv`, `prisma`, `@prisma/client`, `@prisma/adapter-mariadb`, `bcrypt`, `jsonwebtoken`, `multer`, `express-validator`, `helmet`, `express-rate-limit`, `nodemon`입니다. MySQL 8이 필요합니다.

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| [practice.js](practice.js) | 화살표 함수, 기본 매개변수, 템플릿 리터럴 연습 |
| [memo.js](memo.js) | 1주차 과제: CLI 메모장 |
| `memos.json` | `memo.js`가 만드는 데이터 파일 (실행 시 자동 생성) |
| [raw-server.js](raw-server.js) | Express 없이 `http` 모듈만으로 만든 서버 (비교용) |
| [board-api/](board-api/) | 2·3·4주차 과제: Express 게시판 API (MySQL + Prisma, JWT 인증, 이미지 업로드) |
| [test.http](test.http) | 게시판 API 테스트 요청 84개 (VS Code REST Client) |
| [test-files/](test-files/) | 업로드 테스트용 파일 (png, txt, pdf) |

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

## 게시판 API (board-api) — 2주차 → 3주차 → 4주차 과제

2주차에 메모리(배열)로 만든 게시판 API를 3주차에 **MySQL + Prisma**로 옮기고, 4주차에 **회원가입·로그인(JWT), 권한 확인, 이미지 업로드**를 붙였습니다. 최종 과제(인스타그램형 서비스)의 리허설입니다.

| 주차 | 저장소 | 내용 |
| --- | --- | --- |
| 2주차 | 메모리 배열 (`data/store.js`, 현재 삭제됨) | 게시글 CRUD, 댓글, 목록 쿼리, 검증, 라우터 분리, 404·에러 핸들러 |
| 3주차 | MySQL + Prisma 7 | 사용자, 좋아요 토글, 태그(N:M), 관계 조회(include/select/_count), Cascade 삭제, Prisma 에러 변환 |
| 4주차 | MySQL + Prisma 7 | bcrypt 해시, JWT 로그인, 인증(`protect`)·인가(`checkOwner`), multer 업로드, express-validator, controllers 레이어, helmet·로그인 횟수 제한 |

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
| `npm run dev` | nodemon으로 서버 실행 (코드 저장 시 재시작. `.env`를 바꿨을 때는 직접 재시작) |
| `npm start` | node로 서버 실행 |
| `npm run seed` | 모든 테이블을 비우고 id를 1부터 다시 시작해 초기 데이터를 넣음 |

### 환경변수 (`.env`)

`.env`는 Git에 올리지 않고, 값을 비운 견본 `.env.example`만 올립니다.

| 변수 | 쓰는 곳 | 예시 |
| --- | --- | --- |
| `PORT` | 서버 포트 | `3000` |
| `DATABASE_URL` | Prisma CLI (마이그레이션) — `prisma.config.ts` | `mysql://root:비밀번호@localhost:3306/board` |
| `DATABASE_HOST` / `PORT` / `USER` / `PASSWORD` / `NAME` | Prisma Client (서버 실행) — `lib/prisma.js`의 MariaDB 어댑터 | `localhost` / `3306` / `root` / … / `board` |
| `JWT_SECRET` | 토큰 서명 비밀키 — 길고 무작위로 | 아래 명령으로 생성 |
| `JWT_EXPIRES_IN` | 토큰 만료 기간 | `7d` |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # JWT_SECRET 생성
```

- DB 비밀번호를 바꾸면 `DATABASE_URL`과 `DATABASE_PASSWORD` **두 곳 모두** 고쳐야 합니다.
- `JWT_SECRET`을 바꾸면 이전에 발급한 토큰은 모두 무효가 됩니다.

### 인증 방식

1. `POST /auth/login`으로 로그인하면 토큰을 받습니다.
2. 이후 요청 헤더에 토큰을 넣습니다: `Authorization: Bearer <토큰>`
3. 서버는 토큰에서 사용자를 찾아 `req.user`에 넣고, **작성자·좋아요 주인은 요청 본문이 아니라 `req.user.id`로** 정합니다.

| 표시 | 의미 | 미들웨어 |
| --- | --- | --- |
| — | 로그인 없이 가능 | |
| 선택 | 로그인 없이 가능, 로그인했으면 `isLiked` 표시 | `optionalAuth` |
| 필요 | 로그인 필요 — 없거나 잘못된 토큰이면 **401** | `protect` |
| 본인 | 로그인 + 작성자 본인만 — 남의 것이면 **403** | `protect` → `checkOwner` |

로그인은 **15분에 10번**까지입니다(무차별 대입 방어). 넘으면 429입니다.

### 엔드포인트

**인증**

| 메서드 | 경로 | 권한 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/signup` | — | 회원가입 (`username` 2~20자, `email`, `password` 8자 이상) | 201 | 400, 409 (중복) |
| `POST` | `/auth/login` | — | 로그인 → `{ token, user }` | 200 | 400, 401, 429 |
| `GET` | `/auth/me` | 필요 | 내 정보 (email 포함) | 200 | 401 |

**사용자**

| 메서드 | 경로 | 권한 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- | --- |
| `PATCH` | `/users/me` | 필요 | 프로필 수정 (`bio`, 프로필 사진 `profileImage`) | 200 | 400, 401 |
| `GET` | `/users` | — | 사용자 목록 + 글·댓글 수 | 200 | |
| `GET` | `/users/:id` | — | 프로필 (`postCount`, 최근 글 5개, email 없음) | 200 | 400, 404 |
| `GET` | `/users/:id/posts` | 선택 | 특정 사용자의 글 목록 (`/posts`와 같은 형식) | 200 | 400, 404 |

**게시글**

| 메서드 | 경로 | 권한 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/posts` | 선택 | 목록 (쿼리는 아래 표) | 200 | 400 |
| `GET` | `/posts/:id` | 선택 | 단건 (작성자 + 사진 + 태그 + 댓글 + 댓글 작성자 + 개수) | 200 | 400, 404 |
| `POST` | `/posts` | 필요 | 작성 (`title`, `content`, `tags`, 사진 `images` 최대 5장) | 201 | 400, 401 |
| `PUT` | `/posts/:id` | 본인 | 전체 수정 (`title`, `content` 필수, `tags` 안 보내면 비워짐) | 200 | 400, 401, 403, 404 |
| `PATCH` | `/posts/:id` | 본인 | 부분 수정 (보낸 필드만, `tags`를 보내면 태그 교체) | 200 | 400, 401, 403, 404 |
| `DELETE` | `/posts/:id` | 본인 | 삭제 (댓글·좋아요·사진은 Cascade, 사진 파일도 삭제) | 204 | 401, 403, 404 |
| `POST` | `/posts/:id/like` | 필요 | 좋아요 토글 | 200 | 401, 404 |

**댓글**

| 메서드 | 경로 | 권한 | 설명 | 성공 | 실패 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/posts/:id/comments` | — | 글의 댓글 목록 (오래된 순, 작성자 포함) | 200 | 400, 404 |
| `POST` | `/posts/:id/comments` | 필요 | 댓글 작성 (`content` 500자) | 201 | 400, 401, 404 |
| `DELETE` | `/comments/:id` | 본인 | 댓글 삭제 | 204 | 400, 401, 403, 404 |

**태그**

| 메서드 | 경로 | 권한 | 설명 | 성공 |
| --- | --- | --- | --- | --- |
| `GET` | `/tags` | — | 태그 목록 + 태그별 글 수 (글 많은 순, 글이 없는 태그는 제외) | 200 |

태그는 글 작성·수정 때 `"tags": ["여행", "제주"]`처럼 이름 배열로 보냅니다. form-data로 보낼 때는 `여행,제주` 문자열도 됩니다. 없는 태그는 새로 만들고 있는 태그는 연결만 합니다(`connectOrCreate`). 앞뒤 공백과 중복은 정리하고, 태그 하나는 30자, 글 하나에 10개까지입니다.

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

### 이미지 업로드

- `multipart/form-data`로 보냅니다. 글 사진은 필드명 **`images`**(최대 5장), 프로필 사진은 **`profileImage`**(1장)입니다.
- jpeg / png / gif / webp만, 한 장에 **5MB**까지입니다. 그 밖의 파일이나 큰 파일, 필드명 오타는 400입니다.
- 파일은 서버가 만든 고유한 이름으로 `uploads/`에 저장하고(원본 이름은 덮어쓰기·경로 탈출 위험 때문에 쓰지 않음), **DB에는 경로(`/uploads/…`)만** 저장합니다.
- 저장한 파일은 `http://localhost:3000/uploads/<파일명>`으로 볼 수 있습니다(`express.static`).
- 글을 삭제하거나 프로필 사진을 바꾸면 예전 파일을 지웁니다. 검증이나 처리에 실패한 요청의 파일도 지웁니다.

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer <토큰>" \
  -F "title=오늘의 사진" -F "content=날씨 좋다" -F "tags=일상,사진" \
  -F "images=@./photo1.jpg" -F "images=@./photo2.jpg"
```

### 응답 형식

`utils/response.js`의 `success` / `fail`로 형식을 통일했습니다. 삭제 성공(204)만 본문이 없습니다.

```json
// 로그인
{ "success": true, "data": { "token": "eyJhbGciOi...", "user": { "id": 1, "username": "철수", "email": "chulsoo@test.com", "bio": "", "profileImage": "" } } }

// 목록 — 각 글에 작성자(id, username, profileImage만), 사진, 태그, 좋아요 수, 댓글 수, 내가 눌렀는지
{
  "success": true, "page": 1, "limit": 10, "total": 3, "totalPages": 1,
  "data": [
    {
      "id": 3, "title": "제주도 여행 후기", "content": "날씨가 좋았어요", "authorId": 1,
      "createdAt": "...", "updatedAt": "...",
      "author": { "id": 1, "username": "철수", "profileImage": "" },
      "images": [{ "id": 1, "url": "/uploads/1791...png", "order": 0 }],
      "tags": ["여행", "제주"],
      "likeCount": 1, "commentCount": 0, "isLiked": true
    }
  ]
}

// 검증 실패 — 첫 번째 메시지 + 전체 목록 (보낸 값은 응답에 넣지 않음)
{ "success": false, "message": "비밀번호는 8자 이상이어야 합니다", "errors": [{ "field": "password", "message": "..." }] }

// 실패
{ "success": false, "message": "권한이 없습니다" }
```

- **password는 어떤 응답에도 나가지 않습니다.** 전역 omit(`lib/prisma.js`)으로 모든 User 조회에서 빠지고, 로그인에서만 `omit: { password: false }`로 가져와 비교한 뒤 응답 전에 지웁니다.
- 작성자는 `select`로 `id`, `username`, `profileImage`만 가져옵니다. **email은 본인(`/auth/me`, 로그인·가입 응답)에게만** 보여줍니다.
- `isLiked`는 로그인한 사용자 기준입니다. 비로그인이면 항상 `false`입니다.

### 에러 처리

컨트롤러는 `asyncHandler`로 감싸고, 문제가 있으면 `throw new AppError("메시지", 상태코드)`를 던집니다. `middlewares/errorHandler.js`가 상태 코드로 바꿉니다.

| 상황 | 원인 | 응답 |
| --- | --- | --- |
| 필수 값 누락, 글자 수·형식 오류 | `validators/` + `middlewares/validate.js` | 400 |
| 숫자가 아닌 id (`/posts/abc`) | `utils/parseId.js` | 400 |
| 깨진 JSON 본문 | `express.json()` (`entity.parse.failed`) | 400 |
| 이미지가 아닌 파일, 5MB 초과, 필드명 오타 | multer | 400 |
| 토큰 없음·위조·만료, 로그인 실패 | `protect`, 로그인 | 401 |
| 남의 글·댓글 수정·삭제 | `checkOwner` | 403 |
| 없는 대상 | `findUnique` → `null`, Prisma `P2025` | 404 |
| 이메일·사용자명 중복 | 가입 시 미리 확인, Prisma `P2002` | 409 |
| 외래 키 위반 | Prisma `P2003` | 400 |
| 로그인 시도 초과 | `express-rate-limit` | 429 |
| 그 밖의 오류 | | 500 — **내부 메시지는 숨기고** 서버 로그에만 출력 |

로그인 실패는 "없는 이메일"과 "틀린 비밀번호"를 **같은 메시지**("이메일 또는 비밀번호가 올바르지 않습니다")로 보냅니다. 어떤 이메일이 가입돼 있는지 알아낼 수 없게 하기 위해서입니다.

### 데이터 모델 (`prisma/schema.prisma`)

| 모델 | 필드 | 관계 |
| --- | --- | --- |
| `User` | `id`, `username`(고유, 20자), `email`(고유), `password`(bcrypt 해시), `bio`(150자), `profileImage`, `createdAt`, `updatedAt` | 글·댓글·좋아요 1:N |
| `Post` | `id`, `title`(100자), `content`(Text), `authorId`, `createdAt`, `updatedAt` | User N:1, 댓글·좋아요·사진 1:N, 태그 N:M |
| `PostImage` | `id`, `url`, `order`(사진 순서), `postId` | Post N:1, `@@index([postId])` |
| `Comment` | `id`, `content`(500자), `postId`, `authorId`, `createdAt` | Post·User N:1, `@@index([postId])` |
| `Like` | `userId` + `postId` 복합 키 (`@@id`), `createdAt` | User·Post N:M 중간 테이블 |
| `Tag` | `id`, `name`(고유, 30자) | Post 암시적 N:M — 중간 테이블 `_PostToTag`를 Prisma가 자동으로 만듦 |

- 모든 관계에 `onDelete: Cascade`가 걸려 있어, 글을 지우면 댓글·좋아요·사진 행도 DB가 지웁니다. (디스크의 사진 파일은 코드에서 지웁니다.)
- 좋아요 수는 숫자 칸으로 따로 두지 않고 `Like` 행 개수를 셉니다.
- 마이그레이션: `init` → `add_comment` → `add_likes` → `add_tags` → `add_user_auth` → `add_post_images` (`prisma/migrations/`, Git에 올림)

### 폴더 구조

routes는 경로와 미들웨어 순서만 보여주고, 실제 처리는 controllers가 합니다. 라우트 파일만 봐도 API 전체와 각 경로의 권한이 한눈에 들어옵니다.

```
board-api/
├── index.js                  # dotenv → helmet·cors·morgan·json·/uploads → 로그인 횟수 제한 → 라우트 → 404 → 에러 핸들러
├── .env                      # Git에 올리지 않음
├── .env.example
├── prisma.config.ts          # Prisma CLI 설정 (DATABASE_URL, 마이그레이션 경로)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/           # Git에 올림
│   └── seed.js               # npm run seed
├── generated/prisma/         # Prisma Client (Git에 올리지 않음, npx prisma generate로 생성)
├── uploads/                  # 업로드한 파일 (Git에 올리지 않음, 실행 시 자동 생성)
├── lib/
│   └── prisma.js             # PrismaClient 하나만 만들어 공유 (MariaDB 어댑터, password 전역 omit)
├── routes/                   # 경로 → 미들웨어 → 컨트롤러 연결만
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── comments.js           # /posts/:id/comments, /comments/:id
│   └── tags.js
├── controllers/              # 요청/응답 처리
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   ├── commentController.js
│   └── tagController.js
├── validators/               # express-validator 규칙
│   ├── auth.js
│   ├── post.js
│   ├── comment.js
│   └── user.js
├── middlewares/
│   ├── auth.js               # protect(로그인 필수), optionalAuth(로그인 선택)
│   ├── checkOwner.js         # 작성자 본인인지 확인 (404 / 403)
│   ├── upload.js             # multer — 이미지만, 5MB
│   ├── validate.js           # 검증 결과 → 400
│   └── errorHandler.js       # multer·Prisma·JSON 에러 → 상태 코드, 500 메시지 숨김
└── utils/
    ├── AppError.js           # 상태 코드를 가진 에러
    ├── asyncHandler.js       # async 에러 → next(err)
    ├── parseId.js            # 문자열 id → 1 이상의 정수, 아니면 400
    ├── password.js           # bcrypt hash / compare
    ├── token.js              # JWT 발급
    ├── files.js              # 업로드 파일 삭제
    ├── postList.js           # 게시글 응답 공통: 정렬·페이지·include·isLiked
    └── response.js           # success / fail
```

### 테스트

1. `npm run seed`로 DB를 초기화합니다. 모든 id가 1부터 다시 시작하므로 test.http의 id가 맞습니다.
   - 사용자 1 철수(`chulsoo@test.com`), 2 영희(`younghee@test.com`), 3 민수(`minsu@test.com`) — 비밀번호 모두 `password1234`
   - 게시글 1 "첫 글"(철수), 2 "두 번째"(영희), 3 "제주도 여행 후기"(철수)
   - 댓글 2개(1번 글, 영희·민수), 좋아요 3개(1번 글 ← 영희·민수, 3번 글 ← 철수)
   - 태그: 1번 글 [일상], 3번 글 [여행, 제주]
2. `npm run dev`로 서버를 켭니다.
3. VS Code REST Client로 [test.http](test.http)를 **1번부터 순서대로** 실행합니다. 성공·실패 케이스 84개가 있고, 각 요청 제목에 기대 상태 코드(`→ 200` 등)를 적어두었습니다.
   - 철수·영희 로그인 요청을 먼저 보내면 토큰이 `{{token}}`, `{{token2}}`에 자동으로 들어갑니다(`# @name`).
   - 업로드 테스트 파일은 [test-files/](test-files/)에 있습니다. 6MB 파일(`large.jpg`)은 Git에 올리지 않으므로 test.http 맨 위 주석의 명령으로 한 번 만듭니다.
   - 로그인 횟수 제한 때문에 15분 안에 두 번 돌리면 429가 날 수 있습니다. 서버를 재시작하면 초기화됩니다.

데이터를 눈으로 확인할 때는 `npx prisma studio`를 씁니다. User 테이블의 `password`가 `$2b$`로 시작하는 해시인지, 글을 삭제한 뒤 댓글이 Cascade로 사라졌는지 볼 수 있습니다.

### PUT과 PATCH의 차이

- **PUT**: 수정 가능한 필드(`title`, `content`, `tags`) 전체를 교체합니다. `title`, `content`는 필수이고, `tags`를 안 보내면 태그가 모두 떼어집니다.
- **PATCH**: 보낸 필드만 수정합니다. Prisma는 `data`에서 `undefined`인 필드를 무시하므로 `{ title, content }`를 그대로 넘겨도 보낸 것만 바뀝니다.

### 2주차에서 배운 것

- **`req.params` / `req.query` / `req.body`**: 특정 자원을 가리킬 때는 params(`/posts/1`), 목록을 거르거나 정렬할 때는 query(`?author=철수`), 보낼 데이터는 body를 씁니다. params와 query 값은 **항상 문자열**이라 숫자로 바꿔서 씁니다.
- **`express.json()`**: 요청 본문(JSON 문자열)을 객체로 바꿔 `req.body`에 넣습니다. 이 미들웨어가 없으면 `req.body`가 `undefined`입니다.
- **미들웨어와 `next()`**: 미들웨어는 등록한 순서대로 실행됩니다. `next()`로 넘기거나 직접 응답해야 하고, 둘 다 안 하면 클라이언트는 응답을 받지 못하고 계속 기다립니다.
- **`req`에 값 심기**: 미들웨어가 찾은 값을 `req`에 넣어두면 다음 핸들러가 꺼내 씁니다. 4주차의 `protect`(`req.user`), `checkOwner`(`req.doc`)가 이 패턴입니다.
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

### 4주차에서 배운 것

- **해싱 vs 암호화**: 비밀번호는 되돌릴 수 없는 해싱(bcrypt)으로 저장합니다. bcrypt는 매번 무작위 salt를 섞어서 같은 비밀번호도 해시가 매번 달라지므로, `===`가 아니라 `bcrypt.compare`로 비교합니다.
- **JWT**: `헤더.페이로드.서명`입니다. 페이로드는 Base64라 누구나 읽을 수 있으므로 id처럼 노출돼도 되는 값만 넣습니다. 위조는 `JWT_SECRET`으로 만든 서명이 막습니다.
- **전역 omit**: User를 조회하는 모든 곳에서 password를 기본으로 빼서, 응답에 실수로 내보내는 사고를 막습니다. 로그인에서만 `omit: { password: false }`로 가져옵니다.
- **인증과 인가**: 401은 "누구인지 모름"(토큰 없음·위조·만료), 403은 "누군지는 알지만 권한 없음"(남의 글)입니다. 그래서 `protect` → `checkOwner` 순서로 붙입니다.
- **"누구의 것인지"는 토큰으로**: `authorId`·`userId`를 요청 본문에서 받으면 남의 이름으로 글을 쓸 수 있습니다. 항상 `req.user.id`를 씁니다. 프로필 수정이 `/users/:id`가 아니라 `/users/me`인 이유도 같습니다.
- **로그인 실패 메시지는 하나로**: 이메일이 없는지 비밀번호가 틀렸는지 구분해서 알려주면 가입된 이메일을 알아낼 수 있습니다.
- **파일은 디스크, DB에는 경로**: 이미지는 `uploads/`에, DB(`PostImage`)에는 URL만 저장합니다. Cascade는 DB 행만 지우므로 파일은 코드에서 지웁니다.
- **multer가 먼저**: multipart 요청은 multer가 풀어야 `req.body`가 생기므로 `upload`가 검증 규칙보다 앞에 와야 합니다. 그 대신 검증에 실패해도 파일은 이미 저장돼 있으므로 지워줍니다.
- **중첩 생성**: `images: { create: [...] }`로 게시글과 사진 행을 한 번에 만듭니다. 내부적으로 트랜잭션이라 글만 생기고 사진은 실패하는 일이 없습니다.
- **입력값은 서버에서 검증**: Prisma 스키마는 값을 검증하지 않습니다. express-validator로 규칙을 모으고, `trim`·`toLowerCase`로 값도 정리합니다(대문자 이메일로 중복 가입하는 것도 이걸로 막습니다). 검증 에러 응답에는 보낸 값을 넣지 않습니다. 비밀번호가 되돌아가기 때문입니다.
- **레이어 분리**: routes(경로·권한) / controllers(처리) / validators(규칙) / middlewares로 나누고, `asyncHandler` + `AppError`로 `try/catch`를 없앴습니다.
- **`undefined` 조건 주의**: `where: { userId: undefined }`는 Prisma가 "조건 없음"으로 처리해 모든 행을 가져옵니다. 비로그인일 때 `isLiked`가 잘못 나오지 않게 분기했습니다.
- **보안 기본기**: `helmet`(보안 헤더), 로그인 횟수 제한(`express-rate-limit`), 500 에러 메시지 숨기기, 업로드 파일의 종류·크기 제한.

## 진행 기록

- [x] 함수 기초 연습 (`practice.js`)
- [x] 1주차: CLI 메모장
- [x] 2주차: Express 게시판 API
- [x] 3주차: 게시판을 MySQL + Prisma로 이전
- [x] 4주차: 인증 · 인가 · 이미지 업로드
