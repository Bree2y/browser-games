import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GameSelection from './components/GameSelection';
import MemoryGame from './components/MemoryGame';
import Sudoku from './components/Sudoku';
import Omok from './components/Omok';
import AppleGame from './components/AppleGame';

const App: React.FC = () => {
  return (
    <Router basename="/browser-games">
      <div className="App">
        <Routes>
          <Route path="/" element={<GameSelection />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/omok" element={<Omok />} />
          <Route path="/apple" element={<AppleGame />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
