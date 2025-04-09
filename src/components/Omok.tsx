import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OpenAI from 'openai';
import { useNavigate } from 'react-router-dom';

let openai: OpenAI;

// OpenAI 클라이언트 초기화 함수
const initializeOpenAI = () => {
  openai = new OpenAI({
    apiKey: '__OPENAI_API_KEY__',
    dangerouslyAllowBrowser: true
  });
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(15, 40px);
  grid-template-rows: repeat(15, 40px);
  gap: 0px;
  background-color: #dcb35c;
  padding: 20px;
  border: 2px solid #8b4513;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    background-image: 
      linear-gradient(to right, black 1px, transparent 1px),
      linear-gradient(to bottom, black 1px, transparent 1px);
    background-size: 40px 40px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(15, 30px);
    grid-template-rows: repeat(15, 30px);
    
    &::before {
      background-size: 30px 30px;
    }
  }
`;

const Cell = styled.div<{ stone: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  transform: translate(-50%, -50%);

  &::before {
    content: '';
    width: 34px;
    height: 34px;
    border-radius: 50%;
    position: absolute;
    background-color: ${props => 
      props.stone === 'black' ? '#000' : 
      props.stone === 'white' ? '#fff' : 
      'transparent'
    };
    box-shadow: ${props =>
      props.stone === 'black' ? '0 0 5px rgba(0,0,0,0.5)' :
      props.stone === 'white' ? '0 0 5px rgba(0,0,0,0.3)' :
      'none'
    };
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;

    &::before {
      width: 26px;
      height: 26px;
    }
  }
`;

const GameInfo = styled.div`
  margin: 20px 0;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #2196f3;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #1976d2;
  }

  &:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
  }
`;

const Status = styled.span<{ isThinking?: boolean }>`
  color: ${props => props.isThinking ? '#f57c00' : '#2196f3'};
  font-weight: bold;
`;

