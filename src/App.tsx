import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GameSelection from './components/GameSelection';
import MemoryGame from './components/MemoryGame';
import Sudoku from './components/Sudoku';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GameSelection />} />
          <Route path="/game/memory-number" element={<MemoryGame />} />
          <Route path="/game/sudoku" element={<Sudoku />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
