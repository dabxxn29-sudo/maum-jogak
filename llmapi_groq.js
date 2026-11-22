import axios from 'axios'

// API 키 정하기
// - 내 컴퓨터: .env.local의 키를 자동으로 사용 (수업 13장 방식)
// - 배포 사이트: 키를 넣지 않고 배포하므로, 앱 화면에서 입력받은 키를 사용
//   (공개 사이트 파일 안에 비밀 키가 들어가지 않게 하기 위해)
let API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || ''

// 키가 준비되어 있는지 확인
const hasApiKey = () => API_KEY != ''

// 화면에서 입력받은 키로 바꾸기 (저장하지 않음, 새로고침하면 사라짐)
const setApiKey = (key) => {
  API_KEY = key
}

// 이전 대화(messages)와 함께 질문 보내기 (수업 13장 chatHistory와 같은 구조)
// 결과는 콜백 함수(onMessage)로 전달. 실패하면 null 전달
const chatHistory = async (prompt, messages, onMessage) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  }
  const gg = [...messages, { role: 'user', content: prompt }]
  axios.post('https://api.groq.com/openai/v1/chat/completions',
    { model: 'openai/gpt-oss-120b', temperature: 0.5, messages: gg },
    { headers, timeout: 15000 }
  ).then(response => {
    onMessage(response.data.choices[0].message.content)
  }).catch(err => { console.log(err); onMessage(null) })
}

// 질문 1개만 보내기 (대화 기억 없음)
const chat = async (prompt, onMessage) => {
  chatHistory(prompt, [], onMessage)
}

export { chat, chatHistory, hasApiKey, setApiKey }
