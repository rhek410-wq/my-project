import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { db, nextId } from './db'

// axios 요청을 가짜 서버가 받아서 응답한다
export function setupMockServer() {
  const mock = new MockAdapter(api, { delayResponse: 300 })

  const ok = (data) => [200, data]
  const fail = (status, message) => [status, { message }]
  const idOf = (config) => Number(config.url.split('/').pop())
  const body = (config) => (config.data ? JSON.parse(config.data) : {})
  const nowIso = () => new Date().toISOString()
  const publicMember = ({ password, ...rest }) => rest

  // 토큰("mock-token-{회원id}")으로 로그인한 회원을 찾는다
  const currentUser = (config) => {
    const auth = config.headers?.Authorization || ''
    const match = auth.match(/^Bearer mock-token-(\d+)$/)
    return match ? db.members.find((m) => m.id === Number(match[1])) : null
  }

  // 로그인 확인 → 통과하면 handler 실행
  const auth = (handler, { adminOnly = false } = {}) => (config) => {
    const user = currentUser(config)
    if (!user) return fail(401, '로그인이 필요합니다.')
    if (adminOnly && user.role !== 'ADMIN') return fail(403, '운영자만 사용할 수 있습니다.')
    return handler(config, user)
  }

  // ---------- 인증 ----------
  mock.onPost('/auth/login').reply((config) => {
    const { username, password } = body(config)
    const user = db.members.find((m) => m.username === username && m.password === password)
    if (!user) return fail(401, '아이디 또는 비밀번호가 올바르지 않습니다.')
    return ok({ token: `mock-token-${user.id}`, user: publicMember(user) })
  })

  // ---------- 게시글 (조회: 누구나 / 등록: 로그인 / 수정·삭제: 본인 또는 운영자) ----------
  const canEditPost = (post, user) => user.role === 'ADMIN' || post.authorId === user.id
  const postIdOf = (config) => Number(config.url.match(/posts\/(\d+)/)[1])
  // 비공개 글은 운영자와 글쓴이 본인만 볼 수 있다
  const canViewPost = (post, user) =>
    !post.isPrivate || Boolean(user && (user.role === 'ADMIN' || post.authorId === user.id))
  // 게시글을 찾고 볼 수 있는지 확인한다 → { post } 또는 { error }
  const findViewablePost = (id, user) => {
    const post = db.posts.find((p) => p.id === id)
    if (!post) return { error: fail(404, '게시글을 찾을 수 없습니다.') }
    if (!canViewPost(post, user)) return { error: fail(403, '비공개 글입니다.') }
    return { post }
  }

  // 추천 수·비추천 수·내 표시 (게시글·댓글 공통)
  const voteSummary = (votes, user) => {
    const values = Object.values(votes)
    return {
      likes: values.filter((v) => v === 'up').length,
      dislikes: values.filter((v) => v === 'down').length,
      myVote: user ? votes[user.id] || null : null,
    }
  }
  // 같은 버튼을 다시 누르면 취소, 반대 버튼이면 바꾼다
  const toggleVote = (votes, userId, type) => {
    if (votes[userId] === type) delete votes[userId]
    else votes[userId] = type
  }

  // 응답용 게시글: votes 대신 추천 수·비추천 수·내 표시·댓글 수를 담는다
  const toPostDto = ({ votes, ...post }, user) => ({
    ...post,
    isPrivate: Boolean(post.isPrivate),
    ...voteSummary(votes, user),
    commentCount: db.comments.filter((c) => c.postId === post.id).length,
  })
  const toCommentDto = ({ votes, ...comment }, user) => ({ ...comment, ...voteSummary(votes, user) })

  mock.onGet('/posts').reply((config) => {
    const user = currentUser(config)
    return ok(
      db.posts
        .filter((p) => canViewPost(p, user)) // 볼 수 없는 비공개 글은 목록에서 뺀다
        .sort((a, b) => b.id - a.id)
        .map((p) => toPostDto(p, user))
    )
  })

  mock.onGet(/\/posts\/\d+$/).reply((config) => {
    const user = currentUser(config)
    const { post, error } = findViewablePost(idOf(config), user)
    if (error) return error
    // 수정 화면에서 불러올 때는 조회수를 올리지 않는다
    if (!config.params?.noView) post.views += 1
    return ok(toPostDto(post, user))
  })

  mock.onPost('/posts').reply(
    auth((config, user) => {
      const { title, content, isPrivate } = body(config)
      if (!title?.trim()) return fail(400, '제목을 입력해 주세요.')
      const post = {
        id: nextId(db.posts),
        title,
        content: content || '',
        authorId: user.id,
        authorName: user.name,
        views: 0,
        isPrivate: Boolean(isPrivate),
        votes: {},
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      db.posts.push(post)
      return [201, toPostDto(post, user)]
    })
  )

  mock.onPut(/\/posts\/\d+$/).reply(
    auth((config, user) => {
      const post = db.posts.find((p) => p.id === idOf(config))
      if (!post) return fail(404, '게시글을 찾을 수 없습니다.')
      if (!canEditPost(post, user)) return fail(403, '본인 글만 수정할 수 있습니다.')
      const { title, content, isPrivate } = body(config)
      if (!title?.trim()) return fail(400, '제목을 입력해 주세요.')
      Object.assign(post, { title, content: content || '', isPrivate: Boolean(isPrivate), updatedAt: nowIso() })
      return ok(toPostDto(post, user))
    })
  )

  mock.onDelete(/\/posts\/\d+$/).reply(
    auth((config, user) => {
      const post = db.posts.find((p) => p.id === idOf(config))
      if (!post) return fail(404, '게시글을 찾을 수 없습니다.')
      if (!canEditPost(post, user)) return fail(403, '본인 글만 삭제할 수 있습니다.')
      db.posts = db.posts.filter((p) => p.id !== post.id)
      db.comments = db.comments.filter((c) => c.postId !== post.id) // 댓글도 함께 삭제
      return [204]
    })
  )

  // ---------- 추천·비추천 (로그인, 본인 글 제외) ----------
  mock.onPost(/\/posts\/\d+\/vote$/).reply(
    auth((config, user) => {
      const { post, error } = findViewablePost(postIdOf(config), user)
      if (error) return error
      if (post.authorId === user.id) return fail(403, '본인 글에는 추천·비추천을 할 수 없습니다.')
      const { type } = body(config)
      if (type !== 'up' && type !== 'down') return fail(400, '잘못된 요청입니다.')
      toggleVote(post.votes, user.id, type)
      return ok(voteSummary(post.votes, user))
    })
  )

  // ---------- 댓글 (조회: 누구나 / 등록: 로그인 / 수정: 본인 / 삭제: 본인 또는 운영자) ----------
  mock.onGet(/\/posts\/\d+\/comments$/).reply((config) => {
    const user = currentUser(config)
    const { post, error } = findViewablePost(postIdOf(config), user)
    if (error) return error
    return ok(
      db.comments
        .filter((c) => c.postId === post.id)
        .sort((a, b) => a.id - b.id)
        .map((c) => toCommentDto(c, user))
    )
  })

  mock.onPost(/\/posts\/\d+\/comments$/).reply(
    auth((config, user) => {
      const { post, error } = findViewablePost(postIdOf(config), user)
      if (error) return error
      const postId = post.id
      const { content } = body(config)
      if (!content?.trim()) return fail(400, '댓글 내용을 입력해 주세요.')
      const comment = {
        id: nextId(db.comments),
        postId,
        content,
        authorId: user.id,
        authorName: user.name,
        votes: {},
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      db.comments.push(comment)
      return [201, toCommentDto(comment, user)]
    })
  )

  mock.onPut(/\/comments\/\d+$/).reply(
    auth((config, user) => {
      const comment = db.comments.find((c) => c.id === idOf(config))
      if (!comment) return fail(404, '댓글을 찾을 수 없습니다.')
      if (comment.authorId !== user.id) return fail(403, '본인 댓글만 수정할 수 있습니다.')
      const { content } = body(config)
      if (!content?.trim()) return fail(400, '댓글 내용을 입력해 주세요.')
      Object.assign(comment, { content, updatedAt: nowIso() })
      return ok(toCommentDto(comment, user))
    })
  )

  mock.onDelete(/\/comments\/\d+$/).reply(
    auth((config, user) => {
      const comment = db.comments.find((c) => c.id === idOf(config))
      if (!comment) return fail(404, '댓글을 찾을 수 없습니다.')
      if (comment.authorId !== user.id && user.role !== 'ADMIN') return fail(403, '본인 댓글만 삭제할 수 있습니다.')
      db.comments = db.comments.filter((c) => c.id !== comment.id)
      return [204]
    })
  )

  // ---------- 댓글 추천·비추천 (로그인, 본인 댓글 제외) ----------
  mock.onPost(/\/comments\/\d+\/vote$/).reply(
    auth((config, user) => {
      const comment = db.comments.find((c) => c.id === Number(config.url.match(/comments\/(\d+)/)[1]))
      if (!comment) return fail(404, '댓글을 찾을 수 없습니다.')
      const { error } = findViewablePost(comment.postId, user)
      if (error) return error
      if (comment.authorId === user.id) return fail(403, '본인 댓글에는 추천·비추천을 할 수 없습니다.')
      const { type } = body(config)
      if (type !== 'up' && type !== 'down') return fail(400, '잘못된 요청입니다.')
      toggleVote(comment.votes, user.id, type)
      return ok(voteSummary(comment.votes, user))
    })
  )

  // ---------- 회원 ----------
  mock.onGet('/members').reply(auth(() => ok(db.members.map(publicMember))))

  mock.onGet(/\/members\/\d+$/).reply(
    auth((config) => {
      const member = db.members.find((m) => m.id === idOf(config))
      if (!member) return fail(404, '회원을 찾을 수 없습니다.')
      return ok(publicMember(member))
    })
  )

  const validRole = (role) => role === 'ADMIN' || role === 'USER'

  mock.onPost('/members').reply(
    auth(
      (config) => {
        const { username, password, name, role } = body(config)
        if (!username?.trim() || !password || !name?.trim()) return fail(400, '아이디, 비밀번호, 이름을 모두 입력해 주세요.')
        if (!validRole(role)) return fail(400, '권한을 선택해 주세요.')
        if (db.members.some((m) => m.username === username)) return fail(409, '이미 사용 중인 아이디입니다.')
        const member = { id: nextId(db.members), username, password, name, role, createdAt: nowIso() }
        db.members.push(member)
        return [201, publicMember(member)]
      },
      { adminOnly: true }
    )
  )

  mock.onPut(/\/members\/\d+$/).reply(
    auth(
      (config) => {
        const member = db.members.find((m) => m.id === idOf(config))
        if (!member) return fail(404, '회원을 찾을 수 없습니다.')
        const { username, password, name, role } = body(config)
        if (!username?.trim() || !name?.trim()) return fail(400, '아이디와 이름을 입력해 주세요.')
        if (!validRole(role)) return fail(400, '권한을 선택해 주세요.')
        if (db.members.some((m) => m.username === username && m.id !== member.id)) return fail(409, '이미 사용 중인 아이디입니다.')
        Object.assign(member, { username, name, role })
        if (password) member.password = password // 비워 두면 기존 비밀번호 유지
        // 이름이 바뀌면 게시글·댓글의 글쓴이 이름도 맞춘다
        db.posts.forEach((p) => {
          if (p.authorId === member.id) p.authorName = name
        })
        db.comments.forEach((c) => {
          if (c.authorId === member.id) c.authorName = name
        })
        return ok(publicMember(member))
      },
      { adminOnly: true }
    )
  )

  mock.onDelete(/\/members\/\d+$/).reply(
    auth(
      (config, user) => {
        const id = idOf(config)
        if (id === user.id) return fail(400, '자기 자신은 삭제할 수 없습니다.')
        if (!db.members.some((m) => m.id === id)) return fail(404, '회원을 찾을 수 없습니다.')
        db.members = db.members.filter((m) => m.id !== id)
        return [204]
      },
      { adminOnly: true }
    )
  )
}
