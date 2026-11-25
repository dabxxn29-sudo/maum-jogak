// 마음조각 감정 사전
// 기본 감정 6개 → 세부 감정(조각) 4개씩, 기본 감정마다 날씨와 색을 연결한다
// ※ UX 설계를 위한 팀 초안이며, 특정 감정바퀴 이론의 정식 분류와 같다고 가정하지 않는다

export const EMOTIONS = [
  {
    id: 'joy', label: '기쁨', icon: '☀️', weather: '맑음', color: '#FFF3D1',
    pieces: [
      { name: '뿌듯함', meaning: '내가 해낸 일이 자랑스러울 때' },
      { name: '설렘', meaning: '좋은 일을 기다리며 마음이 들뜰 때' },
      { name: '감사함', meaning: '누군가에게 고마운 마음이 들 때' },
      { name: '홀가분함', meaning: '부담이 사라져 마음이 가벼울 때' },
    ],
  },
  {
    id: 'calm', label: '평온', icon: '⛅', weather: '구름 조금', color: '#E3F1FC',
    pieces: [
      { name: '편안함', meaning: '걱정 없이 몸과 마음이 느긋할 때' },
      { name: '차분함', meaning: '마음이 고요하고 흔들리지 않을 때' },
      { name: '안심됨', meaning: '걱정하던 일이 괜찮아졌을 때' },
      { name: '만족스러움', meaning: '지금 이대로 충분하다고 느낄 때' },
    ],
  },
  {
    id: 'sad', label: '슬픔', icon: '🌧️', weather: '비', color: '#D3DEEA',
    pieces: [
      { name: '서운함', meaning: '기대한 만큼 마음을 받지 못했을 때' },
      { name: '속상함', meaning: '일이 뜻대로 되지 않아 마음이 아플 때' },
      { name: '외로움', meaning: '곁에 아무도 없는 것처럼 느껴질 때' },
      { name: '허무함', meaning: '애쓴 일이 의미 없게 느껴질 때' },
    ],
  },
  {
    id: 'anger', label: '분노', icon: '⛈️', weather: '폭풍', color: '#DCE2F4',
    pieces: [
      { name: '짜증', meaning: '작은 일들이 계속 거슬릴 때' },
      { name: '억울함', meaning: '내 잘못이 아닌데 손해를 봤다고 느낄 때' },
      { name: '답답함', meaning: '상황이 막혀 풀리지 않을 때' },
      { name: '배신감', meaning: '믿었던 사람에게 실망했을 때' },
    ],
  },
  {
    id: 'fear', label: '두려움', icon: '☁️', weather: '흐림', color: '#E4E7EC',
    pieces: [
      { name: '불안', meaning: '나쁜 일이 생길 것 같아 마음이 놓이지 않을 때' },
      { name: '걱정', meaning: '앞으로의 일이 마음에 걸릴 때' },
      { name: '초조함', meaning: '시간에 쫓겨 마음이 급할 때' },
      { name: '막막함', meaning: '무엇부터 해야 할지 모를 때' },
    ],
  },
  {
    id: 'surprise', label: '놀람', icon: '🌈', weather: '무지개', color: '#F1E6FB',
    pieces: [
      { name: '당황', meaning: '예상 못 한 일에 어쩔 줄 모를 때' },
      { name: '놀라움', meaning: '생각지 못한 일에 깜짝 놀랐을 때' },
      { name: '어이없음', meaning: '말이 안 되는 상황에 할 말을 잃었을 때' },
      { name: '신기함', meaning: '처음 보는 일에 흥미가 생길 때' },
    ],
  },
]

// 조각 이름으로 그 조각이 속한 기본 감정 찾기 (없으면 undefined)
// 예) findEmotionByPiece('막막함') → 두려움
export const findEmotionByPiece = (pieceName) =>
  EMOTIONS.filter((e) => e.pieces.filter((p) => p.name == pieceName).length > 0)[0]

// 고른 조각들로 오늘의 날씨(기본 감정) 정하기
// 가장 많이 고른 기본 감정을 쓰고, 개수가 같으면 먼저 고른 조각의 감정을 쓴다
export const decideEmotion = (pieceNames) => {
  let best = null
  let bestCount = 0
  for (const name of pieceNames) {
    const emotion = findEmotionByPiece(name)
    if (emotion == undefined) continue
    const count = pieceNames.filter((n) => findEmotionByPiece(n) == emotion).length
    if (count > bestCount) {
      best = emotion
      bestCount = count
    }
  }
  return best // 조각이 없으면 null
}

// 조각을 고르지 않았을 때(잘 모르겠어요) 쓰는 카드 모양
export const UNKNOWN = { icon: '🌫️', weather: '안개', label: '아직 이름 붙이지 못한 마음', color: '#EEF1F4' }
