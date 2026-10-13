// 클라이언트 검증 규칙 (서버 검증과 같게 맞춘다). 문제가 있으면 첫 번째 메시지를, 없으면 ''를 돌려준다.
import { GENDERS } from './format'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value) {
  if (!DATE_RE.test(value)) return false
  // 2026-02-31 처럼 없는 날짜를 거른다
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

function checkUserName(userName) {
  if (!userName.trim()) return '이름을 입력해 주세요.'
  if (userName.length > 50) return '이름은 50자 이하로 입력해 주세요.'
  return ''
}

function checkBirthGender({ birthDate, gender }) {
  if (!birthDate) return '생년월일을 입력해 주세요.'
  if (!isValidDate(birthDate)) return '생년월일은 YYYY-MM-DD 형식으로 입력해 주세요.'
  if (!GENDERS.includes(gender)) return '성별을 선택해 주세요.'
  return ''
}

function checkPassword(password, passwordConfirm) {
  if (password.length < 8 || password.length > 100) return '비밀번호는 8~100자로 입력해 주세요.'
  if (password !== passwordConfirm) return '비밀번호 확인이 일치하지 않습니다.'
  return ''
}

export function validateSignup(form) {
  if (!form.userId.trim()) return '아이디를 입력해 주세요.'
  if (form.userId.length < 4 || form.userId.length > 50) return '아이디는 4~50자로 입력해 주세요.'
  return (
    checkPassword(form.password, form.passwordConfirm) ||
    checkUserName(form.userName) ||
    checkBirthGender(form)
  )
}

// 회원 정보 수정: 비밀번호는 입력했을 때만 검사한다
export function validateUserUpdate(form) {
  return (
    checkUserName(form.userName) ||
    checkBirthGender(form) ||
    (form.password ? checkPassword(form.password, form.passwordConfirm) : '')
  )
}

export function validateBoard({ title, content }) {
  if (!title.trim()) return '제목을 입력해 주세요.'
  if (title.length > 200) return '제목은 200자 이하로 입력해 주세요.'
  if (!content.trim()) return '내용을 입력해 주세요.'
  return ''
}
