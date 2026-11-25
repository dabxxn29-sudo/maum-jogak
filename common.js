// 마음조각에서 함께 쓰는 날짜 함수와 색상

// 숫자를 두 자리 문자로: 3 -> '03'
const two = (n) => (n < 10 ? '0' + n : '' + n)

// Date 객체 → '2026-11-22'
// (toISOString()은 시간대 때문에 날짜가 하루 밀릴 수 있어서 쓰지 않는다)
export const toDateString = (d) =>
  d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate())

// 오늘 날짜 문자열
export const todayString = () => toDateString(new Date())

// n일 전 날짜 문자열 (시연용 예시 기록에 사용)
export const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateString(d)
}

// '2026-11-22' -> '11월 22일'
export const toKoreanDate = (dateString) =>
  Number(dateString.slice(5, 7)) + '월 ' + Number(dateString.slice(8, 10)) + '일'

export const COLORS = {
  sky: '#CFE6F7',     // 전체 배경 (마음날씨 하늘색)
  paper: '#F3F8FC',   // 카드 안쪽 옅은 배경
  card: '#FFFFFF',
  ink: '#2F4A60',     // 진한 글자
  quiet: '#6E8597',   // 흐린 글자
  accent: '#4F86B5',  // 버튼 색
  line: '#D9E6F0',
  tabBg: '#E6F2FB',   // 탭 바 배경
  today: '#EAF3FB',   // 달력 오늘 칸
  tabOn: '#A7CDEE',   // 선택된 큰 탭
  subTabOn: '#D3E7F8', // 선택된 작은 탭
  danger: '#D9534F',  // 삭제
}

// 한 줄 일기 최대 글자 수
export const MAX_LENGTH = 50
