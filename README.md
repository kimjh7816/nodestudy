# node4week

혼자 Node.js를 공부하면서 연습 코드와 주차별 과제를 모아 두는 저장소입니다.

## 실행 환경

- Node.js (CommonJS)
- 의존성 설치: `npm install`

| 패키지 | 용도 |
| --- | --- |
| `express` | 웹 서버 (이후 주차에서 사용 예정) |
| `dayjs` | 날짜 처리 |
| `nodemon` | 파일 변경 시 자동 재시작 (개발용) |

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| [practice.js](practice.js) | 화살표 함수, 기본 매개변수, 템플릿 리터럴 연습 |
| [memo.js](memo.js) | 1주차 과제: CLI 메모장 |
| `memos.json` | `memo.js`가 만드는 데이터 파일 (실행 시 자동 생성) |

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

## 진행 기록

- [x] 함수 기초 연습 (`practice.js`)
- [x] 1주차: CLI 메모장
- [ ] 2주차
- [ ] 3주차
- [ ] 4주차
