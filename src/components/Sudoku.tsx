import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateSudoku, validateBoard } from '../utils/sudokuGenerator';
import { useNavigate } from 'react-router-dom';

const SudokuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 40px);
  gap: 1px;
  background-color: #000;
  border: 2px solid #000;
  margin: 20px 0;

  @media (max-width: 480px) {
    grid-template-columns: repeat(9, 30px);
  }
`;

const Cell = styled.div<{ 
  isInitial: boolean; 
  isSelected: boolean; 
  isError: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}>`
  width: 40px;
  height: 40px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: ${props => {
    if (props.isWrong) return '#ffcdd2';
    if (props.isCorrect) return '#c8e6c9';
    if (props.isSelected) return '#e3f2fd';
    return '#fff';
  }};
  color: ${props => props.isInitial ? '#000' : '#2196f3'};
  cursor: ${props => props.isInitial ? 'default' : 'pointer'};
  
  &:nth-child(3n) {
    border-right: 2px solid #000;
  }

  &:nth-child(9n) {
    border-right: none;
  }
  
  &:nth-child(n+19):nth-child(-n+27),
  &:nth-child(n+46):nth-child(-n+54) {
    border-bottom: 2px solid #000;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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

const Difficulty = styled.select`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const NumberButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 5px;
  margin-top: 20px;
  max-width: 400px;
  width: 100%;
`;

const NumberButton = styled(Button)<{ isUsedUp: boolean }>`
  padding: 10px;
  font-size: 18px;
  opacity: ${props => props.isUsedUp ? 0.5 : 1};
  background-color: ${props => props.isUsedUp ? '#bdbdbd' : '#2196f3'};

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 16px;
  }
`;

const GameInfo = styled.div`
  margin: 20px 0;
  font-size: 18px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

const AttemptsLeft = styled.span<{ isLow: boolean }>`
  color: ${props => props.isLow ? '#f44336' : '#2196f3'};
  font-weight: bold;
`;

const GameOverModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const Sudoku: React.FC = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<string[][]>(Array(9).fill(null).map(() => Array(9).fill('')));
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [isError, setIsError] = useState<boolean>(false);
  const [numberCounts, setNumberCounts] = useState<{ [key: string]: number }>(
    Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, 9]))
  );
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [correctCells, setCorrectCells] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());

  const generateNewPuzzle = () => {
    const { puzzle, solution } = generateSudoku(difficulty);
    const newGrid = puzzle.map(row => row.map(cell => cell === 0 ? '' : cell.toString()));
    const newInitialGrid = puzzle.map(row => row.map(cell => cell !== 0));
    
    setGrid(newGrid);
    setSolution(solution);
    setInitialGrid(newInitialGrid);
    setSelectedCell(null);
    setIsError(false);
    setAttemptsLeft(5);
    setGameOver(false);
    setCorrectCells(new Set());
    setWrongCells(new Set());

    // 초기 숫자 카운트 계산
    const counts: { [key: string]: number } = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, 9]));
    newGrid.forEach(row => {
      row.forEach(cell => {
        if (cell !== '') {
          counts[cell]--;
        }
      });
    });
    setNumberCounts(counts);
  };

  const handleCellSelect = (row: number, col: number) => {
    if (!initialGrid[row][col] && !gameOver) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberClick = (number: number) => {
    if (!selectedCell || numberCounts[number] <= 0 || gameOver) return;
    
    const [row, col] = selectedCell;
    if (initialGrid[row][col]) return;

    const oldValue = grid[row][col];
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = number.toString();
    setGrid(newGrid);
    
    // 숫자 카운트 업데이트
    const newCounts = { ...numberCounts };
    if (oldValue !== '') {
      newCounts[oldValue]++;
      // 이전 값에 대한 상태 제거
      const cellKey = `${row}-${col}`;
      correctCells.delete(cellKey);
      wrongCells.delete(cellKey);
    }
    newCounts[number]--;
    setNumberCounts(newCounts);
    
    // 입력한 숫자가 정답인지 확인
    const cellKey = `${row}-${col}`;
    const newCorrectCells = new Set(correctCells);
    const newWrongCells = new Set(wrongCells);

    if (number === solution[row][col]) {
      newCorrectCells.add(cellKey);
      newWrongCells.delete(cellKey);
      setCorrectCells(newCorrectCells);
      setWrongCells(newWrongCells);
    } else {
      newWrongCells.add(cellKey);
      newCorrectCells.delete(cellKey);
      setCorrectCells(newCorrectCells);
      setWrongCells(newWrongCells);
      setAttemptsLeft(prev => {
        const newAttempts = prev - 1;
        if (newAttempts <= 0) {
          setGameOver(true);
        }
        return newAttempts;
      });
    }
  };

  const checkSolution = () => {
    const isValid = validateBoard(grid);
    setIsError(!isValid);
    
    if (isValid) {
      const isFilled = grid.every(row => row.every(cell => cell !== ''));
      if (isFilled) {
        alert('축하합니다! 스도쿠를 완성했습니다!');
        setGameOver(true);
      } else {
        alert('지금까지 입력한 숫자들이 올바릅니다. 계속 진행하세요!');
      }
    } else {
      alert('잘못된 숫자가 있습니다. 다시 확인해주세요.');
    }
  };

  useEffect(() => {
    generateNewPuzzle();
  }, [difficulty]);

  return (
    <SudokuContainer>
      <Controls>
        <Difficulty
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">쉬움</option>
          <option value="medium">보통</option>
          <option value="hard">어려움</option>
        </Difficulty>
        <Button onClick={generateNewPuzzle}>새 게임</Button>
        <Button onClick={() => navigate('/')}>홈으로</Button>
        <Button onClick={checkSolution}>확인</Button>
      </Controls>
      <GameInfo>
        남은 기회: <AttemptsLeft isLow={attemptsLeft <= 2}>{attemptsLeft}</AttemptsLeft>
      </GameInfo>
      <Grid>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            return (
              <Cell
                key={cellKey}
                isInitial={initialGrid[rowIndex][colIndex]}
                isSelected={selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex}
                isError={isError}
                isCorrect={correctCells.has(cellKey)}
                isWrong={wrongCells.has(cellKey)}
                onClick={() => handleCellSelect(rowIndex, colIndex)}
              >
                {cell}
              </Cell>
            );
          })
        )}
      </Grid>
      <NumberButtons>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <NumberButton
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={numberCounts[number] <= 0 || gameOver}
            isUsedUp={numberCounts[number] <= 0}
          >
            {number}
            <sup style={{ fontSize: '0.6em', marginLeft: '2px' }}>{numberCounts[number]}</sup>
          </NumberButton>
        ))}
      </NumberButtons>
      {gameOver && (
        <GameOverModal>
          <ModalContent>
            <h2>게임 종료</h2>
            <p>
              {attemptsLeft <= 0 
                ? '기회를 모두 소진했습니다.' 
                : '축하합니다! 스도쿠를 완성했습니다!'}
            </p>
            <Button onClick={generateNewPuzzle}>새 게임 시작</Button>
          </ModalContent>
        </GameOverModal>
      )}
    </SudokuContainer>
  );
};

export default Sudoku; 