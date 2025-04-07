import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OpenAI from 'openai';

let openai: OpenAI;

// OpenAI 클라이언트 초기화 함수
const initializeOpenAI = () => {
  openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
};

// 컴포넌트가 마운트될 때 OpenAI 클라이언트 초기화
useEffect(() => {
  initializeOpenAI();
}, []);

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
  gap: 20px;
  align-items: center;
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
    let state = '';
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        state += board[i][j] === '' ? '.' : 
                board[i][j] === 'black' ? 'B' : 'W';
      }
      state += '\n';
    }
    return state;
  };

  const getAIMove = async () => {
    try {
      setIsThinking(true);
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `당신은 오목 AI입니다. 현재 보드 상태를 분석하고 최적의 수를 두세요.
            보드는 15x15이며, 'B'는 흑돌, 'W'는 백돌, '.'는 빈 칸입니다.
            응답은 반드시 "row,col" 형식으로만 해주세요. (예: "7,7")`
          },
          {
            role: "user",
            content: getBoardState()
          }
        ],
        temperature: 0.7,
        max_tokens: 10
      });

      const move = response.choices[0].message.content;
      if (move) {
        const [row, col] = move.split(',').map(Number);
        if (
          !isNaN(row) && !isNaN(col) &&
          row >= 0 && row < 15 &&
          col >= 0 && col < 15 &&
          board[row][col] === ''
        ) {
          handleMove(row, col, 'white');
        }
      }
    } catch (error) {
      console.error('AI 응답 오류:', error);
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
        {gameOver ? (
          <Status>{winner} 승리!</Status>
        ) : (
          <Status isThinking={isThinking}>
            {isThinking ? 'AI 생각 중...' : `${isPlayerTurn ? '플레이어' : 'AI'}의 차례`}
          </Status>
        )}
        <Button onClick={resetGame}>새 게임</Button>
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