// JWT payload 읽기 (서명 검증은 서버가 한다. 화면에서는 sub·exp만 참고용으로 읽는다)
export function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// 로그인한 userId (sub 클레임)
export function getTokenUserId(token) {
  return decodeToken(token)?.sub ?? null
}

// 만료 시각(ms). exp가 없으면 null
export function getTokenExpiry(token) {
  const exp = decodeToken(token)?.exp
  return exp ? exp * 1000 : null
}
