import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
// CSS will be loaded via public/css files

const Quiz = () => {
  // React State - replacing global variables
  const [trackData, setTrackData] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalPlayingState, setModalPlayingState] = useState(false);

  // Load track data on component mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('trackData'));
    if (data && data.length > 0) {
      setTrackData(data);
      setTotalQuestions(data.length);
    }
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
        <audio id={`audio-${index}`} className="audio-player" src={track.previewUrl}></audio>
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
              <button className="modal-play-button" onClick={() => togglePlay(`audio-${currentTrackIndex}`)}>
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
  const openModal = (index) => {
    const track = trackData[index];
    setCurrentTrackIndex(index);
    setSelectedTrack(track);
    setShowModal(true);
    setModalPlayingState(false);
  };

  const closeModal = () => {
    setShowModal(false);
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      setModalPlayingState(false);
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

  const togglePlay = (audioId) => {
    const audio = document.getElementById(audioId);
    
    if (currentAudio && currentAudio !== audio && !currentAudio.paused) {
      currentAudio.pause();
      setModalPlayingState(false);
    }

    if (audio.paused) {
      audio.play();
      setModalPlayingState(true);
      setCurrentAudio(audio);
      
      // Add event listener for when audio ends
      audio.onended = () => {
        setModalPlayingState(false);
      };
    } else {
      audio.pause();
      setModalPlayingState(false);
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