const Omok: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(15).fill(null).map(() => Array(15).fill(''))
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 컴포넌트가 마운트될 때 OpenAI 클라이언트 초기화
  useEffect(() => {
    initializeOpenAI();
  }, []);

  const checkWin = (row: number, col: number, stone: string): boolean => {
    const directions = [
      [1, 0],   // 가로
      [0, 1],   // 세로
      [1, 1],   // 대각선 ↘
      [1, -1],  // 대각선 ↗
    ];

    return directions.some(([dx, dy]) => {
      let count = 1;
      
      // 정방향 확인
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow < 0 || newRow >= 15 || 
          newCol < 0 || newCol >= 15 || 
          board[newRow][newCol] !== stone
        ) break;
        count++;
      }
      
      // 역방향 확인
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow < 0 || newRow >= 15 || 
          newCol < 0 || newCol >= 15 || 
          board[newRow][newCol] !== stone
        ) break;
        count++;
      }

      return count >= 5;
    });
  };

  const getBoardState = () => {
    let state = '현재 오목판 상태입니다. 당신은 백돌(W)입니다.\n\n';
    
    // 가로 좌표 표시
    state += '   ';
    for (let i = 1; i <= 15; i++) {
      state += `${i.toString().padStart(2, ' ')} `;
    }
    state += '\n';

    for (let i = 0; i < 15; i++) {
      // 세로 좌표 표시
      state += `${(i + 1).toString().padStart(2, ' ')} `;
      
      for (let j = 0; j < 15; j++) {
        state += ` ${board[i][j] === '' ? '.' : board[i][j] === 'black' ? 'B' : 'W'} `;
      }
      state += '\n';
    }

    // 현재 상황 분석 추가
    let blackCount = 0;
    let whiteCount = 0;
    let blackThreats: string[] = [];
    let occupiedPositions: string[] = [];

    // 돌 개수 세기 및 돌이 놓인 위치 기록
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 'black') {
          blackCount++;
          occupiedPositions.push(`${i + 1},${j + 1}`);
        }
        if (cell === 'white') {
          whiteCount++;
          occupiedPositions.push(`${i + 1},${j + 1}`);
        }
      });
    });

    // 가로, 세로, 대각선 방향으로 흑돌 연속 및 띈 3 찾기
    const directions = [
      [1, 0],   // 가로
      [0, 1],   // 세로
      [1, 1],   // 대각선 ↘
      [1, -1],  // 대각선 ↗
    ];

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (board[i][j] !== 'black') continue;

        directions.forEach(([dx, dy]) => {
          // 연속된 3개 이상 찾기
          let count = 1;
          let positions = [[i, j]];
          
          // 정방향 확인
          for (let k = 1; k < 5; k++) {
            const newRow = i + dx * k;
            const newCol = j + dy * k;
            if (
              newRow < 0 || newRow >= 15 || 
              newCol < 0 || newCol >= 15 || 
              board[newRow][newCol] !== 'black'
            ) break;
            count++;
            positions.push([newRow, newCol]);
          }
          
          // 역방향 확인
          for (let k = 1; k < 5; k++) {
            const newRow = i - dx * k;
            const newCol = j - dy * k;
            if (
              newRow < 0 || newRow >= 15 || 
              newCol < 0 || newCol >= 15 || 
              board[newRow][newCol] !== 'black'
            ) break;
            count++;
            positions.push([newRow, newCol]);
          }

          // 3개 이상 연속인 경우, 양 끝 좌표 확인
          if (count >= 3) {
            positions.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
            const [startRow, startCol] = positions[0];
            const [endRow, endCol] = positions[positions.length - 1];

            // 양 끝의 빈 칸 좌표 찾기
            const beforeRow = startRow - dx;
            const beforeCol = startCol - dy;
            const afterRow = endRow + dx;
            const afterCol = endCol + dy;

            if (beforeRow >= 0 && beforeRow < 15 && beforeCol >= 0 && beforeCol < 15 && board[beforeRow][beforeCol] === '') {
              blackThreats.push(`${beforeRow + 1},${beforeCol + 1}`);
            }
            if (afterRow >= 0 && afterRow < 15 && afterCol >= 0 && afterCol < 15 && board[afterRow][afterCol] === '') {
              blackThreats.push(`${afterRow + 1},${afterCol + 1}`);
            }
          }

          // 띈 3 패턴 찾기
          let jumpPattern = [];
          let jumpCount = 0;
          
          // 정방향으로 5칸 확인
          for (let k = 1; k <= 5; k++) {
            const newRow = i + dx * k;
            const newCol = j + dy * k;
            if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) break;
            
            if (board[newRow][newCol] === 'black') {
              jumpPattern.push([newRow, newCol]);
              jumpCount++;
            } else if (board[newRow][newCol] === '') {
              jumpPattern.push([newRow, newCol]);
            } else {
              break;
            }
          }

          // 띈 3 패턴 확인 (예: B.BB, BB.B)
          if (jumpCount === 2 && jumpPattern.length >= 3) {
            for (let k = 0; k < jumpPattern.length; k++) {
              const [row, col] = jumpPattern[k];
              if (board[row][col] === '') {
                blackThreats.push(`${row + 1},${col + 1}`);
              }
            }
          }
        });
      }
    }

    state += `\n게임 상황:\n`;
    state += `- 흑돌(B) 개수: ${blackCount}\n`;
    state += `- 백돌(W) 개수: ${whiteCount}\n`;
    state += `- 빈칸(.) 개수: ${225 - blackCount - whiteCount}\n`;

    // 이미 돌이 놓인 위치 정보
    state += `\n⛔ 돌이 놓인 위치 (놓을 수 없는 곳):\n`;
    state += occupiedPositions.map(pos => `- ${pos}`).join('\n');

    // 위험 위치 정보 (중복 제거 후 표시)
    const uniqueThreats = Array.from(new Set(blackThreats));
    if (uniqueThreats.length > 0) {
      state += `\n\n⚠️ 긴급 방어가 필요한 위치 (우선순위):\n`;
      state += uniqueThreats.map(pos => `- ${pos}`).join('\n');
      state += `\n\n위 위치 중 하나를 반드시 선택하여 상대방의 공격을 막아야 합니다!\n`;
      state += `특히 4개 이상 연속된 돌이나 띈 3이 있는 경우 최우선으로 막아야 합니다.\n`;
    }

    state += `\n주의사항:\n`;
    state += `1. 반드시 빈칸(.)에만 돌을 놓을 수 있습니다.\n`;
    state += `2. 좌표는 "세로,가로" 형식으로 입력하세요. (예: "8,8")\n`;
    state += `3. 상대방의 3개 이상 연속된 돌이나 띈 3은 반드시 막아야 합니다.\n`;
    state += `4. 승리하기 위해서는 5개의 돌을 연속으로 놓아야 합니다.\n`;
    state += `5. 이미 돌이 놓인 위치에는 절대로 돌을 놓을 수 없습니다.\n`;

    return state;
  };

  const getAIMove = async () => {
    try {
      setIsThinking(true);
      setError(null);
      console.log('현재 보드 상태:', getBoardState());
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `당신은 오목 AI입니다. 아래 규칙을 따라 현재 15x15 오목판에서 최적의 수를 선택하세요.

보드 상태는 15x15 배열이며, 각 셀은 다음 중 하나입니다:
- 'B': 흑돌 (사용자 돌)
- 'W': 백돌 (당신의 돌)
- '.': 빈칸 (돌을 놓을 수 있는 자리)

📌 
규칙:
1. 당신은 백돌('W')을 사용합니다.
2. 오직 '.' 로 표시된 빈 칸에만 돌을 놓을 수 있습니다.  
   ⚠️ 절대 'B'나 'W'가 있는 곳에는 돌을 놓지 마세요.
3. 가로, 세로, 대각선 방향으로 백돌 또는 흑돌이 5개 연결되면 승리입니다.
4. 사용자가 3개의 돌을 연속으로 연결한 경우, 반드시 그 연결을 차단해야 합니다.

⛔ 절대 두면 안 되는 위치:
1. 이미 돌이 있는 자리 ('B'나 'W'가 있는 곳)
2. 보드 범위를 벗어나는 위치 (1-15 범위를 벗어나는 좌표)
3. 상대방의 돌을 가로막을 수 있는 위치가 있다면, 다른 위치는 고려하지 마세요
4. 이미 승리가 확정된 상태에서는 더 이상 돌을 두지 마세요

🧠 응답 형식:
- 정확히 다음과 같은 형식으로 좌표를 출력하세요: **"세로줄번호,가로줄번호"** (예: "8,8")
- 숫자는 반드시 1부터 15 사이의 정수여야 합니다.
- 응답은 **쉼표 하나만 사용하고**, **공백 없이**, **문자나 설명 없이**, **쌍따옴표 없이 숫자만** 출력해야 합니다.

✔️ 올바른 예시:
8,8  
15,15  
1,1

❌ 잘못된 예시:
"7, 9"  
(7,9)  
7,9입니다  
7.5,9  
7 , 9

규칙을 엄격히 따르세요. 출력은 오직 한 줄의 "숫자,숫자"만 허용됩니다.`
          },
          {
            role: "user",
            content: getBoardState()
          }
        ],
        temperature: 0.2,
        max_tokens: 10
      });

      console.log('AI 응답:', response.choices[0].message.content);
      
      const move = response.choices[0].message.content?.trim();
      if (move && /^\d+,\d+$/.test(move)) {
        // 1-15 범위의 좌표를 0-14 범위로 변환
        const [rowStr, colStr] = move.split(',');
        const row = parseInt(rowStr, 10) - 1;
        const col = parseInt(colStr, 10) - 1;
        
        console.log('AI가 선택한 위치 (변환 전):', row + 1, col + 1);
        console.log('AI가 선택한 위치 (변환 후):', row, col);
        
        if (
          row >= 0 && row < 15 &&
          col >= 0 && col < 15 &&
          board[row][col] === ''
        ) {
          handleMove(row, col, 'white');
        } else {
          console.log('유효하지 않은 AI 응답:', move);
          console.log('변환된 좌표:', row, col);
          setError('AI가 유효하지 않은 위치를 선택했습니다. 다시 시도해주세요.');
          setIsPlayerTurn(false);
        }
      } else {
        console.log('잘못된 형식의 AI 응답:', move);
        setError('AI가 잘못된 형식으로 응답했습니다. 다시 시도해주세요.');
        setIsPlayerTurn(false);
      }
    } catch (error: any) {
      console.error('AI 응답 오류:', error);
      if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        setError('API 할당량이 초과되었습니다. 나중에 다시 시도해주세요.');
        setGameOver(true);
      } else {
        setError('AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsPlayerTurn(false); // AI 턴을 다시 시도하도록 함
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleMove = (row: number, col: number, stone: string) => {
    if (gameOver || board[row][col] !== '') return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = stone;
    setBoard(newBoard);

    if (checkWin(row, col, stone)) {
      setGameOver(true);
      setWinner(stone === 'black' ? '플레이어' : 'AI');
      return;
    }

    setIsPlayerTurn(stone === 'white');
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver || board[row][col] !== '' || isThinking) return;
    handleMove(row, col, 'black');
  };

  const resetGame = () => {
    setBoard(Array(15).fill(null).map(() => Array(15).fill('')));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setIsThinking(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      getAIMove();
    }
  }, [isPlayerTurn, gameOver]);

  return (
    <Container>
      <GameInfo>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : gameOver ? (
          <Status>{winner} 승리!</Status>
        ) : (
          <Status isThinking={isThinking}>
            {isThinking ? 'AI 생각 중...' : `${isPlayerTurn ? '플레이어' : 'AI'}의 차례`}
          </Status>
        )}
        <ButtonGroup>
          <Button onClick={resetGame}>새 게임</Button>
          <Button onClick={() => navigate('/')}>홈으로</Button>
        </ButtonGroup>
      </GameInfo>
      <Board>
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Cell
              key={`${i}-${j}`}
              stone={cell}
              onClick={() => handleCellClick(i, j)}
            />
          ))
        )}
      </Board>
    </Container>
  );
};

export default Omok; 