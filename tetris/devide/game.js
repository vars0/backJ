// ====== Constants & Config ======
const COLS = 10,
  ROWS = 20,
  CELL = 30;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const holdCanvas = document.getElementById("hold");
const holdCtx = holdCanvas.getContext("2d");
const nextSlots = document.getElementById("nextSlots");
const scoreEl = document.getElementById("score"),
  levelEl = document.getElementById("level"),
  linesEl = document.getElementById("lines");
const pauseOverlay = document.getElementById("pause"),
  gameoverOverlay = document.getElementById("gameover"),
  finalStats = document.getElementById("finalStats");
const saveScoreBtn = document.getElementById("saveScoreBtn"),
  playerNameInput = document.getElementById("playerName"),
  clearRanksBtn = document.getElementById("clearRanksBtn");

const COLORS = {
  I: "#33d0ff",
  J: "#3a6fff",
  L: "#ff9f2e",
  O: "#ffd533",
  S: "#35e06f",
  T: "#ab5cff",
  Z: "#ff4d6d",
  GHOST: "#ffffff55",
};
const SHAPES = {
  I: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  J: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  L: [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  O: [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
};

// SRS kick tables
const KICKS = {
  JLSTZ: {
    "0>1": [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    "1>0": [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    "1>2": [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    "2>1": [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    "2>3": [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    "3>2": [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    "3>0": [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    "0>3": [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
  I: {
    "0>1": [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    "1>0": [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    "1>2": [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    "2>1": [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    "2>3": [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    "3>2": [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    "3>0": [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    "0>3": [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
};

// ====== Game state ======
let grid = createGrid(ROWS, COLS);
let bag = [],
  queue = [],
  hold = null,
  canHold = true,
  cur = null,
  ghostY = 0;
let score = 0,
  level = 1,
  lines = 0,
  combo = 0;
let lastClearWasB2BEligible = false;

// Lockdown / Infinity config
const LOCK_DELAY = 500; // ms (0.5s guideline)
const MAX_LOCK_RESET = 15; // prevent infinite
let lockTimer = 0,
  touching = false,
  lockResets = 0;

let dropTimer = 0,
  dropInterval = 1000,
  lastTime = 0,
  paused = false,
  over = false;
let lastActionWasRotate = false,
  lastRotationUsedKick = false;

// next UI
for (let i = 0; i < 5; i++) {
  const c = document.createElement("canvas");
  c.width = 72;
  c.height = 72;
  c.className = "slot";
  nextSlots.appendChild(c);
}

// ====== Helpers ======
function createGrid(r, c) {
  return Array.from({ length: r }, () => Array(c).fill(null));
}
function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function newBag() {
  const pieces = ["I", "J", "L", "O", "S", "T", "Z"];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}
function refillQueue() {
  if (bag.length === 0) bag = newBag();
  while (queue.length < 5) {
    if (bag.length === 0) bag = newBag();
    queue.push(bag.shift());
  }
}

// Spawn rules per guideline
function spawn() {
  refillQueue();
  const type = queue.shift();
  // spawn positions: I/O centered; others centered in cols 3..5 (0-index)
  const spawnX = type === "I" || type === "O" ? 3 : 3; // for our coordinate system, x=3 centers non-I/O in 4th col (1-indexed)
  const spawnY = type === "I" ? -1 : 0; // I spawns slightly up
  cur = {
    type,
    rot: 0,
    x: spawnX,
    y: spawnY,
    cells: clone(SHAPES[type]),
  };
  canHold = true;
  lastActionWasRotate = false;
  lastRotationUsedKick = false;
  lockTimer = 0;
  lockResets = 0;
  updateGhost();
  if (collide(cur, grid)) {
    gameOver();
  }
  refillQueue();
  drawNext();
}

function rotateCW(cells) {
  return cells.map(([x, y]) => [-y, x]);
}
function rotateCCW(cells) {
  return cells.map(([x, y]) => [y, -x]);
}

function collide(piece, board) {
  for (const [px, py] of piece.cells) {
    const x = piece.x + px,
      y = piece.y + py;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && board[y][x]) return true;
  }
  return false;
}
function willTouchGround(piece) {
  const t = clone(piece);
  t.y += 1;
  return collide(t, grid);
}

function move(dx, dy) {
  if (!cur) return false;
  cur.x += dx;
  cur.y += dy;
  if (collide(cur, grid)) {
    cur.x -= dx;
    cur.y -= dy;
    return false;
  } // successful move
  // if moved while touching ground, count as lockdown reset
  if (willTouchGround(cur)) {
    lockTimer = 0;
    lockResets = Math.min(lockResets + 1, MAX_LOCK_RESET);
  }
  updateGhost();
  return true;
}

function rotate(dir) {
  if (!cur) return false;
  const isI = cur.type === "I";
  const sys = isI ? KICKS.I : KICKS.JLSTZ;
  const prevRot = cur.rot;
  const nextRot = (prevRot + (dir > 0 ? 1 : 3)) % 4;
  const fromTo = `${prevRot}>${nextRot}`;
  const old = cur.cells;
  cur.cells = dir > 0 ? rotateCW(cur.cells) : rotateCCW(cur.cells);
  cur.rot = nextRot;
  const kicks = sys[fromTo] || [[0, 0]];
  let usedKick = false;
  for (const [kx, ky] of kicks) {
    cur.x += kx;
    cur.y += ky;
    if (!collide(cur, grid)) {
      usedKick = usedKick || kx !== 0 || ky !== 0;
      lastActionWasRotate = true;
      lastRotationUsedKick = usedKick; // rotation while touching resets lockdown
      if (willTouchGround(cur)) {
        lockTimer = 0;
        lockResets = Math.min(lockResets + 1, MAX_LOCK_RESET);
      }
      updateGhost();
      return true;
    }
    cur.x -= kx;
    cur.y -= ky;
  }
  cur.cells = old;
  cur.rot = prevRot;
  return false;
}

function lock() {
  if (!cur) return; // place
  let placedAbove = false;
  for (const [px, py] of cur.cells) {
    const x = cur.x + px,
      y = cur.y + py;
    if (y < 0) placedAbove = true;
    if (y >= 0) grid[y][x] = cur.type;
  }
  // if locked above playfield -> game over
  if (placedAbove) {
    gameOver();
    return;
  }

  // clear lines
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; ) {
    if (grid[y].every((v) => v)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(null));
      cleared++;
    } else y--;
  }

  // T-Spin detection (3-corner rule + rotation)
  let tspin = false;
  if (cur.type === "T" && lastActionWasRotate) {
    const cx = cur.x + 1,
      cy = cur.y + 1;
    const corners = [
      [cx - 1, cy - 1],
      [cx + 1, cy - 1],
      [cx - 1, cy + 1],
      [cx + 1, cy + 1],
    ];
    let filled = 0;
    for (const [x, y] of corners) {
      if (y < 0 || x < 0 || x >= COLS || y >= ROWS || grid[y][x]) filled++;
    }
    if (filled >= 3) tspin = true;
  }

  // scoring
  let base = 0;
  let b2bEligible = false;
  if (tspin) {
    if (cleared === 0) {
      base = 400;
      b2bEligible = true;
    } else if (cleared === 1) {
      base = 800;
      b2bEligible = true;
    } else if (cleared === 2) {
      base = 1200;
      b2bEligible = true;
    } else if (cleared === 3) {
      base = 1600;
      b2bEligible = true;
    }
  } else if (cleared === 4) {
    base = 800;
    b2bEligible = true;
  } else if (cleared === 3) base = 500;
  else if (cleared === 2) base = 300;
  else if (cleared === 1) base = 100;

  // combo handling
  if (cleared > 0) {
    combo++;
    const comboBonus = Math.max(0, combo - 1) * 50 * level; // 50*(combo-1)
    if (b2bEligible && lastClearWasB2BEligible) base = Math.floor(base * 1.5);
    const gained = base * level + comboBonus;
    score += gained;
    lastClearWasB2BEligible = b2bEligible;
  } else {
    combo = 0;
    lastClearWasB2BEligible = false;
  }

  // perfect clear
  const isPerfect = grid.every((row) => row.every((cell) => !cell));
  if (isPerfect) {
    const pc = 3500 * level;
    score += pc;
  }

  updateHUD();
  lastActionWasRotate = false;
  lastRotationUsedKick = false;
  spawn();
}

function updateGhost() {
  if (!cur) return;
  const ghost = clone(cur);
  while (!collide(ghost, grid)) ghost.y++;
  ghostY = ghost.y - 1;
}
function hardDrop() {
  if (!cur) return;
  let dist = 0;
  while (move(0, 1)) dist++;
  score += dist * 2 * level;
  updateHUD();
  lock();
}
function softDrop() {
  if (!cur) return false;
  if (move(0, 1)) {
    score += 1 * level;
    updateHUD();
    return true;
  }
  return false;
}

function holdPiece() {
  if (!canHold || !cur) return;
  const curType = cur.type;
  if (hold === null) {
    hold = curType;
    spawn();
  } else {
    const tmp = hold;
    hold = curType;
    cur = {
      type: tmp,
      rot: 0,
      x: tmp === "I" || tmp === "O" ? 3 : 3,
      y: tmp === "I" ? -1 : 0,
      cells: clone(SHAPES[tmp]),
    };
    if (collide(cur, grid)) {
      gameOver();
      return;
    }
    lastActionWasRotate = false;
    lastRotationUsedKick = false;
    updateGhost();
  }
  canHold = false;
  drawHold();
}

// ====== Drawing ======
function clearBoard() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
}
function drawCell(x, y, color, alpha = 1) {
  const px = x * CELL,
    py = y * CELL;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  ctx.globalAlpha = 1;
}
function render() {
  clearBoard();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x]) drawCell(x, y, COLORS[grid[y][x]]);
      else {
        ctx.fillStyle = "#0b0f1b";
        ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  }
  // ghost
  if (cur) {
    for (const [px, py] of cur.cells) {
      const x = cur.x + px,
        y = ghostY + py;
      if (y >= 0) drawCell(x, y, COLORS.GHOST, 1);
    }
  }
  // current
  if (cur) {
    for (const [px, py] of cur.cells) {
      const x = cur.x + px,
        y = cur.y + py;
      if (y >= 0) drawCell(x, y, COLORS[cur.type]);
    }
  }
}

function drawMini(ctxInner, type) {
  ctxInner.clearRect(0, 0, ctxInner.canvas.width, ctxInner.canvas.height);
  if (!type) return;
  const cells = SHAPES[type];
  const xs = cells.map((c) => c[0]),
    ys = cells.map((c) => c[1]);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs);
  const miny = Math.min(...ys),
    maxy = Math.max(...ys);
  const w = maxx - minx + 1,
    h = maxy - miny + 1;
  const cell = 16;
  const ox = Math.floor((ctxInner.canvas.width - w * cell) / 2);
  const oy = Math.floor((ctxInner.canvas.height - h * cell) / 2);
  ctxInner.fillStyle = "#0b0f1b";
  ctxInner.fillRect(0, 0, ctxInner.canvas.width, ctxInner.canvas.height);
  for (const [x, y] of cells) {
    const px = ox + (x - minx) * cell + 1;
    const py = oy + (y - miny) * cell + 1;
    ctxInner.fillStyle = COLORS[type];
    ctxInner.fillRect(px, py, cell - 2, cell - 2);
  }
}
function drawHold() {
  drawMini(holdCtx, hold);
}
function drawNext() {
  const types = queue.slice(0, 5);
  const canvases = nextSlots.querySelectorAll("canvas");
  types.forEach((t, i) => {
    const c = canvases[i];
    const cctx = c.getContext("2d");
    cctx.clearRect(0, 0, c.width, c.height);
    drawMini(cctx, t);
  });
}

function updateHUD() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
  drawHold();
}

// ====== Ranking (localStorage) ======
const RANK_KEY = "tetris_rankings_v1";
function loadRankings() {
  try {
    return JSON.parse(localStorage.getItem(RANK_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function saveRankingEntry(entry) {
  const list = loadRankings();
  list.push(entry);
  list.sort((a, b) => b.score - a.score || a.date - b.date);
  const top = list.slice(0, 10);
  localStorage.setItem(RANK_KEY, JSON.stringify(top));
  renderRankings();
}
function renderRankings() {
  const list = loadRankings();
  const ol = document.getElementById("rankingList");
  ol.innerHTML = "";
  if (list.length === 0)
    ol.innerHTML = '<li class="note">랭킹이 비어있습니다.</li>';
  list.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${r.name} — ${r.score}pt (L${r.level}, ${
      r.lines
    } lines)`;
    ol.appendChild(li);
  });
}
clearRanksBtn.addEventListener("click", () => {
  if (confirm("랭킹을 초기화하시겠습니까?")) {
    localStorage.removeItem(RANK_KEY);
    renderRankings();
  }
});
saveScoreBtn.addEventListener("click", () => {
  const name = (playerNameInput.value || "Anonymous").slice(0, 10);
  saveRankingEntry({ name, score, level, lines, date: Date.now() });
  saveScoreBtn.textContent = "저장됨";
  setTimeout(() => (saveScoreBtn.textContent = "점수 저장"), 1200);
});

// ====== Game Loop ======
function update(time = 0) {
  if (paused || over) {
    render();
    return;
  }
  const delta = time - lastTime;
  lastTime = time;
  dropTimer += delta;
  // Lockdown handling: when piece is touching ground (or stacked), start timer; moving/rotating while touching resets but limited
  if (cur) {
    const isTouch = willTouchGround(cur);
    if (isTouch) {
      lockTimer += delta;
      touching = true;
      if (lockTimer >= LOCK_DELAY || lockResets >= MAX_LOCK_RESET) {
        lock();
        lockTimer = 0;
        lockResets = 0;
      }
    } else {
      lockTimer = 0;
      touching = false;
      lockResets = 0;
    }
  }

  if (dropTimer >= dropInterval) {
    if (!softDrop()) {
      lock();
    }
    dropTimer = 0;
  }
  render();
  requestAnimationFrame(update);
}

function togglePause() {
  if (over) return;
  paused = !paused;
  pauseOverlay.classList.toggle("show", paused);
  if (!paused) {
    lastTime = performance.now();
    requestAnimationFrame(update);
  }
}
function gameOver() {
  over = true;
  gameoverOverlay.classList.add("show");
  finalStats.innerHTML = `<div>점수: <b>${score}</b></div><div>레벨: <b>${level}</b></div><div>라인: <b>${lines}</b></div>`;
}
function restart() {
  grid = createGrid(ROWS, COLS);
  bag = [];
  queue = [];
  hold = null;
  canHold = true;
  score = 0;
  level = 1;
  lines = 0;
  combo = 0;
  lastClearWasB2BEligible = false;
  over = false;
  pauseOverlay.classList.remove("show");
  gameoverOverlay.classList.remove("show");
  playerNameInput.value = "";
  updateDropInterval();
  updateHUD();
  refillQueue();
  spawn();
  lastTime = performance.now();
  dropTimer = 0;
  requestAnimationFrame(update);
}

function updateDropInterval() {
  dropInterval = Math.max(60, 1000 * Math.pow(0.85, level - 1));
}

// Input handling (with added keys X/Ctrl/Shift)
window.addEventListener("keydown", (e) => {
  if (over) return;
  const k = e.key;
  if (k === "Escape" || k === "p" || k === "P") {
    togglePause();
    return;
  }
  if (paused) return;
  if (k === "ArrowLeft") {
    move(-1, 0);
  } else if (k === "ArrowRight") {
    move(1, 0);
  } else if (k === "ArrowDown") {
    softDrop();
  } else if (k === " ") {
    e.preventDefault();
    hardDrop();
  } else if (k === "x" || k === "X" || k === "ArrowUp") {
    rotate(1);
  } else if (k === "z" || k === "Z" || k === "Control") {
    rotate(-1);
  } else if (k === "c" || k === "C" || k === "Shift") {
    holdPiece();
  }
});

// Init
updateDropInterval();
refillQueue();
drawNext();
drawHold();
spawn();
renderRankings();
lastTime = performance.now();
requestAnimationFrame(update);


document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.id.replace("-btn", "-modal");
    document.getElementById(id).style.display = "block";
  });
});

document.querySelectorAll(".close").forEach(close => {
  close.addEventListener("click", () => {
    document.getElementById(close.dataset.close).style.display = "none";
  });
});

window.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});