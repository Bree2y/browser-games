import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface Apple {
  id: number;
  value: number;
  x: number;
  y: number;
  type: 'normal' | 'golden' | 'clock' | 'rainbow' | 'bomb';
  isSelected: boolean;
}

interface GameState {
  apples: Apple[];
  score: number;
  combo: number;
  timeLeft: number;
  hints: number;
  gameOver: boolean;
  selectedApples: Apple[];
  highScore: number;
  isPaused: boolean;
}

const INITIAL_STATE: GameState = {
  apples: [],
  score: 0,
  combo: 0,
  timeLeft: 60,
  hints: 3,
  gameOver: false,
  selectedApples: [],
  highScore: 0,
  isPaused: false,
};

// 인접한 위치인지 확인하는 함수
const isAdjacent = (apple1: Apple, apple2: Apple): boolean => {
  const dx = Math.abs((apple1.id % 5) - (apple2.id % 5));
  const dy = Math.abs(Math.floor(apple1.id / 5) - Math.floor(apple2.id / 5));
  
  // 상하좌우 또는 대각선으로 인접한 경우만 true 반환
  return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
};

const AppleGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  useEffect(() => {
    initializeGame();
  }, []);

  // 게임 초기화
  const initializeGame = () => {
    const newApples: Apple[] = [];
    for (let i = 0; i < 25; i++) {
      newApples.push({
        id: i,
        value: Math.floor(Math.random() * 9) + 1,
        x: (i % 5) * 60,
        y: Math.floor(i / 5) * 60,
        type: 'normal',
        isSelected: false,
      });
    }
    setGameState({ ...INITIAL_STATE, apples: newApples });
  };

  // 사과 섞기 함수
  const shuffleApples = () => {
    const newApples = gameState.apples.map(apple => ({
      ...apple,
      value: Math.floor(Math.random() * 9) + 1,
      isSelected: false,
    }));
    setGameState(prev => ({
      ...prev,
      apples: newApples,
      selectedApples: [],
    }));
  };

  // 사과 선택
  const selectApple = (apple: Apple) => {
    if (gameState.gameOver || gameState.isPaused) return;

    const newSelectedApples = [...gameState.selectedApples];
    const appleIndex = newSelectedApples.findIndex(a => a.id === apple.id);

    // 이미 선택된 사과인 경우 선택 해제
    if (appleIndex !== -1) {
      newSelectedApples.splice(appleIndex, 1);
    } else {
      // 새로운 사과 선택 시 인접 여부 확인
      if (newSelectedApples.length === 0 || 
          newSelectedApples.some(selectedApple => isAdjacent(selectedApple, apple))) {
        newSelectedApples.push(apple);
      } else {
        return; // 인접하지 않은 사과는 선택 불가
      }
    }

    const sum = newSelectedApples.reduce((acc, curr) => acc + curr.value, 0);
    if (sum === 10) {
      handleMatch(newSelectedApples);
      // 선택된 사과들 초기화
      newSelectedApples.length = 0;
    } else if (sum > 10) {
      newSelectedApples.length = 0;
    }

    setGameState(prev => ({
      ...prev,
      selectedApples: newSelectedApples,
      apples: prev.apples.map(a => ({
        ...a,
        isSelected: newSelectedApples.some(selected => selected.id === a.id),
      })),
    }));
  };

  // 매치 처리
  const handleMatch = (matchedApples: Apple[]) => {
    const newApples = gameState.apples.map(apple => {
      if (matchedApples.some(matched => matched.id === apple.id)) {
        return {
          ...apple,
          value: Math.floor(Math.random() * 9) + 1,
          isSelected: false,
        };
      }
      return apple;
    });

    setGameState(prev => ({
      ...prev,
      apples: newApples,
      score: prev.score + (matchedApples.length * 10),
      combo: prev.combo + 1,
    }));

    // 매치 처리 후 가능한 조합이 있는지 확인
    setTimeout(() => {
      const possibleCombinations = findPossibleCombinations(newApples);
      if (possibleCombinations.length === 0) {
        shuffleApples();
      }
    }, 300);
  };

  // 타이머
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(timer);
          return { ...prev, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameOver, gameState.isPaused]);

  // 힌트 사용
  const useHint = () => {
    if (gameState.hints <= 0) return;

    const possibleCombinations = findPossibleCombinations(gameState.apples);
    if (possibleCombinations.length > 0) {
      const randomCombo = possibleCombinations[Math.floor(Math.random() * possibleCombinations.length)];
      setGameState(prev => ({
        ...prev,
        hints: prev.hints - 1,
        apples: prev.apples.map(apple => ({
          ...apple,
          isSelected: randomCombo.some(comboApple => comboApple.id === apple.id),
        })),
      }));
    }
  };

  // 가능한 조합 찾기
  const findPossibleCombinations = (apples: Apple[]): Apple[][] => {
    const combinations: Apple[][] = [];
    for (let i = 0; i < apples.length; i++) {
      for (let j = i + 1; j < apples.length; j++) {
        // 인접한 사과들만 확인
        if (isAdjacent(apples[i], apples[j])) {
          if (apples[i].value + apples[j].value === 10) {
            combinations.push([apples[i], apples[j]]);
          }
          // 세 번째 사과는 두 번째 사과와 인접해야 함
          for (let k = j + 1; k < apples.length; k++) {
            if (isAdjacent(apples[j], apples[k]) && 
                apples[i].value + apples[j].value + apples[k].value === 10) {
              combinations.push([apples[i], apples[j], apples[k]]);
            }
          }
        }
      }
    }
    return combinations;
  };

  return (
    <Container>
      <Header>
        <GameInfo>
          <Score>점수: {gameState.score}</Score>
          <Time>시간: {gameState.timeLeft}초</Time>
          <Combo>콤보: {gameState.combo}</Combo>
          <Hints>힌트: {gameState.hints}</Hints>
        </GameInfo>
        <ButtonGroup>
          <Button onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}>
            {gameState.isPaused ? '계속하기' : '일시정지'}
          </Button>
          <Button onClick={initializeGame}>새 게임</Button>
          <Button onClick={() => navigate('/')}>홈으로</Button>
        </ButtonGroup>
      </Header>

      <GameBoard>
        {gameState.apples.map(apple => (
          <AppleItem
            key={apple.id}
            isSelected={apple.isSelected}
            onClick={() => selectApple(apple)}
            style={{
              left: `${(apple.id % 5) * 60}px`,
              top: `${Math.floor(apple.id / 5) * 60}px`
            }}
          >
            {apple.value}
          </AppleItem>
        ))}
      </GameBoard>

      {gameState.gameOver && (
        <GameOver>
          <h2>게임 오버!</h2>
          <p>최종 점수: {gameState.score}</p>
          <Button onClick={initializeGame}>다시 시작</Button>
        </GameOver>
      )}

      <HintButton onClick={useHint} disabled={gameState.hints <= 0}>
        힌트 사용
      </HintButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const GameInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const Score = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2196f3;
`;

const Time = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #f44336;
`;

const Combo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
`;

const Hints = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #9c27b0;
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

const GameBoard = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  background-color: white;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const AppleItem = styled.div<{ isSelected: boolean }>`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: ${props => props.isSelected ? '#ff5722' : '#e91e63'};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.1);
  }
`;

const GameOver = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const HintButton = styled(Button)`
  margin-top: 20px;
  background-color: #9c27b0;

  &:hover {
    background-color: #7b1fa2;
  }
`;

export default AppleGame; 