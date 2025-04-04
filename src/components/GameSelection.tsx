import React from 'react';
import { Link } from 'react-router-dom';
import './GameSelection.css';

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

const games: Game[] = [
  {
    id: 'memory-number',
    title: '숫자 기억 게임',
    description: '순서대로 나타나는 숫자를 기억하고 맞추는 게임입니다.',
    thumbnail: '🔢'
  },
  // 여기에 새로운 게임들을 추가할 수 있습니다
];

const GameSelection: React.FC = () => {
  return (
    <div className="game-selection">
      <h1>미니 게임 모음</h1>
      <div className="games-grid">
        {games.map(game => (
          <Link to={`/game/${game.id}`} key={game.id} className="game-card">
            <div className="game-thumbnail">{game.thumbnail}</div>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameSelection; 