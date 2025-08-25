import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Quick Beat</h1>
            <h2>Let's Shuffle & Play</h2>
            <p className="hero-description">지구오락실 음악게임이 부러웠다면?</p>
            <div className="cta-buttons">
              <Link to="/shuffle" className="btn btn-primary btn-main">
                Play Game!
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-element">
              <div className="main-image">
                <img src="/main2.png" alt="earth_arcade" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="section-header">
          <h2>Why Quick Beat?</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-puzzle-piece"></i>
            <h3>Play & Learn</h3>
            <p>Play Quick Beat and learn new songs to enjoy</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-music"></i>
            <h3>Discover Music</h3>
            <p>Explore new genres and artists every week</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users"></i>
            <h3>Join Community</h3>
            <p>Quick Beat is planning to introduce a dedicated chat service</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

