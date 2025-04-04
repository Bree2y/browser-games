import React, { useState } from 'react';
import './MemoryGame.css';

interface GameState {
  sequence: number[];
  userSequence: number[];
  isDisplaying: boolean;
  currentLevel: number;
  score: number;
  gameOver: boolean;
  currentNumber?: number;
}

const MemoryGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    userSequence: [],
    isDisplaying: false,
    currentLevel: 1,
    score: 0,
    gameOver: false,
  });

  const generateSequence = (level: number) => {
    return Array.from({ length: level + 2 }, () => Math.floor(Math.random() * 9) + 1);
  };

  const displaySequence = async (sequence: number[]) => {
    setGameState(prev => ({ ...prev, isDisplaying: true }));
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGameState(prev => ({ ...prev, currentNumber: sequence[i] }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setGameState(prev => ({ ...prev, currentNumber: undefined }));
    }
    
    setGameState(prev => ({ ...prev, isDisplaying: false }));
  };

  const startNewGame = () => {
    const newSequence = generateSequence(0);
    setGameState({
      sequence: newSequence,
      userSequence: [],
      isDisplaying: false,
      currentLevel: 1,
      score: 0,
      gameOver: false,
    });
    setTimeout(() => displaySequence(newSequence), 1000);
  };

  const handleNumberClick = (number: number) => {
    if (gameState.isDisplaying) return;

    const newUserSequence = [...gameState.userSequence, number];
    setGameState(prev => ({ ...prev, userSequence: newUserSequence }));

    // 입력한 숫자가 시퀀스 길이와 같아지면 자동으로 체크
    if (newUserSequence.length === gameState.sequence.length) {
      checkAnswer(newUserSequence);
    }
  };

  const checkAnswer = (userSequence: number[]) => {
    const correct = userSequence.every(
      (num, index) => num === gameState.sequence[index]
    );

    if (correct) {
      const newSequence = generateSequence(gameState.currentLevel);
      setGameState(prev => ({
        ...prev,
        sequence: newSequence,
        userSequence: [],
        currentLevel: prev.currentLevel + 1,
        score: prev.score + 100,
      }));
      setTimeout(() => displaySequence(newSequence), 1000);
    } else {
      setGameState(prev => ({ ...prev, gameOver: true }));
    }
  };

  const renderNumberButtons = () => {
    return (
      <div className="number-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={gameState.isDisplaying}
            className="number-button"
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1>숫자 기억 게임</h1>
      <div className="score-board">
        레벨: {gameState.currentLevel} | 점수: {gameState.score}
      </div>
      
      <div className="number-display">
        {gameState.isDisplaying && gameState.currentNumber}
      </div>

      <div className="sequence-display">
        입력한 숫자: {gameState.userSequence.join(' ')}
      </div>

      {!gameState.gameOver ? (
        <>
          {renderNumberButtons()}
        </>
      ) : (
        <div>
          <h2>게임 오버!</h2>
          <p>최종 점수: {gameState.score}</p>
          <button onClick={startNewGame} className="game-button">새 게임</button>
        </div>
      )}

      {!gameState.sequence.length && (
        <button onClick={startNewGame} className="game-button">게임 시작</button>
      )}
    </div>
  );
};

export default MemoryGame; 