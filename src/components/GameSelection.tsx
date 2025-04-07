import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './GameSelection.css';

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: #2196f3;
  margin-bottom: 30px;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  width: 100%;
`;

const GameCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const GameTitle = styled.h2`
  color: #2196f3;
  margin-bottom: 10px;
`;

const GameDescription = styled.p`
  color: #666;
  margin: 0;
`;

const GameSelection: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'memory-number',
      title: '숫자 기억 게임',
      description: '순서대로 나타나는 숫자를 기억하고 입력하는 게임입니다.',
      path: '/game/memory-number'
    },
    {
      id: 'sudoku',
      title: '스도쿠',
      description: '9x9 그리드를 1-9까지의 숫자로 채우는 퍼즐 게임입니다.',
      path: '/game/sudoku'
    },
    {
      id: 'omok',
      title: '오목',
      description: 'GPT-4 AI와 대결하는 오목 게임입니다. 먼저 5개의 돌을 연속으로 놓는 플레이어가 승리합니다.',
      path: '/game/omok'
    }
  ];

  return (
    <Container>
      <Title>브라우저 게임 모음</Title>
      <GameGrid>
        {games.map(game => (
          <GameCard key={game.id} onClick={() => navigate(game.path)}>
            <GameTitle>{game.title}</GameTitle>
            <GameDescription>{game.description}</GameDescription>
          </GameCard>
        ))}
      </GameGrid>
    </Container>
  );
};

export default GameSelection; 