import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const location = useLocation();

  // React Hook equivalent of your original scroll handling
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're on mobile (equivalent to your mobileQuery.matches)
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

    // Throttle function equivalent to your original throttle
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

    // Add event listeners
    window.addEventListener('scroll', throttledHandleScroll);
    
    // Handle resize to show navbar on desktop
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsHidden(false);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup function (equivalent to removeEventListener)
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScroll]); // Dependencies array - runs when lastScroll changes

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

