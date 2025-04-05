import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './GameSelection.css';

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 40px;
`;

const GameTitle = styled.h2`
  color: #2196f3;
  margin-bottom: 10px;
`;

const GameDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const GameSelection: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'memory-number',
      title: '숫자 기억 게임',
      description: '순서대로 나타나는 숫자를 기억하고 순서대로 클릭하세요.',
      path: '/game/memory-number'
    },
    {
      id: 'sudoku',
      title: '스도쿠',
      description: '9x9 그리드를 1-9까지의 숫자로 채우는 퍼즐 게임입니다.',
      path: '/game/sudoku'
    }
  ];

  return (
    <div>
      <Title>게임을 선택하세요</Title>
      <GameGrid>
        {games.map(game => (
          <GameCard key={game.id} onClick={() => navigate(game.path)}>
            <GameTitle>{game.title}</GameTitle>
            <GameDescription>{game.description}</GameDescription>
          </GameCard>
        ))}
      </GameGrid>
    </div>
  );
};

export default GameSelection; 