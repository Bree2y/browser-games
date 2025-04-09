import React from 'react';
import { Link } from 'react-router-dom';
import './GameSelection.css';

const GameSelection: React.FC = () => {
  return (
    <div className="game-selection">
      <h1>게임을 선택하세요</h1>
      <div className="game-grid">
        <Link to="/memory" className="game-card">
          <h2>숫자 기억 게임</h2>
          <p>순서대로 나타나는 숫자를 기억하고 맞추세요!</p>
        </Link>
        <Link to="/sudoku" className="game-card">
          <h2>스도쿠</h2>
          <p>9x9 격자를 규칙에 맞게 채우세요!</p>
        </Link>
        <Link to="/omok" className="game-card">
          <h2>오목</h2>
          <p>AI와 대결하는 오목 게임!</p>
        </Link>
        <Link to="/apple" className="game-card">
          <h2>사과 게임</h2>
          <p>합이 10이 되는 사과를 찾아 제거하세요!</p>
        </Link>
      </div>
    </div>
  );
};

export default GameSelection; 