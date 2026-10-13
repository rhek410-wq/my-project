// 테마별 장식 (색은 index.css의 [data-theme]에서 정한다)
export const THEMES = {
  sky: {
    label: '하늘',
    mascot: '☁️',
    heart: '💙',
    loading: '☁️ 둥실둥실 불러오는 중...',
    intro: '구름처럼 가볍게 나눠 보아요 💬',
    decorations: ['☁️', '☀️', '🎈', '☁️', '🌈'],
  },
  pink: {
    label: '핑크',
    mascot: '🐰',
    heart: '💗',
    loading: '🐰 깡총깡총 불러오는 중...',
    intro: '소소한 이야기를 나눠 보아요 💬',
    decorations: ['🌸', '⭐', '🍓', '☁️', '🎀'],
  },
  forest: {
    label: '숲',
    mascot: '🐿️',
    heart: '💚',
    loading: '🌱 쑥쑥 불러오는 중...',
    intro: '숲속 친구들처럼 도란도란 나눠 보아요 💬',
    decorations: ['🍀', '🌼', '🍄', '🌿', '🐞'],
  },
  night: {
    label: '밤하늘',
    mascot: '🌙',
    heart: '💛',
    loading: '✨ 반짝반짝 불러오는 중...',
    intro: '별빛 아래에서 조용히 나눠 보아요 💬',
    decorations: ['⭐', '✨', '🪐', '🌟', '☄️'],
  },
}

export const THEME_KEYS = Object.keys(THEMES)
