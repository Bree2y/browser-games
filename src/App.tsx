import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GameSelection from './components/GameSelection';
import MemoryGame from './components/MemoryGame';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GameSelection />} />
          <Route path="/game/memory-number" element={<MemoryGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
