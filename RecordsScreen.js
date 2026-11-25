import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import CardList from './CardList'
import CalendarView from './CalendarView'
import StatsView from './StatsView'
import { COLORS } from './common'

const VIEWS = [
  { id: 'cards', label: '목록' },
  { id: 'calendar', label: '달력' },
  { id: 'stats', label: '통계' },
]

// 나의 기록: 목록(날씨 카드) / 달력(날씨 아이콘 달력) / 통계(감정 통계)
export default function RecordsScreen({ records, commentLoadingId, onUpdatePieces, onDelete }) {
  const [view, setView] = useState('cards')

  return (
    <View style={styles.card}>
      <View style={styles.tabs}>
        {VIEWS.map((v) => (
          <TouchableOpacity style={[styles.tab, view == v.id ? styles.tabOn : null]} onPress={() => setView(v.id)}>
            <Text style={[styles.tabText, view == v.id ? styles.tabTextOn : null]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {view == 'cards' && (
        <CardList
          records={records}
          commentLoadingId={commentLoadingId}
          onUpdatePieces={onUpdatePieces}
          onDelete={onDelete}
        />
      )}
      {view == 'calendar' && <CalendarView records={records} />}
      {view == 'stats' && <StatsView records={records} />}

      <Text style={styles.note}>시연용 버전이라 새로고침하면 기록이 처음 상태로 돌아가요.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.paper, borderRadius: 14, padding: 4, marginBottom: 14 },
  tab: { flex: 1, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tabOn: { backgroundColor: COLORS.subTabOn },
  tabText: { fontSize: 14, color: COLORS.quiet },
  tabTextOn: { color: COLORS.ink, fontWeight: 'bold' },
  note: { fontSize: 11, color: COLORS.quiet, marginTop: 14 },
})
