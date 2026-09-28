const fs = require("fs").promises;
const FILE = "memos.json";

// 파일에서 메모 목록 읽기 (파일이 없으면 빈 배열)
const loadMemos = async () => {
  try {
    const data = await fs.readFile(FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

// 메모 목록을 파일에 저장
const saveMemos = async (memos) => {
  await fs.writeFile(FILE, JSON.stringify(memos, null, 2));
};

// 문자열로 들어온 id를 숫자로 변환 (숫자가 아니면 NaN)
const parseId = (value) => Number(value);

const addMemo = async (text) => {
  if (!text) {
    console.log('메모 내용을 입력하세요. 예: node memo.js add "장보기"');
    return;
  }

  const memos = await loadMemos();
  const lastMemo = memos[memos.length - 1];
  const newMemo = {
    id: lastMemo ? lastMemo.id + 1 : 1,
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };

  memos.push(newMemo);
  await saveMemos(memos);
  console.log(`[${newMemo.id}] 메모를 추가했습니다: ${text}`);
};

const listMemos = async () => {
  const memos = await loadMemos();

  if (memos.length === 0) {
    console.log("메모가 없습니다");
    return;
  }

  memos.forEach((memo) => {
    console.log(`[${memo.id}] ${memo.done ? "✅" : "⬜"} ${memo.text}`);
  });
};

const deleteMemo = async (id) => {
  const memos = await loadMemos();
  const index = memos.findIndex((memo) => memo.id === id);

  if (index === -1) {
    console.log(`${id}번 메모를 찾을 수 없습니다`);
    return;
  }

  const [removed] = memos.splice(index, 1);
  await saveMemos(memos);
  console.log(`[${removed.id}] 메모를 삭제했습니다: ${removed.text}`);
};

const doneMemo = async (id) => {
  const memos = await loadMemos();
  const memo = memos.find((memo) => memo.id === id);

  if (!memo) {
    console.log(`${id}번 메모를 찾을 수 없습니다`);
    return;
  }

  memo.done = true;
  await saveMemos(memos);
  console.log(`[${memo.id}] 메모를 완료 처리했습니다: ${memo.text}`);
};

const printUsage = () => {
  console.log("사용법: node memo.js [add|list|delete|done]");
  console.log('  node memo.js add "장보기"   메모 추가');
  console.log("  node memo.js list          전체 목록 출력");
  console.log("  node memo.js delete 1      1번 메모 삭제");
  console.log("  node memo.js done 2        2번 메모 완료 처리");
};

const main = async () => {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "add":
      await addMemo(args.join(" "));
      break;
    case "list":
      await listMemos();
      break;
    case "delete":
      await deleteMemo(parseId(args[0]));
      break;
    case "done":
      await doneMemo(parseId(args[0]));
      break;
    default:
      printUsage();
  }
};

main().catch((err) => console.error("오류:", err.message));
