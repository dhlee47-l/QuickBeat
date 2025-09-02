import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth <= 768;
      
      if (!isMobile) return;

      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 50) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setLastScroll(currentScroll);
    };

    const throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll);
    
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsHidden(false);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScroll]); 

  return (
    <nav className={`navbar ${isHidden ? 'hidden' : ''}`}>
      <div className="nav-content">
        <div className="nav-logo">
          <Link to="/">
            <i className="fa-brands fa-spotify"></i>
            <i className="fa-solid fa-gamepad"></i>
            Quick Beat
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="https://developer.spotify.com/documentation/web-api">Documentation</a>
          <a href="https://open.spotify.com/">Songs</a>
          <Link to="/shuffle">Game</Link>
        </div>
        <div className="nav-auth">
          <Link to="/shuffle" className="btn btn-primary">
            {location.pathname === '/quiz' ? 'Try Again!' : 'Try Free'}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

