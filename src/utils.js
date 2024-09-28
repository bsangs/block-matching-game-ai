export const blockShapes = [
    // 1x1 블록
    [[1]],
    // 일자 2블록
    [[1, 1]],
    // 일자 3블록
    [[1, 1, 1]],
    // 일자 4블록
    [[1, 1, 1, 1]],
    // 일자 5블록
    [[1, 1, 1, 1, 1]],
    // ㄴ자 블록 (긴 쪽)
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    // ㄱ자 블록
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    // z 모양 블록
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    // ㅗ 모양 블록
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    // 2x2 블록
    [
      [1, 1],
      [1, 1],
    ],
    // 3x3 블록
    [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  ];
  
  export function generateBlocks(n) {
    const blocks = [];
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * blockShapes.length);
      blocks.push(blockShapes[randomIndex]);
    }
    return blocks;
  }
  
  export function checkGameOver(board, blocks) {
    for (const block of blocks) {
      for (let row = 0; row <= board.length - block.length; row++) {
        for (let col = 0; col <= board[0].length - block[0].length; col++) {
          if (canPlaceBlock(board, block, row, col)) {
            return false; // 배치 가능하므로 게임 오버 아님
          }
        }
      }
    }
    return true; // 배치 불가능하므로 게임 오버
  }
  
  export function canPlaceBlock(board, block, startRow, startCol) {
    for (let i = 0; i < block.length; i++) {
      for (let j = 0; j < block[i].length; j++) {
        if (block[i][j]) {
          const row = startRow + i;
          const col = startCol + j;
          // 보드의 경계를 벗어나는지 확인
          if (
            row < 0 ||
            row >= board.length ||
            col < 0 ||
            col >= board[0].length
          ) {
            return false;
          }
          if (board[row][col]) {
            return false; // 이미 블록이 존재하여 배치 불가
          }
        }
      }
    }
    return true; // 배치 가능
  }
  
  export function placeBlockOnBoard(board, block, startRow, startCol) {
    if (!canPlaceBlock(board, block, startRow, startCol)) {
      return null; // 배치 불가
    }
    const newBoard = board.map((row) => row.slice());
    const placedCells = [];
    for (let i = 0; i < block.length; i++) {
      for (let j = 0; j < block[i].length; j++) {
        if (block[i][j]) {
          const row = startRow + i;
          const col = startCol + j;
          newBoard[row][col] = 2; // 마지막으로 배치된 블록은 2로 표시
          placedCells.push({ row, col });
        }
      }
    }
    // 이전에 2로 표시된 셀을 1로 변경
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 2) {
          newBoard[i][j] = 1;
        }
      }
    }
    return { newBoard, placedCells };
  }
  
  export function checkAndMarkLines(board) {
    let markedBoard = board.map((row) => row.slice());
    let linesCleared = 0;
    let blocksCleared = 0;
  
    // 가로 줄 검사
    for (let i = 0; i < 8; i++) {
      if (markedBoard[i].every((cell) => cell > 0)) {
        // 라인 마크
        markedBoard[i] = markedBoard[i].map(() => -1);
        linesCleared++;
        blocksCleared += 8;
      }
    }
  
    // 세로 줄 검사
    for (let j = 0; j < 8; j++) {
      let columnFilled = true;
      for (let i = 0; i < 8; i++) {
        if (markedBoard[i][j] <= 0) {
          columnFilled = false;
          break;
        }
      }
      if (columnFilled) {
        // 라인 마크
        for (let i = 0; i < 8; i++) {
          if (markedBoard[i][j] !== -1) {
            markedBoard[i][j] = -1;
            blocksCleared++;
          }
        }
        linesCleared++;
      }
    }
  
    return { markedBoard, linesCleared, blocksCleared };
  }
  
  export function checkAndClearLines(board) {
    let clearedBoard = board.map((row) => row.slice());
    let linesCleared = 0;
    let blocksCleared = 0;
  
    // 가로 줄 검사
    for (let i = 0; i < 8; i++) {
      if (clearedBoard[i].every((cell) => cell === 1)) {
        // 라인 클리어
        clearedBoard[i] = Array(8).fill(0);
        linesCleared++;
        blocksCleared += 8;
      }
    }
  
    // 세로 줄 검사
    for (let j = 0; j < 8; j++) {
      let columnFilled = true;
      for (let i = 0; i < 8; i++) {
        if (clearedBoard[i][j] === 0) {
          columnFilled = false;
          break;
        }
      }
      if (columnFilled) {
        // 라인 클리어
        for (let i = 0; i < 8; i++) {
          if (clearedBoard[i][j] === 1) {
            clearedBoard[i][j] = 0;
            blocksCleared++;
          }
        }
        linesCleared++;
      }
    }
  
    return { clearedBoard, linesCleared, blocksCleared };
  }
  