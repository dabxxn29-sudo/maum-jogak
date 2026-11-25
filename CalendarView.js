import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { decideEmotion, UNKNOWN } from './emotions'
import { toDateString, toKoreanDate, todayString, COLORS } from './common'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

// 마음 달력 (마음날씨 캘린더 양식)
// 날짜 칸에 그날의 날씨 아이콘을 보여 주고, 누르면 그날 고른 조각이 아래에 나온다
export default function CalendarView({ records }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0~11
  const [selectedDate, setSelectedDate] = useState(null)

  const today = todayString()

  // 이전 달 / 다음 달
  const onMove = (diff) => {
    const d = new Date(year, month + diff, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedDate(null)
  }

  // 달력 칸: 1일 앞은 빈칸(0), 마지막 주도 7칸이 되도록 빈칸 추가
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(0)
  for (let d = 1; d <= lastDate; d++) cells.push(d)
  while (cells.length % 7 != 0) cells.push(0)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const selectedRecords = records.filter((r) => r.date == selectedDate)

  return (
    <View>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.arrow} onPress={() => onMove(-1)}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{year}년 {month + 1}월</Text>
        <TouchableOpacity style={styles.arrow} onPress={() => onMove(1)}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.week}>
        {DAY_NAMES.map((name) => (
          <View style={styles.dayName}>
            <Text style={styles.dayNameText}>{name}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week) => (
        <View style={styles.week}>
          {week.map((day) => {
            if (day == 0) return <View style={styles.cell} />
            const date = toDateString(new Date(year, month, day))
            const dayRecords = records.filter((r) => r.date == date)
            // 하루에 여러 장이면 가장 마지막에 쓴 카드의 날씨를 보여 준다
            const last = dayRecords[dayRecords.length - 1]
            const emotion = last ? decideEmotion(last.pieces) || UNKNOWN : null
            return (
              <TouchableOpacity
                style={[styles.cell, date == today ? styles.todayCell : null, date == selectedDate ? styles.selected : null]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayNumber, date > today ? styles.future : null]}>{day}</Text>
                <Text style={styles.icon}>{emotion ? emotion.icon : ''}</Text>
                {dayRecords.length > 1 && <Text style={styles.more}>+{dayRecords.length - 1}</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      ))}

      {selectedDate == null && <Text style={styles.hint}>날짜를 누르면 그날 고른 마음 조각을 볼 수 있어요.</Text>}

      {selectedDate != null && (
        <View style={styles.detail}>
          <Text style={styles.detailTitle}>{toKoreanDate(selectedDate)}</Text>
          {selectedRecords.length == 0 && <Text style={styles.detailText}>이날은 기록이 없어요.</Text>}
          {selectedRecords.map((r) => {
            const emotion = decideEmotion(r.pieces) || UNKNOWN
            return (
              <Text style={styles.detailText}>
                {emotion.icon} {r.pieces.length > 0 ? r.pieces.join(', ') : UNKNOWN.label}
              </Text>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  arrow: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  arrowText: { fontSize: 28, color: COLORS.accent },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.ink },
  week: { flexDirection: 'row' },
  dayName: { flex: 1, alignItems: 'center', marginBottom: 6 },
  dayNameText: { fontSize: 13, color: COLORS.quiet },
  cell: { flex: 1, height: 58, alignItems: 'center', paddingTop: 4, borderRadius: 12, borderWidth: 2, borderColor: COLORS.card },
  todayCell: { backgroundColor: COLORS.today },
  selected: { borderColor: COLORS.accent },
  dayNumber: { fontSize: 13, color: COLORS.ink },
  future: { color: '#C3CFD9' },
  icon: { fontSize: 20, marginTop: 2 },
  more: { fontSize: 10, color: COLORS.quiet },
  hint: { fontSize: 13, color: COLORS.quiet, marginTop: 12 },
  detail: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: COLORS.paper },
  detailTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.ink },
  detailText: { fontSize: 14, color: COLORS.ink, marginTop: 4 },
})
