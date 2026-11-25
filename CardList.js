import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import WeatherCard from './WeatherCard'
import PiecesScreen from './PiecesScreen'
import { decideEmotion, UNKNOWN } from './emotions'
import { toKoreanDate, COLORS } from './common'

const PAGE_SIZE = 4 // 한 번에 보여 줄 카드 수

// 카드 목록: 최신순으로 4개씩 보여 주고, 누르면 날씨 카드 상세
// 상세에서 조각 다시 고르기(수정)와 삭제를 할 수 있다
export default function CardList({ records, commentLoadingId, onUpdatePieces, onDelete }) {
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState(null)   // 상세로 연 기록
  const [editing, setEditing] = useState(false) // 조각 다시 고르는 중
  const [confirmDelete, setConfirmDelete] = useState(false)

  const open = records.filter((r) => r.id == openId)[0]

  const closeDetail = () => {
    setOpenId(null)
    setEditing(false)
    setConfirmDelete(false)
  }

  // ── 조각 다시 고르기 (수정) ──
  if (open && editing) {
    return (
      <PiecesScreen
        diary={open.diary}
        aiPieces={open.pieces.map((name) => ({ name, reason: '' }))}
        title="그날 고른 마음 조각"
        backLabel="취소"
        onConfirm={(names) => {
          onUpdatePieces(open.id, names)
          setEditing(false)
        }}
        onBack={() => setEditing(false)}
      />
    )
  }

  // ── 상세: 날씨 카드 ──
  if (open) {
    const onPressDelete = () => {
      if (!confirmDelete) {
        setConfirmDelete(true) // 한 번 더 누르면 삭제
        return
      }
      onDelete(open.id)
      closeDetail()
    }
    // '2026-11-22' → '2026. 11. 22.'
    const dotDate = `${open.date.slice(0, 4)}. ${Number(open.date.slice(5, 7))}. ${Number(open.date.slice(8, 10))}.`

    return (
      <View>
        <WeatherCard record={open} commentLoading={commentLoadingId == open.id} />

        <View style={styles.diaryBox}>
          <Text style={styles.diaryLabel}>그날의 일기</Text>
          <Text style={styles.diaryText}>{open.diary}</Text>
        </View>
        <View style={styles.divider} />

        {/* 날짜 · 삭제 */}
        <View style={styles.infoRow}>
          <Text style={styles.date}>📅 {dotDate}</Text>
          <TouchableOpacity onPress={onPressDelete}>
            <Text style={styles.delete}>🗑 {confirmDelete ? '한 번 더 누르면 삭제' : '삭제'}</Text>
          </TouchableOpacity>
        </View>

        {/* 목록으로 · 조각 다시 고르기 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineButton} onPress={closeDetail}>
            <Text style={styles.outlineText}>← 목록으로</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fillButton} onPress={() => setEditing(true)}>
            <Text style={styles.fillText}>✨ 조각 다시 고르기</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── 목록 ──
  const sorted = [...records].sort((a, b) => (a.date == b.date ? b.id - a.id : a.date < b.date ? 1 : -1)) // 최신순
  const lastPage = Math.max(0, Math.ceil(sorted.length / PAGE_SIZE) - 1)
  const nowPage = Math.min(page, lastPage)
  const shown = sorted.slice(nowPage * PAGE_SIZE, nowPage * PAGE_SIZE + PAGE_SIZE)

  return (
    <View>
      <Text style={styles.title}>나의 날씨 카드 {records.length}장</Text>
      {records.length == 0 && <Text style={styles.help}>아직 기록이 없어요. 오늘의 마음을 먼저 적어 보세요.</Text>}

      {shown.map((r) => {
        const emotion = decideEmotion(r.pieces) || UNKNOWN
        return (
          <TouchableOpacity style={[styles.item, { backgroundColor: emotion.color }]} onPress={() => setOpenId(r.id)}>
            <Text style={styles.itemIcon}>{emotion.icon}</Text>
            <View style={styles.itemBody}>
              <Text style={styles.itemDate}>{toKoreanDate(r.date)} · {emotion.weather}</Text>
              <Text style={styles.itemPieces}>{r.pieces.length > 0 ? r.pieces.join(', ') : UNKNOWN.label}</Text>
            </View>
          </TouchableOpacity>
        )
      })}

      {lastPage > 0 && (
        <View style={styles.pager}>
          <TouchableOpacity onPress={() => setPage(Math.max(0, nowPage - 1))}>
            <Text style={[styles.link, nowPage == 0 ? styles.disabled : null]}>‹ 이전</Text>
          </TouchableOpacity>
          <Text style={styles.pageText}>{nowPage + 1} / {lastPage + 1}</Text>
          <TouchableOpacity onPress={() => setPage(Math.min(lastPage, nowPage + 1))}>
            <Text style={[styles.link, nowPage == lastPage ? styles.disabled : null]}>다음 ›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.ink },
  help: { fontSize: 13, color: COLORS.quiet, marginTop: 6 },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginTop: 10 },
  itemIcon: { fontSize: 30, marginRight: 12 },
  itemBody: { flex: 1 },
  itemDate: { fontSize: 13, color: COLORS.ink },
  itemPieces: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink, marginTop: 2 },
  pager: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  pageText: { fontSize: 13, color: COLORS.quiet },
  link: { fontSize: 14, color: COLORS.accent, marginTop: 12 },
  disabled: { color: '#D2CCC4' },
  diaryBox: { marginTop: 16, paddingLeft: 6, paddingRight: 6 },
  diaryLabel: { fontSize: 13, color: COLORS.accent },
  diaryText: { fontSize: 17, color: COLORS.ink, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.line, marginTop: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  date: { fontSize: 14, color: COLORS.quiet },
  delete: { fontSize: 14, color: COLORS.danger },
  buttonRow: { flexDirection: 'row', marginTop: 12 },
  outlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  outlineText: { fontSize: 15, color: COLORS.accent, fontWeight: 'bold' },
  fillButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  fillText: { fontSize: 15, color: '#FFFFFF', fontWeight: 'bold' },
})
