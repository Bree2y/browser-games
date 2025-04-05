import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateSudoku, validateBoard } from '../utils/sudokuGenerator';

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

const Cell = styled.input<{ isInitial: boolean; isSelected: boolean; isError: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 20px;
  background-color: ${props => props.isSelected ? '#e3f2fd' : '#fff'};
  color: ${props => props.isInitial ? '#000' : '#2196f3'};
  ${props => props.isError && 'background-color: #ffebee;'}
  
  &:nth-child(3n) {
    border-right: 2px solid #000;
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

const Sudoku: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>(Array(9).fill(null).map(() => Array(9).fill('')));
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [isError, setIsError] = useState<boolean>(false);

  const generateNewPuzzle = () => {
    const { puzzle, solution } = generateSudoku(difficulty);
    const newGrid = puzzle.map(row => row.map(cell => cell === 0 ? '' : cell.toString()));
    const newInitialGrid = puzzle.map(row => row.map(cell => cell !== 0));
    
    setGrid(newGrid);
    setSolution(solution);
    setInitialGrid(newInitialGrid);
    setSelectedCell(null);
    setIsError(false);
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (initialGrid[row][col]) return;
    
    if (value === '' || (value.length === 1 && /[1-9]/.test(value))) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = value;
      setGrid(newGrid);
      setIsError(false);
    }
  };

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const checkSolution = () => {
    const isValid = validateBoard(grid);
    setIsError(!isValid);
    
    if (isValid) {
      const isFilled = grid.every(row => row.every(cell => cell !== ''));
      if (isFilled) {
        alert('축하합니다! 스도쿠를 완성했습니다!');
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
        <Button onClick={checkSolution}>확인</Button>
      </Controls>
      <Grid>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={cell}
              maxLength={1}
              isInitial={initialGrid[rowIndex][colIndex]}
              isSelected={selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex}
              isError={isError}
              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
              onClick={() => handleCellSelect(rowIndex, colIndex)}
            />
          ))
        )}
      </Grid>
    </SudokuContainer>
  );
};

export default Sudoku; 