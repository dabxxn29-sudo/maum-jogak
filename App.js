import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import DiaryScreen from './DiaryScreen'
import KeyScreen from './KeyScreen'
import { hasApiKey } from './llmapi_groq'
import { findPieces } from './pieceAi'
import { findEmotionByPiece } from './emotions'
import { COLORS } from './common'

export default function App() {
  // 지금 보여 줄 화면: 'write'(일기 쓰기) → 'pieces'(조각 확인, 5단계에서 완성)
  const [screen, setScreen] = useState('write')
  const [diary, setDiary] = useState('')
  const [pieces, setPieces] = useState([]) // AI가 찾은 조각
  const [loading, setLoading] = useState(false)
  const [keyReady, setKeyReady] = useState(hasApiKey()) // AI 키 준비 여부

  const onSave = (text) => {
    setDiary(text)
    setPieces([])
    setScreen('pieces')
    setLoading(true)
    findPieces(text, (result) => {
      setPieces(result)
      setLoading(false)
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>마음조각</Text>
        <Text style={styles.slogan}>오늘의 마음을 조각조각 들여다보기</Text>
      </View>

      {/* 키가 없으면(배포 사이트) 먼저 키 입력 화면 */}
      {!keyReady && <KeyScreen onReady={() => setKeyReady(true)} />}

      {keyReady && screen == 'write' && <DiaryScreen onSave={onSave} />}

      {/* 4단계 확인용 임시 화면 (5단계에서 조각 확인 화면으로 바뀜) */}
      {keyReady && screen == 'pieces' && (
        <View style={styles.temp}>
          <Text style={styles.tempLabel}>오늘의 일기</Text>
          <Text style={styles.tempText}>{diary}</Text>

          {loading && <Text style={styles.loading}>AI가 마음 조각을 찾고 있어요...</Text>}

          {!loading && pieces.length == 0 && (
            <Text style={styles.loading}>조각을 찾지 못했어요. 키 설정이나 인터넷 연결을 확인해 주세요.</Text>
          )}

          {pieces.map((p) => (
            <View style={[styles.piece, { backgroundColor: findEmotionByPiece(p.name).color }]}>
              <Text style={styles.pieceName}>
                {findEmotionByPiece(p.name).icon} {p.name}
              </Text>
              <Text style={styles.reason}>근거: "{p.reason}"</Text>
            </View>
          ))}

          <TouchableOpacity onPress={() => setScreen('write')}>
            <Text style={styles.back}>다시 쓰기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper, paddingTop: 56, paddingLeft: 16, paddingRight: 16 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 30, fontWeight: 'bold', color: COLORS.ink },
  slogan: { fontSize: 14, color: COLORS.quiet, marginTop: 4 },
  temp: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20 },
  tempLabel: { fontSize: 14, color: COLORS.quiet },
  tempText: { fontSize: 18, color: COLORS.ink, marginTop: 8, marginBottom: 12 },
  loading: { fontSize: 14, color: COLORS.quiet, marginTop: 8 },
  piece: { borderRadius: 14, padding: 12, marginTop: 8 },
  pieceName: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink },
  reason: { fontSize: 13, color: COLORS.ink, marginTop: 4 },
  back: { fontSize: 15, color: COLORS.accent, marginTop: 16 },
})
