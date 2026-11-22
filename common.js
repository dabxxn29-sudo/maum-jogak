// 마음조각에서 함께 쓰는 날짜 함수와 색상

// 숫자를 두 자리 문자로: 3 -> '03'
const two = (n) => (n < 10 ? '0' + n : '' + n)

// 오늘 날짜 문자열: '2026-11-22'
// (toISOString()은 시간대 때문에 날짜가 하루 밀릴 수 있어서 쓰지 않는다)
export const todayString = () => {
  const t = new Date()
  return t.getFullYear() + '-' + two(t.getMonth() + 1) + '-' + two(t.getDate())
}

// '2026-11-22' -> '11월 22일'
export const toKoreanDate = (dateString) =>
  Number(dateString.slice(5, 7)) + '월 ' + Number(dateString.slice(8, 10)) + '일'

export const COLORS = {
  paper: '#F7F4EF',   // 배경
  card: '#FFFFFF',
  ink: '#3A3A3A',     // 진한 글자
  quiet: '#8A8580',   // 흐린 글자
  accent: '#7A6FD0',  // 버튼 색
  line: '#E6E1DA',
}

// 한 줄 일기 최대 글자 수
export const MAX_LENGTH = 50
