import { chatHistory } from './llmapi_groq'
import { EMOTIONS } from './emotions'

// ───────── 지식 기반 (수업 13장 예제 4번 방식) ─────────
// 우리 감정 사전을 대화 맨 앞에 넣어서, AI가 사전 안의 조각만 고르게 한다
const knowledge =
  '다음은 "마음조각" 앱의 감정 사전입니다. [기본 감정] 조각이름(뜻) 형식입니다.\n' +
  EMOTIONS.map((e) =>
    `[${e.label}] ` + e.pieces.map((p) => `${p.name}(${p.meaning})`).join(', ')
  ).join('\n')

const initial = [
  { role: 'user', content: knowledge },
  { role: 'assistant', content: '네. 감정 사전을 충분히 이해했습니다.' },
]

// 사전에 있는 조각 이름 전체 목록
const ALL_PIECES = []
for (const e of EMOTIONS) {
  for (const p of e.pieces) ALL_PIECES.push(p.name)
}

// ───────── 일기에서 감정 조각 찾기 ─────────
// 결과: [{ name: '막막함', reason: '할 게 너무 많아서' }, ...] (최대 3개)
// 못 찾거나 오류가 나면 빈 배열 []
export const findPieces = (diary, onResult) => {
  const prompt = `아래 한 줄 일기를 읽고, 앞에서 알려 준 감정 사전에서 글쓴이의 감정과 가장 가까운 조각을 찾아 주세요.

일기 : ${diary}

답변 규칙
- 감정 사전에 있는 조각 이름만 사용하세요.
- 조각은 1~3개만 고르세요.
- 한 줄에 하나씩 "조각이름|일기 속 근거" 형식으로만 답하세요.
- 근거는 일기에 나온 표현을 짧게 그대로 옮겨 쓰세요.
- 다른 설명은 쓰지 마세요.`

  chatHistory(prompt, initial, (result) => {
    if (result == null) {
      onResult([])
      return
    }
    const pieces = []
    for (const line of result.split('\n')) {
      const parts = line.split('|')
      // 줄 앞부분에 들어 있는 사전 조각 이름 찾기
      const name = ALL_PIECES.filter((n) => parts[0].includes(n))[0]
      if (name == undefined) continue
      if (pieces.filter((p) => p.name == name).length > 0) continue // 중복 제외
      pieces.push({ name, reason: parts.length > 1 ? parts[1].trim() : '' })
    }
    onResult(pieces.slice(0, 3))
  })
}
