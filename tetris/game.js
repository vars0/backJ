document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.id.replace("-btn", "-modal");
    document.getElementById(id).style.display = "block";
  });
});

document.querySelectorAll(".close").forEach((close) => {
  close.addEventListener("click", () => {
    document.getElementById(close.dataset.close).style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// ====== 기본 상수 ======
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const nextCanvases = [...document.querySelectorAll(".next")].map((c) =>
  c.getContext("2d")
);
const holdCtx = document.getElementById("hold").getContext("2d");

// ====== 테트리미노 정의 ======
const TETROMINOS = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};
const COLORS = {
  I: "cyan",
  J: "blue",
  L: "orange",
  O: "yellow",
  S: "green",
  T: "purple",
  Z: "red",
};

// ====== 게임 상태 ======
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let bag = [];
let nextQueue = [];
let holdPiece = null;
let canHold = true;
let current;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;

// ====== 테트리미노 클래스 ======
class Piece {
  constructor(type) {
    this.type = type;
    this.matrix = TETROMINOS[type].map((r) => [...r]);
    this.pos = { x: 3, y: -1 }; // 시작 위치
  }
}

// ====== 유틸 ======
function getRandomPiece() {
  if (bag.length === 0) {
    bag = Object.keys(TETROMINOS);
    // 7-bag shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return new Piece(bag.pop());
}

function drawMatrix(matrix, offset, ctxTarget, color) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctxTarget.fillStyle = color;
        ctxTarget.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctxTarget.strokeStyle = "#111";
        ctxTarget.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// ====== 보드 ======
function collide(board, piece) {
  const m = piece.matrix;
  const o = piece.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x]) {
        // 보드 위쪽(숨겨진 2줄)에서는 충돌 체크 제외
        if (y + o.y < 0) continue;
        if (!board[y + o.y] || !board[y + o.y][x + o.x]) continue;
        if (board[y + o.y][x + o.x] !== 0) return true;
      }
    }
  }
  return false;
}

function merge(board, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val && y + piece.pos.y >= 0) {
        board[y + piece.pos.y][x + piece.pos.x] = piece.type;
      }
    });
  });
}

// ====== SRS 회전 ======
function rotate(matrix, dir) {
  const N = matrix.length;
  const res = matrix.map((row, i) =>
    row.map((_, j) => (dir > 0 ? matrix[N - j - 1][i] : matrix[j][N - i - 1]))
  );
  return res;
}

function playerRotate(dir) {
  const oldMatrix = current.matrix;
  current.matrix = rotate(current.matrix, dir);

  const kicks = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ];

  for (let i = 0; i < kicks.length; i++) {
    current.pos.x += kicks[i].x;
    current.pos.y += kicks[i].y;
    if (!collide(board, current)) {
      return;
    }
    current.pos.x -= kicks[i].x;
    current.pos.y -= kicks[i].y;
  }
  current.matrix = oldMatrix; // 되돌림
}

// ====== 라인 클리어 ======
function sweep() {
  let rowCount = 0;
  outer: for (let y = board.length - 1; y >= 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (!board[y][x]) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++rowCount;
    ++y;
  }
  if (rowCount > 0) {
    lines += rowCount;
    score += [0, 100, 300, 500, 800][rowCount] * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = 1000 - (level - 1) * 80;
    document.getElementById("score").textContent = score;
  }
}

// ====== 드로잉 ======
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, COLS, ROWS);
  board.forEach((row, y) =>
    row.forEach((val, x) => {
      if (val) drawMatrix([[1]], { x, y }, ctx, COLORS[val]);
    })
  );
  drawMatrix(current.matrix, current.pos, ctx, COLORS[current.type]);

  // Next 3개
  nextCanvases.forEach((c, i) => {
    c.clearRect(0, 0, 80, 80);
    const p = nextQueue[i];
    if (p) {
      const m = p.matrix;
      drawMatrix(m, { x: 1, y: 1 }, c, COLORS[p.type]);
    }
  });

  // Hold
  holdCtx.clearRect(0, 0, 80, 80);
  if (holdPiece) {
    drawMatrix(
      holdPiece.matrix,
      { x: 1, y: 1 },
      holdCtx,
      COLORS[holdPiece.type]
    );
  }
}

// ====== 드롭 ======
function drop() {
  current.pos.y++;
  if (collide(board, current)) {
    current.pos.y--;
    merge(board, current);
    sweep();
    newPiece();
  }
  dropCounter = 0;
}

function newPiece() {
  current = nextQueue.shift();
  nextQueue.push(getRandomPiece());
  canHold = true;
  current.pos = { x: 3, y: -1 }; // 새 피스 위치 초기화
  // 게임오버 체크는 실제로 y >= 0일 때만!
  if (collide(board, current) && current.pos.y >= 0) {
    gameOver = true;
    alert("Game Over!");
  }
}

// ====== Hold ======
function hold() {
  if (!canHold) return;
  if (!holdPiece) {
    holdPiece = current;
    newPiece();
  } else {
    [holdPiece, current] = [current, holdPiece];
    current.pos = { x: 3, y: -1 };
  }
  canHold = false;
}

// ====== 게임 루프 ======
function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) {
    drop();
  }
  draw();
  if (!gameOver) requestAnimationFrame(update);
}

// ====== 입력 ======
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.code === "ArrowLeft") {
    current.pos.x--;
    if (collide(board, current)) current.pos.x++;
  }
  if (e.code === "ArrowRight") {
    current.pos.x++;
    if (collide(board, current)) current.pos.x--;
  }
  if (e.code === "ArrowDown") {
    drop();
  }
  if (e.code === "Space") {
    while (!collide(board, current)) current.pos.y++;
    current.pos.y--;
    merge(board, current);
    sweep();
    newPiece();
  }
  if (e.code === "ArrowUp" || e.code === "KeyX") {
    playerRotate(1);
  }
  if (e.code === "KeyZ" || e.ctrlKey) {
    playerRotate(-1);
  }
  if (e.code === "KeyC" || e.shiftKey) {
    hold();
  }
});

// ====== 시작 ======
function start() {
  nextQueue = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
  newPiece();
  update();
}
start();
