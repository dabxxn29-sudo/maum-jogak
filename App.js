import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import DiaryScreen from './DiaryScreen'
import PiecesScreen from './PiecesScreen'
import WeatherCard from './WeatherCard'
import RecordsScreen from './RecordsScreen'
import KeyScreen from './KeyScreen'
import { hasApiKey } from './llmapi_groq'
import { findPieces, askComment } from './pieceAi'
import { todayString, daysAgo, COLORS } from './common'

// 시연용 예시 기록 3개 (지어낸 내용, 실제 일기 아님)
const SAMPLES = [
  {
    id: 1, date: daysAgo(9), diary: '중간 발표를 무사히 끝냈다', pieces: ['뿌듯함', '홀가분함'],
    comment: { kind: '음식', item: '치즈 듬뿍 떡볶이', reason: '끝낸 날엔 좋아하는 걸로 마무리해요', line: '오늘은 좀 놀아도 돼요' },
  },
  {
    id: 2, date: daysAgo(4), diary: '과제 마감이 겹쳐서 손에 안 잡힌다', pieces: ['막막함', '초조함'],
    comment: { kind: '휴식', item: '휴대폰 끄고 20분 눕기', reason: '머리가 꽉 찼을 땐 잠깐 비우는 게 먼저예요', line: '목록은 누운 다음에 봐요' },
  },
  {
    id: 3, date: daysAgo(1), diary: '친구가 약속을 또 미뤄서 서운했다', pieces: ['억울함', '서운함'],
    comment: { kind: '활동', item: '좋아하는 카페까지 걷기', reason: '비어 버린 시간을 나를 위해 써 봐요', line: '혼자여도 꽤 괜찮은 오후예요' },
  },
]

const TABS = [
  { id: 'today', label: '오늘의 마음' },
  { id: 'records', label: '나의 기록' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  // 오늘의 마음 화면 순서: 'write'(일기 쓰기) → 'pieces'(조각 확인) → 'card'(날씨 카드)
  const [screen, setScreen] = useState('write')
  const [keyReady, setKeyReady] = useState(hasApiKey()) // AI 키 준비 여부
  const [diary, setDiary] = useState('')
  const [aiPieces, setAiPieces] = useState([]) // AI가 찾은 조각
  const [loading, setLoading] = useState(false)

  // 기록 목록 (useState에만 저장, 새로고침하면 예시 기록으로 돌아감)
  const [records, setRecords] = useState(SAMPLES)
  const [currentId, setCurrentId] = useState(null)             // 방금 만든 카드
  const [commentLoadingId, setCommentLoadingId] = useState(null) // AI 추천을 기다리는 카드

  // AI 추천 받아서 기록에 넣기
  // AI 답을 기다리는 동안 목록이 바뀌어도 덮어쓰지 않도록 최신 상태(m)로 업데이트
  const requestComment = (id, text, names) => {
    setCommentLoadingId(id)
    // 최근 기록 5개의 추천은 다시 나오지 않도록 함께 넘긴다
    const recentItems = records.filter((r) => r.comment != null).slice(-5).map((r) => r.comment.item)
    askComment(text, names, recentItems, (comment) => {
      setRecords((m) => m.map((r) => (r.id == id ? { ...r, comment } : r)))
      setCommentLoadingId(null)
    })
  }

  // 일기 저장 → AI에게 조각 찾기 요청
  const onSave = (text) => {
    setDiary(text)
    setAiPieces([])
    setScreen('pieces')
    setLoading(true)
    findPieces(text, (result) => {
      setAiPieces(result)
      setLoading(false)
    })
  }

  // Create: 조각 확정 → 기록 추가 → 날씨 카드
  const onConfirm = (names) => {
    const id = records.length == 0 ? 1 : Math.max(...records.map((r) => r.id)) + 1
    setRecords([...records, { id, date: todayString(), diary, pieces: names, comment: null }])
    setCurrentId(id)
    setScreen('card')
    requestComment(id, diary, names)
  }

  // Update: 조각 다시 고르기 → 추천도 새로 받기
  const onUpdatePieces = (id, names) => {
    const target = records.filter((r) => r.id == id)[0]
    setRecords((m) => m.map((r) => (r.id == id ? { ...r, pieces: names, comment: null } : r)))
    requestComment(id, target.diary, names)
  }

  // Delete
  const onDelete = (id) => {
    setRecords((m) => m.filter((r) => r.id != id))
  }

  const current = records.filter((r) => r.id == currentId)[0]

  return (
    <View style={styles.container}>
      <View style={styles.cloudRow}>
        <Text style={styles.cloud}>☁️</Text>
        <Text style={[styles.cloud, styles.cloudSmall]}>☁️</Text>
        <Text style={styles.cloud}>☁️</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.logo}>마음조각</Text>
        <Text style={styles.slogan}>오늘의 마음을 조각조각 들여다보기</Text>
      </View>

      {/* 키가 없으면(배포 사이트) 먼저 키 입력 화면 */}
      {!keyReady && <KeyScreen onReady={() => setKeyReady(true)} />}

      {keyReady && (
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity style={[styles.tab, tab == t.id ? styles.tabOn : null]} onPress={() => setTab(t.id)}>
              <Text style={[styles.tabText, tab == t.id ? styles.tabTextOn : null]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── 오늘의 마음 ── */}
      {keyReady && tab == 'today' && screen == 'write' && <DiaryScreen onSave={onSave} />}

      {keyReady && tab == 'today' && screen == 'pieces' && loading && (
        <View style={styles.box}>
          <Text style={styles.boxText}>AI가 "{diary}" 속 마음 조각을 찾고 있어요...</Text>
        </View>
      )}

      {keyReady && tab == 'today' && screen == 'pieces' && !loading && (
        <PiecesScreen
          diary={diary}
          aiPieces={aiPieces}
          onConfirm={onConfirm}
          onBack={() => setScreen('write')}
        />
      )}

      {keyReady && tab == 'today' && screen == 'card' && current && (
        <View>
          <WeatherCard record={current} commentLoading={commentLoadingId == current.id} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.subButton} onPress={() => setTab('records')}>
              <Text style={styles.subButtonText}>나의 기록 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setScreen('write')}>
              <Text style={styles.buttonText}>새 일기 쓰기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 나의 기록 ── */}
      {keyReady && tab == 'records' && (
        <RecordsScreen
          records={records}
          commentLoadingId={commentLoadingId}
          onUpdatePieces={onUpdatePieces}
          onDelete={onDelete}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.sky, paddingTop: 40, paddingLeft: 16, paddingRight: 16 },
  cloudRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cloud: { fontSize: 34 },
  cloudSmall: { fontSize: 22, marginTop: 14 },
  header: { alignItems: 'center', marginTop: 4, marginBottom: 14 },
  logo: { fontSize: 30, fontWeight: 'bold', color: COLORS.ink },
  slogan: { fontSize: 14, color: COLORS.quiet, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.paper, borderRadius: 16, padding: 4, marginBottom: 12 },
  tab: { flex: 1, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  tabOn: { backgroundColor: COLORS.tabOn },
  tabText: { fontSize: 15, color: COLORS.quiet },
  tabTextOn: { color: '#FFFFFF', fontWeight: 'bold' },
  box: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20 },
  boxText: { fontSize: 16, color: COLORS.ink },
  buttonRow: { flexDirection: 'row', marginTop: 16 },
  button: {
    flex: 1,
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  subButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  subButtonText: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold' },
})
