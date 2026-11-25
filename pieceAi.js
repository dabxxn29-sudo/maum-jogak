import { chatHistory } from './llmapi_groq'
import { EMOTIONS, decideEmotion } from './emotions'
import { RECOMMENDATIONS, pickSome } from './recommendations'

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
// 결과: [{ name: '막막함', reason: '할 일이 많으면 무엇부터 할지 막막할 수 있어요' }, ...] (최대 3개)
// 못 찾거나 오류가 나면 빈 배열 []
export const findPieces = (diary, onResult) => {
  const prompt = `아래 한 줄 일기를 읽고, 앞에서 알려 준 감정 사전에서 글쓴이가 느꼈을 감정 조각을 골라 주세요.

일기 : ${diary}

답변 규칙
- 감정 사전에 있는 조각 이름만 사용하세요.
- 일기에서 분명하게 느껴지는 조각만 고르세요. 보통 1~2개, 많아도 3개까지만 고르세요.
- 서로 비슷한 조각을 여러 개 고르지 말고, 결이 다른 조각을 고르세요.
- 한 줄에 하나씩 "조각이름|이유" 형식으로만 답하세요.
- 이유는 그 조각을 고른 까닭을 25자 안팎의 한 문장으로, "~일 수 있어요"처럼 부드럽게 쓰세요.
- 조각마다 이유가 서로 달라야 합니다.
- 다른 설명은 쓰지 마세요.

예시
일기 : 시험이 드디어 끝났는데 결과가 걱정된다
홀가분함|시험이 끝나 부담이 조금 덜어졌을 수 있어요
걱정|아직 모르는 결과가 마음에 걸릴 수 있어요`

  chatHistory(prompt, initial, (result) => {
    if (result == null) {
      onResult([])
      return
    }
    const pieces = []
    for (const line of result.split('\n')) {
      if (!line.includes('|')) continue // "조각이름|이유" 형식이 아닌 줄은 건너뛰기
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

// ───────── 날씨 카드 뒷면: 오늘 마음에 건네는 작은 추천 ─────────
// 감정별 추천 후보 중 몇 개를 무작위로 뽑아 AI에게 주고, AI는 그 안에서 하나를 고른다
// → 같은 추천이 반복되지 않고, 없는 곡을 지어내지 않는다
// 결과: { kind: '음식', item: '...', reason: '...', line: '...' }, 오류가 나면 null
export const KINDS = { 음식: '🍽', 음악: '🎧', 활동: '🚶', 휴식: '🛋' }

export const askComment = (diary, pieceNames, recentItems, onComment) => {
  const emotion = decideEmotion(pieceNames)
  const pool = RECOMMENDATIONS[emotion ? emotion.id : 'unknown']

  // 종류마다 후보 뽑기 (최근에 추천한 것은 빼고)
  const candidates = {
    음식: pickSome(pool.음식, 2, recentItems),
    활동: pickSome(pool.활동, 3, recentItems),
    휴식: pickSome(pool.휴식, 2, recentItems),
    음악: pickSome(pool.음악, 2, recentItems),
  }
  const kindNames = Object.keys(candidates).filter((k) => candidates[k].length > 0)
  const candidateText = kindNames.map((k) => `[${k}] ${candidates[k].join(' / ')}`).join('\n')

  const pieceText = pieceNames.length > 0 ? pieceNames.join(', ') : '(아직 이름 붙이지 않음)'
  const prompt = `당신은 친구의 기분을 잘 읽고, 오늘 바로 해 볼 수 있는 작은 것을 툭 건네는 센스 있는 친구입니다.
친구가 오늘의 한 줄 일기를 쓰고, 감정 사전에서 자신의 마음 조각을 직접 골랐습니다.
아래 추천 후보 중에서 오늘 일기에 가장 잘 맞는 것 하나를 골라 주세요.

일기 : ${diary}
친구가 고른 마음 조각 : ${pieceText}

추천 후보
${candidateText}

답변 규칙
- 반드시 위 후보 중 하나만 고르고, 추천에는 후보 문구를 그대로 쓰세요.
- 아래 형식 네 줄로만 답하세요.
종류: (${kindNames.join(', ')} 중 하나)
추천: (고른 후보 문구 그대로)
이유: (일기 내용과 연결해 이 추천이 어울리는 이유, 25자 안팎 한 문장)
한마디: (친구에게 건네는 짧은 말, 20자 안팎 한 문장)
- 말투는 친구처럼 가볍고 담백하게. 과장하거나 감동적인 말투는 쓰지 마세요.
- "감사해요", "솔직하게 표현해 주셔서", "충분히 그럴 수 있어요", "힘내세요", "~셨겠어요" 같은 상투적인 위로 표현은 쓰지 마세요.
- 감정을 진단하거나 충고하지 마세요.
- 일기에 스스로를 해치고 싶다는 등 위험한 내용이 있으면, 종류는 휴식으로 하고 한마디에 자살예방상담전화 109에 연락해 보라는 안내를 넣으세요.`

  chatHistory(prompt, initial, (result) => {
    if (result == null) {
      onComment(null)
      return
    }
    // "추천: ..." 같은 줄에서 ':' 뒤의 내용만 꺼내기
    const lines = result.split('\n')
    const pick = (label) => {
      const line = lines.filter((l) => l.includes(label + ':'))[0]
      return line ? line.slice(line.indexOf(':') + 1).trim() : ''
    }
    let kind = pick('종류')
    let item = pick('추천')
    let reason = pick('이유')
    const line = pick('한마디')

    // 환각 방지: 추천이 후보 목록에 있는지 확인
    let found = null
    for (const k of kindNames) {
      const match = candidates[k].filter((c) => item.includes(c) || c.includes(item))[0]
      if (item != '' && match) {
        found = { kind: k, item: match }
        break
      }
    }
    if (found == null) {
      // 후보에 없는 답이면, 후보 중 하나로 바꾸고 이유는 비워 둔다
      const k = kindNames.includes('활동') ? '활동' : kindNames[0]
      found = { kind: k, item: candidates[k][0] }
      reason = ''
    }
    onComment({ kind: found.kind, item: found.item, reason, line })
  })
}
