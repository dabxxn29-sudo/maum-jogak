import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { setApiKey } from './llmapi_groq'
import { COLORS } from './common'

// 배포 사이트에서만 나오는 화면: AI 키 입력
// 키는 useState와 메모리에만 있고, 어디에도 저장되지 않는다
export default function KeyScreen({ onReady }) {
  const [key, setKey] = useState('')

  const onStart = () => {
    const value = key.trim()
    if (value.slice(0, 4) != 'gsk_') {
      alert('Groq API 키는 gsk_로 시작해요. 다시 확인해 주세요.')
      return
    }
    setApiKey(value)
    setKey('') // 화면에 남지 않도록 지우기
    onReady()
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI 키를 입력해 주세요</Text>
      <Text style={styles.guide}>
        마음조각은 AI로 일기 속 감정 조각을 찾아요. 시연용 Groq API 키(gsk_로 시작)를 붙여 넣어 주세요.
      </Text>

      <TextInput style={styles.input} value={key} onChangeText={(text) => setKey(text)} />

      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>

      <Text style={styles.note}>키는 저장되지 않아요. 새로고침하면 다시 입력해야 해요.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.ink },
  guide: { fontSize: 14, color: COLORS.quiet, marginTop: 8 },
  input: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paper,
    fontSize: 14,
    color: COLORS.ink,
  },
  button: {
    backgroundColor: COLORS.accent,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  note: { fontSize: 12, color: COLORS.quiet, marginTop: 12 },
})
