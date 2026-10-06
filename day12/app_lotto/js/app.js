const GAME_COUNT = 5;   // 세트 수
const NUM_COUNT = 6;    // 세트당 번호 수
const MAX_NUM = 45;
const LABELS = ['A', 'B', 'C', 'D', 'E'];

let mode = 'pick';      // 'pick'(수동) | 'exclude'(제외)
let picked = [];        // 지금 고르는 수동 번호
let excluded = [];      // 제외 번호
let manualGames = [];   // 수동 게임 목록: [[7, 14], [1, 2, 3, 4, 5, 6], ...]
let results = [null, null, null, null, null];
// results[i]: null(비어 있음) 또는 { type: '자동'|'반자동'|'수동', numbers: [...], fixed: [...] }

const $ = (id) => document.getElementById(id);
const sortNums = (arr) => [...arr].sort((a, b) => a - b);

function init() {
    // 1~45 번호판 만들기
    const grid = $('numberGrid');
    for (let i = 1; i <= MAX_NUM; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'number-btn';
        btn.textContent = i;
        btn.dataset.num = i;
        grid.appendChild(btn);
    }

    // 번호판 클릭 (이벤트 위임)
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.number-btn');
        if (btn) toggleNumber(Number(btn.dataset.num));
    });

    $('pickModeBtn').addEventListener('click', () => setMode('pick'));
    $('excludeModeBtn').addEventListener('click', () => setMode('exclude'));
    $('addManualBtn').addEventListener('click', addManualGame);
    $('clearPickedBtn').addEventListener('click', () => { picked = []; render(); });
    $('clearExcludedBtn').addEventListener('click', () => { excluded = []; render(); });
    $('generateBtn').addEventListener('click', generate);
    $('resetAllBtn').addEventListener('click', resetAll);

    // 목록 안의 버튼은 다시 그려지므로 부모에 이벤트 위임
    $('manualList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-index]');
        if (btn) removeManualGame(Number(btn.dataset.index));
    });
    $('resultList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-index]');
        if (!btn) return;
        const index = Number(btn.dataset.index);
        if (btn.dataset.action === 'copy') copyRow(index);
        else resetRow(index);
    });

    renderLatestDraw();
    setMode('pick');
    render();
}

// ② 지난주 당첨번호
function renderLatestDraw() {
    const draw = LATEST_DRAW;
    $('drawInfo').textContent = `· 제${draw.round}회 (${draw.date.replaceAll('-', '.')})`;
    $('drawBalls').innerHTML =
        draw.numbers.map(n => ballHtml(n)).join('') +
        '<span class="bonus-plus">+</span>' +
        ballHtml(draw.bonus);

    const eok = Math.floor(draw.firstPrizeAmount / 100000000);
    const man = Math.floor((draw.firstPrizeAmount % 100000000) / 10000);
    $('drawPrize').textContent = `1등 ${draw.firstPrizeWinners}명 · 1인당 약 ${eok}억 ${man}만원`;

    // 저장된 회차가 오래됐으면 안내 문구 표시
    if (getExpectedRound(new Date()) > draw.round) {
        $('drawWarning').classList.remove('d-none');
    }
}

// 날짜로 최신 회차 계산 (1회 = 2002-12-07 토요일, 매주 토요일 20:45 추첨)
function getExpectedRound(today) {
    const lastSat = new Date(today);
    lastSat.setDate(lastSat.getDate() - ((today.getDay() + 1) % 7));  // 가장 최근 토요일
    lastSat.setHours(20, 45, 0, 0);
    if (lastSat > today) {
        lastSat.setDate(lastSat.getDate() - 7);  // 아직 추첨 전이면 전 주 토요일
    }

    // 시차·서머타임 영향을 없애려고 날짜만 UTC로 비교
    const first = Date.UTC(2002, 11, 7);
    const sat = Date.UTC(lastSat.getFullYear(), lastSat.getMonth(), lastSat.getDate());
    const weeks = Math.round((sat - first) / (7 * 24 * 60 * 60 * 1000));
    return weeks + 1;
}

// 모드 전환
function setMode(newMode) {
    mode = newMode;
    const isPick = mode === 'pick';
    $('pickModeBtn').className = `btn ${isPick ? 'btn-primary' : 'btn-outline-primary'}`;
    $('excludeModeBtn').className = `btn ${isPick ? 'btn-outline-danger' : 'btn-danger'}`;
    $('modeHint').textContent = isPick
        ? '번호를 눌러 수동 번호를 골라주세요 (최대 6개).'
        : '자동 생성에서 뺄 번호를 눌러주세요.';
}

// 번호 선택/해제
function toggleNumber(n) {
    if (mode === 'pick') {
        if (picked.includes(n)) {
            picked = picked.filter(x => x !== n);
        } else {
            if (picked.length >= NUM_COUNT) {
                showMessage('수동 번호는 최대 6개까지 고를 수 있어요.');
                return;
            }
            picked.push(n);
            excluded = excluded.filter(x => x !== n);  // 제외에 있었다면 빼기
        }
    } else {
        if (excluded.includes(n)) {
            excluded = excluded.filter(x => x !== n);
        } else {
            if (MAX_NUM - excluded.length <= NUM_COUNT) {
                showMessage('최소 6개 번호는 남겨주세요.');
                return;
            }
            excluded.push(n);
            picked = picked.filter(x => x !== n);  // 수동에 있었다면 빼기
        }
    }
    render();
}

function addManualGame() {
    if (picked.length === 0) {
        showMessage('수동 번호를 1개 이상 골라주세요.');
        return;
    }
    if (manualGames.length >= GAME_COUNT) {
        showMessage('수동 게임은 최대 5개까지 추가할 수 있어요.');
        return;
    }
    manualGames.push(sortNums(picked));
    picked = [];
    render();
}

