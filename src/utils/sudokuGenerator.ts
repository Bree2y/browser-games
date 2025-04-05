// 스도쿠 보드의 유효성을 검사하는 함수
const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
  // 행 검사
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // 열 검사
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // 3x3 박스 검사
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// 스도쿠 퍼즐을 해결하는 함수
const solveSudoku = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// 난이도에 따라 셀을 제거하는 함수
const removeNumbers = (board: number[][], difficulty: string): void => {
  const cellsToRemove = {
    easy: 40,
    medium: 50,
    hard: 60
  }[difficulty] || 40;

  let count = 0;
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      count++;
    }
  }
};

// 완성된 스도쿠 보드를 생성하는 함수
const generateCompletedBoard = (): number[][] => {
  const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // 대각선 블록을 채움
  for (let i = 0; i < 9; i += 3) {
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let row = i; row < i + 3; row++) {
      for (let col = i; col < i + 3; col++) {
        const randomIndex = Math.floor(Math.random() * nums.length);
        board[row][col] = nums[randomIndex];
        nums.splice(randomIndex, 1);
      }
    }
  }

  solveSudoku(board);
  return board;
};

// 새로운 스도쿠 퍼즐을 생성하는 함수
export const generateSudoku = (difficulty: string): { puzzle: number[][], solution: number[][] } => {
  const solution = generateCompletedBoard();
  const puzzle = solution.map(row => [...row]);
  removeNumbers(puzzle, difficulty);
  
  return {
    puzzle,
    solution
  };
};

// 현재 보드가 유효한지 검사하는 함수
export const validateBoard = (board: (string | number)[][]): boolean => {
  const numberBoard = board.map(row => 
    row.map(cell => (cell === '' ? 0 : Number(cell)))
  );

  // 행 검사
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const num = numberBoard[row][col];
      if (num !== 0) {
        if (seen.has(num)) return false;
        seen.add(num);
      }
    }
  }

  // 열 검사
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const num = numberBoard[row][col];
      if (num !== 0) {
        if (seen.has(num)) return false;
        seen.add(num);
      }
    }
  }

  // 3x3 박스 검사
  for (let block = 0; block < 9; block++) {
    const seen = new Set();
    const rowStart = Math.floor(block / 3) * 3;
    const colStart = (block % 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const num = numberBoard[rowStart + i][colStart + j];
        if (num !== 0) {
          if (seen.has(num)) return false;
          seen.add(num);
        }
      }
    }
  }

  return true;
}; 