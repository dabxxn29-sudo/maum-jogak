import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { EMOTIONS, findEmotionByPiece } from './emotions'
import { COLORS } from './common'

const MAX_PIECES = 3 // 한 번에 고를 수 있는 조각 수

// 2번 화면: AI가 찾은 조각 확인하기
// - AI 조각은 모두 선택된 채로 시작하고, 누르면 빠졌다 들어갔다 한다
// - 감정 사전에서 다른 조각을 직접 더할 수 있다
// - "잘 모르겠어요"를 고를 수도 있다
export default function PiecesScreen({
  diary, aiPieces, onConfirm, onBack,
  title = 'AI가 찾은 마음 조각', backLabel = '일기 다시 쓰기',
}) {
  const [selected, setSelected] = useState(aiPieces.map((p) => p.name))
  const [showMore, setShowMore] = useState(aiPieces.length == 0) // AI가 못 찾았으면 처음부터 열기
  const [openId, setOpenId] = useState(null) // 펼친 기본 감정

  // 조각 넣기/빼기
  const toggle = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n != name))
      return
    }
    if (selected.length >= MAX_PIECES) {
      alert(`조각은 ${MAX_PIECES}개까지 고를 수 있어요. 하나를 빼고 다시 골라 주세요.`)
      return
    }
    setSelected([...selected, name])
  }

  const onPressMake = () => {
    if (selected.length == 0) {
      alert('조각을 하나 이상 골라 주세요. 잘 모르겠다면 "잘 모르겠어요"를 눌러 주세요.')
      return
    }
    onConfirm(selected)
  }

  const openEmotion = EMOTIONS.filter((e) => e.id == openId)[0]

  return (
    <View style={styles.card}>
      <Text style={styles.label}>오늘의 일기</Text>
      <Text style={styles.diary}>"{diary}"</Text>

      <Text style={styles.section}>{title}</Text>
      <Text style={styles.help}>맞지 않는 조각은 눌러서 빼 주세요.</Text>

      {aiPieces.length == 0 && (
        <Text style={styles.help}>AI가 조각을 찾지 못했어요. 아래에서 직접 골라 주세요.</Text>
      )}

      {aiPieces.map((p) => {
        const on = selected.includes(p.name)
        const emotion = findEmotionByPiece(p.name)
        return (
          <TouchableOpacity
            style={[styles.aiPiece, on ? { backgroundColor: emotion.color, borderColor: emotion.color } : null]}
            onPress={() => toggle(p.name)}
          >
            <View style={styles.aiTop}>
              <Text style={[styles.aiName, on ? null : styles.off]}>{emotion.icon} {p.name}</Text>
              <Text style={[styles.check, on ? null : styles.off]}>{on ? '✓ 선택' : '빠짐'}</Text>
            </View>
            <Text style={[styles.reason, on ? null : styles.off]}>{p.reason}</Text>
          </TouchableOpacity>
        )
      })}

      {/* 감정 사전에서 직접 더하기 */}
      <TouchableOpacity onPress={() => setShowMore(!showMore)}>
        <Text style={styles.link}>{showMore ? '조각 더하기 닫기' : '+ 다른 조각 더하기'}</Text>
      </TouchableOpacity>

      {showMore && (
        <View>
          {[EMOTIONS.slice(0, 3), EMOTIONS.slice(3, 6)].map((row) => (
            <View style={styles.row}>
              {row.map((e) => (
                <TouchableOpacity
                  style={[styles.emotion, { backgroundColor: e.color }, openId == e.id ? styles.emotionOn : null]}
                  onPress={() => setOpenId(openId == e.id ? null : e.id)}
                >
                  <Text style={styles.emotionText}>{e.icon} {e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {openEmotion && (
            <View style={styles.row}>
              {openEmotion.pieces.map((p) => (
                <TouchableOpacity
                  style={[styles.chip, selected.includes(p.name) ? { backgroundColor: openEmotion.color } : null]}
                  onPress={() => toggle(p.name)}
                >
                  <Text style={styles.chipText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <Text style={styles.count}>고른 조각 {selected.length} / {MAX_PIECES}</Text>

      <TouchableOpacity style={styles.button} onPress={onPressMake}>
        <Text style={styles.buttonText}>이 조각들로 날씨 카드 만들기</Text>
      </TouchableOpacity>

      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.link}>{backLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onConfirm([])}>
          <Text style={styles.link}>잘 모르겠어요</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
  },
  label: { fontSize: 13, color: COLORS.quiet },
  diary: { fontSize: 17, color: COLORS.ink, marginTop: 6 },
  section: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink, marginTop: 18 },
  help: { fontSize: 13, color: COLORS.quiet, marginTop: 4 },
  aiPiece: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    padding: 12,
    marginTop: 8,
  },
  aiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiName: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink },
  check: { fontSize: 13, color: COLORS.ink },
  reason: { fontSize: 13, color: COLORS.ink, marginTop: 4 },
  off: { color: '#B8B2AA' },
  link: { fontSize: 14, color: COLORS.accent, marginTop: 14 },
  row: { flexDirection: 'row', marginTop: 8 },
  emotion: { flex: 1, margin: 3, padding: 8, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: COLORS.card },
  emotionOn: { borderColor: COLORS.accent },
  emotionText: { fontSize: 13, color: COLORS.ink },
  chip: {
    flex: 1,
    margin: 3,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
  },
  chipText: { fontSize: 13, color: COLORS.ink },
  count: { fontSize: 13, color: COLORS.quiet, marginTop: 16 },
  button: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
})
