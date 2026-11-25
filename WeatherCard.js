import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { decideEmotion, findEmotionByPiece, UNKNOWN } from './emotions'
import { KINDS } from './pieceAi'
import { toKoreanDate, COLORS } from './common'

// 3번 화면: 날씨 카드
// 앞면: 날짜, 날씨, 고른 조각 (일기 원문은 보여 주지 않는다)
// 뒷면: 오늘 마음에 건네는 AI의 작은 추천 (카드를 누르면 뒤집힌다)
export default function WeatherCard({ record, commentLoading }) {
  const [back, setBack] = useState(false)

  const emotion = decideEmotion(record.pieces) || UNKNOWN

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: emotion.color }]}
      onPress={() => setBack(!back)}
    >
      {/* 앞면 */}
      {!back && (
        <View style={styles.face}>
          <Text style={styles.date}>{toKoreanDate(record.date)}</Text>
          <Text style={styles.icon}>{emotion.icon}</Text>
          <Text style={styles.weather}>오늘의 마음날씨 · {emotion.weather}</Text>

          <View style={styles.pieceRow}>
            {record.pieces.length == 0 && <Text style={styles.piece}>{UNKNOWN.label}</Text>}
            {record.pieces.map((name) => (
              <Text style={[styles.piece, { borderColor: findEmotionByPiece(name).color }]}>
                {findEmotionByPiece(name).icon} {name}
              </Text>
            ))}
          </View>

          <View style={styles.hintPill}>
            <Text style={styles.hint}>카드를 눌러 오늘의 작은 추천 보기</Text>
          </View>
        </View>
      )}

      {/* 뒷면: 오늘 마음에 건네는 작은 추천 */}
      {back && (
        <View style={styles.face}>
          {commentLoading && <Text style={styles.reason}>오늘의 추천을 고르고 있어요...</Text>}
          {!commentLoading && record.comment == null && (
            <Text style={styles.reason}>추천을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</Text>
          )}
          {!commentLoading && record.comment != null && (
            <View style={styles.face}>
              <Text style={styles.backTitle}>
                {KINDS[record.comment.kind] || '🌤'} 오늘의 작은 추천{record.comment.kind != '' ? ` · ${record.comment.kind}` : ''}
              </Text>
              {record.comment.item != '' && <Text style={styles.menu}>{record.comment.item}</Text>}
              {record.comment.reason != '' && <Text style={styles.reason}>{record.comment.reason}</Text>}
              {record.comment.line != '' && <Text style={styles.line}>“{record.comment.line}”</Text>}
            </View>
          )}
          <View style={styles.hintPill}>
            <Text style={styles.hint}>다시 누르면 앞면으로 돌아가요</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 24, height: 340 },
  face: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  date: { fontSize: 14, color: COLORS.ink },
  icon: { fontSize: 72, marginTop: 8 },
  weather: { fontSize: 18, fontWeight: 'bold', color: COLORS.ink, marginTop: 8 },
  pieceRow: { flexDirection: 'row', marginTop: 16 },
  piece: {
    margin: 4,
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.card,
    backgroundColor: COLORS.card,
    fontSize: 14,
    color: COLORS.ink,
  },
  hintPill: { backgroundColor: COLORS.subTabOn, borderRadius: 8, padding: 6, marginTop: 20 },
  hint: { fontSize: 12, color: COLORS.accent },
  backTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink },
  menu: { fontSize: 26, fontWeight: 'bold', color: COLORS.ink, marginTop: 16 },
  reason: { fontSize: 15, color: COLORS.ink, marginTop: 10 },
  line: { fontSize: 15, color: COLORS.ink, marginTop: 14 },
})