function removeManualGame(index) {
    manualGames.splice(index, 1);
    render();
}

function gameType(game) {
    return game.length === NUM_COUNT ? '수동' : '반자동';
}

// base 번호는 고정하고 나머지를 랜덤으로 채운 정렬 배열 반환
function fillRandom(base) {
    const result = [...base];
    // 후보 = 1~45 중 제외 번호와 이미 들어간 번호를 뺀 것
    const pool = [];
    for (let i = 1; i <= MAX_NUM; i++) {
        if (!excluded.includes(i) && !result.includes(i)) pool.push(i);
    }

    while (result.length < NUM_COUNT) {
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool[idx]);
        pool.splice(idx, 1);  // 뽑은 번호는 후보에서 제거 (중복 방지)
    }
    return sortNums(result);
}

// 비어 있는 줄만 채우기
function generate() {
    if (!results.includes(null)) {
        showMessage('비어 있는 줄이 없어요. 줄 초기화나 전체 초기화 후 생성해 주세요.');
        return;
    }

    for (let i = 0; i < GAME_COUNT; i++) {
        if (results[i] !== null) continue;  // 이미 채워진 줄은 그대로

        const manual = manualGames[i];
        const fixed = manual ? [...manual] : [];
        results[i] = {
            type: manual ? gameType(manual) : '자동',
            numbers: fillRandom(fixed),
            fixed: fixed
        };
    }
    render();
}

function resetRow(index) {
    results[index] = null;
    render();
}

// 한 줄 번호를 클립보드에 복사 (예: "3, 7, 14, 23, 32, 40")
function copyRow(index) {
    const r = results[index];
    if (!r) {
        showMessage('비어 있는 줄은 복사할 수 없어요.');
        return;
    }
    const text = r.numbers.join(', ');
    const done = () => showMessage(`${LABELS[index]}줄 번호를 복사했어요: ${text}`);

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, () => copyFallback(text, done));
    } else {
        copyFallback(text, done);  // file:// 로 열었을 때
    }
}

// clipboard API를 못 쓸 때: 임시 textarea를 만들어 복사
function copyFallback(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (ok) done();
    else showMessage('복사하지 못했어요. 번호를 직접 선택해서 복사해 주세요.');
}

function resetAll() {
    results = results.map(() => null);
    render();
}

// 번호대별 색 클래스
function ballColorClass(n) {
    return 'ball-' + Math.min(Math.ceil(n / 10), 5);
}

// 공 하나의 HTML (n이 없으면 빈 칸)
function ballHtml(n, isFixed = false) {
    if (n === undefined) return '<span class="ball ball-empty">?</span>';
    return `<span class="ball ${ballColorClass(n)}${isFixed ? ' fixed' : ''}">${n}</span>`;
}

// 공 6칸 HTML
function ballsHtml(nums, fixed = []) {
    let html = '';
    for (let i = 0; i < NUM_COUNT; i++) {
        html += ballHtml(nums[i], fixed.includes(nums[i]));
    }
    return html;
}

// 화면 다시 그리기
function render() {
    // 번호판
    document.querySelectorAll('.number-btn').forEach(btn => {
        const n = Number(btn.dataset.num);
        btn.classList.toggle('picked', picked.includes(n));
        btn.classList.toggle('excluded', excluded.includes(n));
    });
    $('pickedText').textContent = picked.length ? sortNums(picked).join(', ') : '없음';
    $('excludedText').textContent = excluded.length ? sortNums(excluded).join(', ') : '없음';

    // 수동 게임 목록
    $('manualCount').textContent = manualGames.length;
    $('manualList').innerHTML = manualGames.length === 0
        ? '<li class="list-group-item empty-message">추가된 수동 게임이 없어요 (전부 자동으로 생성)</li>'
        : manualGames.map((game, i) => `
            <li class="list-group-item game-row">
                <span class="game-label">${LABELS[i]}</span>
                <span class="badge text-bg-light game-type">${gameType(game)}</span>
                <div class="balls flex-grow-1">${ballsHtml(game)}</div>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-index="${i}" aria-label="${LABELS[i]} 수동 게임 삭제">
                    <i class="bi bi-x-lg"></i>
                </button>
            </li>`).join('');

    // 생성 결과 (5줄 모두 비어 있으면 안내 문구)
    const allEmpty = results.every(r => r === null);
    $('resultList').innerHTML = allEmpty
        ? '<li class="list-group-item empty-message">번호 생성 버튼을 눌러주세요</li>'
        : results.map((r, i) => `
            <li class="list-group-item game-row">
                <span class="game-label">${LABELS[i]}</span>
                <span class="badge ${r ? 'text-bg-primary' : 'text-bg-light'} game-type">${r ? r.type : '-'}</span>
                <div class="balls flex-grow-1">${r ? ballsHtml(r.numbers, r.fixed) : ballsHtml([])}</div>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-index="${i}" data-action="copy" aria-label="${LABELS[i]}줄 복사" title="복사">
                    <i class="bi bi-copy"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-index="${i}" data-action="reset" aria-label="${LABELS[i]}줄 초기화" title="초기화">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
            </li>`).join('');
}

// 안내 메시지 (Bootstrap toast, 없으면 alert)
function showMessage(text) {
    if (window.bootstrap) {
        $('messageText').textContent = text;
        bootstrap.Toast.getOrCreateInstance($('messageToast'), { delay: 2500 }).show();
    } else {
        alert(text);
    }
}

init();
