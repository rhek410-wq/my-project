// mock 데이터베이스: axios-mock-adapter가 메모리에 들고 있는 데이터
// 새로고침하면 초기 데이터로 돌아간다

const now = Date.now()
const day = 24 * 60 * 60 * 1000
const iso = (t) => new Date(t).toISOString()

export const db = {
  members: [
    { id: 1, username: 'admin', password: 'admin1234', name: '관리자', role: 'ADMIN', createdAt: iso(now - 30 * day) },
    { id: 2, username: 'user1', password: 'user1234', name: '홍길동', role: 'USER', createdAt: iso(now - 20 * day) },
    { id: 3, username: 'user2', password: 'user1234', name: '김철수', role: 'USER', createdAt: iso(now - 10 * day) },
  ],
  posts: [
    { id: 1, title: '게시판 이용 안내', content: '게시판을 이용할 때는 서로 예의를 지켜 주세요.', authorId: 1, authorName: '관리자', views: 42, createdAt: iso(now - 9 * day), updatedAt: iso(now - 9 * day), votes: { 2: 'up', 3: 'up' } },
    { id: 2, title: '안녕하세요, 첫 글입니다', content: '반갑습니다. 잘 부탁드립니다!', authorId: 2, authorName: '홍길동', views: 15, createdAt: iso(now - 7 * day), updatedAt: iso(now - 6 * day), votes: { 1: 'up', 3: 'up' } },
    { id: 3, title: 'React 공부 중입니다', content: 'useEffect가 어렵네요. 좋은 자료 있으면 추천해 주세요.', authorId: 3, authorName: '김철수', views: 8, createdAt: iso(now - 5 * day), updatedAt: iso(now - 5 * day), votes: { 2: 'up' } },
    { id: 4, title: 'axios 사용법 정리', content: 'axios.create로 인스턴스를 만들고 interceptor로 토큰을 붙이면 편합니다.', authorId: 2, authorName: '홍길동', views: 23, createdAt: iso(now - 3 * day), updatedAt: iso(now - 2 * day), votes: { 1: 'up', 3: 'down' } },
    { id: 5, title: '정기 점검 공지', content: '이번 주 금요일 22시부터 1시간 동안 점검이 있습니다.', authorId: 1, authorName: '관리자', views: 5, createdAt: iso(now - 1 * day), updatedAt: iso(now - 1 * day), votes: {} },
    { id: 6, title: '운영자님께 문의드립니다', content: '회원 정보 수정은 어떻게 하나요? (비공개 글)', authorId: 3, authorName: '김철수', views: 1, isPrivate: true, createdAt: iso(now - 0.5 * day), updatedAt: iso(now - 0.5 * day), votes: {} },
  ],
  comments: [
    { id: 1, postId: 1, content: '네, 알겠습니다!', authorId: 2, authorName: '홍길동', createdAt: iso(now - 8 * day), updatedAt: iso(now - 8 * day), votes: { 3: 'up' } },
    { id: 2, postId: 2, content: '반가워요 😊', authorId: 3, authorName: '김철수', createdAt: iso(now - 6 * day), updatedAt: iso(now - 6 * day), votes: { 2: 'up', 1: 'up' } },
    { id: 3, postId: 3, content: '공식 문서의 "You Might Not Need an Effect" 글을 추천해요.', authorId: 2, authorName: '홍길동', createdAt: iso(now - 4 * day), updatedAt: iso(now - 4 * day), votes: { 3: 'up', 1: 'up' } },
    { id: 4, postId: 3, content: '감사합니다! 읽어 볼게요.', authorId: 3, authorName: '김철수', createdAt: iso(now - 4 * day), updatedAt: iso(now - 3 * day), votes: {} },
  ],
}

export function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
