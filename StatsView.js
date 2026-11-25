import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { EMOTIONS, findEmotionByPiece, UNKNOWN } from './emotions'
import { todayString, COLORS } from './common'

// 이번 달 감정 통계
// 1) 조각 격자 그래프: 10×10 = 100칸을 기본 감정 비율만큼 색칠 (원형 그래프 대신, View만 사용)
// 2) 감정 단어 통계: 이번 달 고른 조각 단어와 횟수
export default function StatsView({ records }) {
  const [openWord, setOpenWord] = useState(null)

  // 이번 달 기록만: '2026-11'로 시작하는 날짜
  const prefix = todayString().slice(0, 7)
  const monthly = records.filter((r) => r.date.slice(0, 7) == prefix)

  // ── 기본 감정별 조각 수 세기 ──
  const groups = [...EMOTIONS, { ...UNKNOWN, id: 'unknown' }].map((e) => ({ ...e, count: 0 }))
  for (const r of monthly) {
    if (r.pieces.length == 0) groups[groups.length - 1].count += 1 // 잘 모르겠어요
    for (const name of r.pieces) {
      const emotion = findEmotionByPiece(name)
      groups.filter((g) => g.id == emotion.id)[0].count += 1
    }
  }
  let total = 0
  for (const g of groups) total += g.count

  // ── 100칸 나누기 (반올림 오차는 나머지가 큰 감정부터 1칸씩 보충) ──
  const parts = groups.filter((g) => g.count > 0).map((g) => {
    const exact = (g.count / total) * 100
    return { ...g, cells: Math.floor(exact), rest: exact - Math.floor(exact) }
  })
  let used = 0
  for (const p of parts) used += p.cells
  const byRest = [...parts].sort((a, b) => b.rest - a.rest)
  for (let i = 0; i < 100 - used; i++) byRest[i % byRest.length].cells += 1

  const cells = []
  for (const p of parts) {
    for (let i = 0; i < p.cells; i++) cells.push(p.color)
  }
  const rows = []
  for (let i = 0; i < cells.length; i += 10) rows.push(cells.slice(i, i + 10))

  // ── 감정 단어별 횟수 ──
  const words = []
  for (const r of monthly) {
    for (const name of r.pieces) {
      const found = words.filter((w) => w.name == name)[0]
      if (found) found.count += 1
      else words.push({ name, count: 1 })
    }
  }
  words.sort((a, b) => b.count - a.count) // 많이 쓴 순서
  let allPieces = 0
  for (const e of EMOTIONS) allPieces += e.pieces.length

  const openEmotion = openWord ? findEmotionByPiece(openWord) : null
  const openMeaning = openEmotion ? openEmotion.pieces.filter((p) => p.name == openWord)[0].meaning : ''

  if (monthly.length == 0) {
    return (
      <View>
        <Text style={styles.title}>이번 달 감정 통계</Text>
        <Text style={styles.help}>아직 이번 달 기록이 없어요. 오늘의 마음을 먼저 적어 보세요.</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.title}>이번 달 감정 통계</Text>
      <Text style={styles.help}>이번 달 고른 마음 조각 {total}개를 100칸으로 나타냈어요.</Text>

      {/* 조각 격자 그래프 */}
      <View style={styles.gridWrap}>
        <View style={styles.grid}>
          {rows.map((row) => (
            <View style={styles.gridRow}>
              {row.map((c) => (
                <View style={[styles.cell, { backgroundColor: c }]} />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* 감정별 비율 */}
      {[parts.slice(0, 4), parts.slice(4, 8)].map((line) => (
        <View style={styles.legendRow}>
          {line.map((p) => (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: p.color }]} />
              <Text style={styles.legendText}>{p.icon} {p.id == 'unknown' ? '모름' : p.label} {p.cells}%</Text>
            </View>
          ))}
        </View>
      ))}

      {/* 감정 단어 통계 */}
      <Text style={styles.section}>사용한 감정 단어 {words.length}개</Text>
      <Text style={styles.help}>감정 사전의 조각 {allPieces}개 중 {words.length}개를 써 봤어요. 단어를 누르면 뜻이 보여요.</Text>

      {[words.slice(0, 3), words.slice(3, 6)].map((row) => (
        <View style={styles.chipRow}>
          {row.map((w) => (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: findEmotionByPiece(w.name).color }, openWord == w.name ? styles.chipOn : null]}
              onPress={() => setOpenWord(openWord == w.name ? null : w.name)}
            >
              <Text style={styles.chipText}>{w.name} · {w.count}번</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {openWord != null && (
        <View style={styles.meaning}>
          <Text style={styles.meaningTitle}>{openEmotion.icon} {openWord} ({openEmotion.label})</Text>
          <Text style={styles.meaningText}>{openMeaning}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.ink },
  help: { fontSize: 13, color: COLORS.quiet, marginTop: 4 },
  gridWrap: { alignItems: 'center', marginTop: 14 },
  grid: { width: 240, padding: 6, borderRadius: 14, backgroundColor: COLORS.paper },
  gridRow: { flexDirection: 'row' },
  cell: { flex: 1, height: 21, margin: 1, borderRadius: 4 },
  legendRow: { flexDirection: 'row', marginTop: 10 },
  legendItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 12, height: 12, borderRadius: 3, marginRight: 4 },
  legendText: { fontSize: 12, color: COLORS.ink },
  section: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink, marginTop: 20 },
  chipRow: { flexDirection: 'row', marginTop: 6 },
  chip: { flex: 1, margin: 3, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: COLORS.card },
  chipOn: { borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.ink },
  meaning: { marginTop: 10, padding: 12, borderRadius: 14, backgroundColor: COLORS.paper },
  meaningTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.ink },
  meaningText: { fontSize: 14, color: COLORS.ink, marginTop: 4 },
})
