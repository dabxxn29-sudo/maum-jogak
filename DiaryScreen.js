import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { todayString, toKoreanDate, COLORS, MAX_LENGTH } from './common'

// 1번 화면: 오늘의 한 줄 일기 쓰기
export default function DiaryScreen({ onSave }) {
  const [text, setText] = useState('')

  // 글자 수 제한: 50자를 넘으면 입력을 받지 않는다
  const onChangeText = (value) => {
    if (value.length <= MAX_LENGTH) setText(value)
  }

  const onPressSave = () => {
    if (text.trim() == '') {
      alert('오늘 하루를 한 줄로 적어 주세요.')
      return
    }
    onSave(text.trim())
  }

  return (
    <View style={styles.card}>
      <Text style={styles.date}>{toKoreanDate(todayString())}</Text>
      <Text style={styles.question}>오늘 하루, 어떤 마음이었나요?</Text>
      <Text style={styles.guide}>있었던 일이나 느낀 점을 한 줄로 편하게 적어 주세요.</Text>

      <TextInput
        style={styles.input}
        value={text}
        multiline
        onChangeText={onChangeText}
      />

      <View style={styles.countRow}>
        <Text style={styles.count}>{text.length} / {MAX_LENGTH}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onPressSave}>
        <Text style={styles.buttonText}>마음 조각 찾기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
  },
  date: { fontSize: 14, color: COLORS.quiet },
  question: { fontSize: 22, fontWeight: 'bold', color: COLORS.ink, marginTop: 6 },
  guide: { fontSize: 14, color: COLORS.quiet, marginTop: 6 },
  input: {
    height: 110,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paper,
    fontSize: 16,
    color: COLORS.ink,
  },
  countRow: { alignItems: 'flex-end', marginTop: 6 },
  count: { fontSize: 12, color: COLORS.quiet },
  button: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
})
