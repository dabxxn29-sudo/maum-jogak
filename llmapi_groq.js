import axios from 'axios'

// API 키는 .env.local 파일에서 읽는다 (수업 13장 방식)
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
}

// 이전 대화(messages)와 함께 질문 보내기 (수업 13장 chatHistory와 같은 구조)
// 결과는 콜백 함수(onMessage)로 전달. 실패하면 null 전달
const chatHistory = async (prompt, messages, onMessage) => {
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

export { chat, chatHistory }
