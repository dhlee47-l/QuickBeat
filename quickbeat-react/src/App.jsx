import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shuffle from './pages/Shuffle';
import Quiz from './pages/Quiz';
import QRCode from './pages/QRCode';
import Callback from './pages/Callback';

import './css/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shuffle" element={<Shuffle />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/qr" element={<QRCode />} />
            <Route path="/callback" element={<Callback />} />

          </Routes>
        </main>
        {/*<Footer />*/}
      </div>
    </Router>
  );
}

export default App;