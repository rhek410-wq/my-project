// 서버 일시 "2026-08-15T22:38:08.342277" (타임존 없음, KST) → "2026-08-15 22:38"
// 소수점 자릿수가 가변이라 Date로 변환하지 않고 문자열에서 바로 잘라 쓴다
export function formatDate(value) {
  if (!value) return '-'
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(value)
  return m ? `${m[1]} ${m[2]}` : value
}

export const GENDERS = ['남자', '여자']

export const LOADING_TEXT = '불러오는 중...'

// 게시글 응답에 작성자 userId가 없어서, 남의 글이면 서버 403(ACCESS_DENIED)을 받고 이 문구를 보여준다
export const NOT_WRITER_MESSAGE = '작성자만 수정/삭제할 수 있습니다.'
