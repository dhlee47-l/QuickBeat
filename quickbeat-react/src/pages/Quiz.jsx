import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
// CSS will be loaded via public/css files

const Quiz = () => {
  // React State - replacing global variables
  const [trackData, setTrackData] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalPlayingState, setModalPlayingState] = useState(false);
  
  // Spotify Embedded Player
  const [spotifyPlayer, setSpotifyPlayer] = useState(null);
  const [isSpotifyApiReady, setIsSpotifyApiReady] = useState(false);
  const [currentLoadedTrackId, setCurrentLoadedTrackId] = useState(null);
  const embedContainerRef = useRef(null);

  // Load track data on component mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('trackData'));
    if (data && data.length > 0) {
      setTrackData(data);
      setTotalQuestions(data.length);
    }
  }, []);

  // Initialize Spotify Embedded Player
  useEffect(() => {
    // Set up the Spotify IFrame API callback
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      console.log('Spotify IFrame API Ready!');
      setIsSpotifyApiReady(true);
      
      // Wait a bit for DOM to be ready, then initialize
      setTimeout(() => {
        const element = document.getElementById('spotify-embed');
        if (!element) {
          console.warn('Spotify embed element not found, retrying...');
          // Retry after a short delay
          setTimeout(() => {
            const retryElement = document.getElementById('spotify-embed');
            if (retryElement) {
              initializeSpotifyPlayer(IFrameAPI, retryElement);
            }
          }, 500);
          return;
        }
        
        initializeSpotifyPlayer(IFrameAPI, element);
      }, 100);
    };

    const initializeSpotifyPlayer = (IFrameAPI, element) => {
      let trackId = '4gBkCqlITvat2A3aYPtMqS'; // Default track ID
      const options = {
        uri: `spotify:track:${trackId}`,
        width: 300,
        height: 152
      };
      
      const callback = (EmbedController) => {
        console.log('Spotify Embed Controller created:', EmbedController);
        setSpotifyPlayer(EmbedController);
        setCurrentLoadedTrackId(trackId); // Set initial loaded track
        
        // Add event listeners for play state changes
        EmbedController.addListener('playback_update', (e) => {
          console.log('Playback update:', e);
          setModalPlayingState(!e.data.isPaused);
        });
      };
      
      IFrameAPI.createController(element, options, callback);
      
      // Hide the embed container initially
      const container = document.getElementById('spotify-embed-container');
      if (container) {
        container.style.visibility = 'hidden';
        container.style.position = 'absolute';
        container.style.top = '-1000px';
        container.style.left = '-1000px';
      }
    };
  }, []);

  // Create track element (JSX version of your createTrackElement function)
  const TrackItem = ({ track, index }) => {
    const isAnswered = answeredQuestions.has(index);
    const hasXMark = !isAnswered && trackData[index]?.hasXMark;

    return (
      <div className="track-item" onClick={() => openModal(index)}>
        <div 
          className="track-cover" 
          id={`track-cover-${index}`}
          style={{ display: isAnswered ? 'none' : 'block' }}
        >
          <div className="quiz-number">Question {index + 1}</div>
          {hasXMark && <div className="x-mark">×</div>}
        </div>
        <div className="artwork-container">
          <img src={track.albumImage} alt={track.name} />
        </div>
        <div className="track-info">
          <div className="track-name">{track.name}</div>
          <div className="track-artist">{track.artist}</div>
        </div>
      </div>
    );
  };

  // Modal component (JSX version of your modal HTML)
  const TrackModal = () => {
    if (!selectedTrack || !showModal) return null;

    return (
      <div className="modal-overlay active" id="track-modal" onClick={handleModalOverlayClick}>
        <div className="modal-content">
          <div className="modal-header">
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-track">
            <div className="modal-artwork-container">
              <div className="modal-artwork">
                <div className={`question-mark-overlay ${answeredQuestions.has(currentTrackIndex) ? 'hidden' : ''}`}>
                  <i className="fa-solid fa-question"></i>
                </div>
                <img id="modal-img" src={selectedTrack.albumImage} alt="" />
              </div>
              <div className={`modal-track-info ${answeredQuestions.has(currentTrackIndex) ? 'visible' : ''}`}>
                <div className="modal-track-name" id="modal-name">{selectedTrack.name}</div>
                <div className="modal-track-artist" id="modal-artist">{selectedTrack.artist}</div>
              </div>
            </div>
            <div className="modal-quiz-buttons">
              <button className="modal-quiz-button modal-o-button" onClick={() => handleO(currentTrackIndex)}>
                O
              </button>
              <button className="modal-play-button" onClick={toggleSpotifyPlay}>
                <i className={`fa-solid ${modalPlayingState ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <button className="modal-quiz-button modal-x-button" onClick={() => handleX(currentTrackIndex)}>
                X
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Score Modal component
  const ScoreModal = () => {
    const score = calculateScore();
    
    if (!showScoreModal) return null;

    return (
      <div className="score-modal-overlay active" id="score-modal" onClick={handleScoreModalOverlayClick}>
        <div className="score-modal-content">
          <div className="score-text">당신의 점수는</div>
          <div className="score-value" id="final-score">{score}점</div>
          <button className="score-close-button" onClick={closeScoreModal}>닫기</button>
        </div>
      </div>
    );
  };

  // Event handlers - converting your original functions to React
  const openModal = async (index) => {
    const track = trackData[index];
    setCurrentTrackIndex(index);
    setSelectedTrack(track);
    setShowModal(true);
    setModalPlayingState(false);
    
    // Load track in Spotify player ONLY if it's a different track
    if (spotifyPlayer) {
      try {
        let trackId = track.id.split('/').pop().split('?')[0];
        
        // Only load if it's a different track than currently loaded
        if (currentLoadedTrackId !== trackId) {
          console.log('Loading new track:', trackId, 'from:', track.id);
          await spotifyPlayer.loadUri(`spotify:track:${trackId}`);
          setCurrentLoadedTrackId(trackId);
          console.log('Track loaded successfully');
        } else {
          console.log('Track already loaded, skipping load:', trackId);
          // Just ensure it's paused when opening modal
          await spotifyPlayer.pause();
        }
      } catch (error) {
        console.error('Error loading track:', error);
      }
    } else {
      console.warn("Spotify player not initialized yet.");
    }
  };

  const closeModal = async () => {
    setShowModal(false);
    
    // Pause Spotify player
    if (spotifyPlayer) {
      try {
        await spotifyPlayer.pause();
        setModalPlayingState(false);
      } catch (error) {
        console.error('Error pausing Spotify player:', error);
      }
    } else {
      console.warn("Spotify player not initialized yet.");
    }
  };

  const handleO = (index) => {
    // Mark as answered
    setAnsweredQuestions(prev => new Set([...prev, index]));
    closeModal();
  };

  const handleX = (index) => {
    // Mark track with X but don't close modal
    setTrackData(prev => 
      prev.map((track, i) => 
        i === index ? { ...track, hasXMark: true } : track
      )
    );
    closeModal();
  };

  const toggleSpotifyPlay = async () => {
    if (spotifyPlayer) {
      try {
        console.log('Toggling play, current state:', modalPlayingState);
        await spotifyPlayer.togglePlay();
        // Note: State will be updated by the playback_update listener
      } catch (error) {
        console.error('Error toggling Spotify play:', error);
      }
    } else {
      console.warn("Spotify player not initialized yet.");
    }
  };

  const startConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const calculateScore = () => {
    return totalQuestions === 0 ? 0 : Math.round((answeredQuestions.size / totalQuestions) * 100);
  };

  const showScore = () => {
    const score = calculateScore();
    setShowScoreModal(true);

    if (score === 100) {
      startConfetti();
    }
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
  };

  // Handle modal overlay clicks
  const handleModalOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  const handleScoreModalOverlayClick = (e) => {
    if (e.target.classList.contains('score-modal-overlay')) {
      closeScoreModal();
    }
  };

  return (
    <div className="quiz-page">
      {/* Hidden Spotify Embed Container - Always in DOM for API initialization */}
      <div id="spotify-embed-container" style={{ 
        visibility: 'hidden', 
        position: 'absolute', 
        top: '-1000px', 
        left: '-1000px' 
      }}>
        <div id="spotify-embed"></div>
      </div>

      <div className="container">
        <div id="track-list" className="track-grid">
          {trackData && trackData.length > 0 ? (
            trackData.map((track, index) => (
              <TrackItem key={index} track={track} index={index} />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: '#666' }}>
              Coming Soon!
            </p>
          )}
        </div>
      </div>

      {/* Score Button */}
      <div className="score-button-container">
        <button className="check-score-button" onClick={showScore}>
          점수를 확인하세요!
        </button>
      </div>

      {/* Modals */}
      <TrackModal />
      <ScoreModal />
    </div>
  );
};

export default Quiz;
