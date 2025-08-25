import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
// CSS will be loaded via public/css files

const QRCodePage = () => {
  const [trackData, setTrackData] = useState([]);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('trackData'));
    const answerId = searchParams.get('answer');

    if (answerId) {
      // Show answer sheet mode
      showAnswerSheetData(answerId);
    } else if (data) {
      // Generate QR code mode
      generateQRCode(data);
    }
  }, [searchParams]);

  const generateQRCode = (data) => {
    setTrackData(data);
    
    // Generate answer ID and store data
    const answerId = Date.now().toString();
    const answerData = {
      id: answerId,
      tracks: data
    };

    localStorage.setItem(`answer_${answerId}`, JSON.stringify(answerData));

    // Generate QR URL
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const generatedQrUrl = `${baseUrl}/qr?answer=${answerId}`;
    
    setQrUrl(generatedQrUrl);
  };

  const showAnswerSheetData = (answerId) => {
    const data = JSON.parse(localStorage.getItem(`answer_${answerId}`));
    if (data) {
      setAnswerData(data);
      setShowAnswerSheet(true);
    }
  };

  const goToQuiz = () => {
    navigate('/quiz');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="qr-container">
      {showAnswerSheet ? (
        // Answer Sheet View
        <div id="answer-sheet">
          <div className="qr-content">
            <h1>Answer Sheet</h1>
            <p>Here are all the tracks from the quiz:</p>
            
            <div id="track-list" className="answer-track-list">
              {answerData?.tracks.map((track, index) => (
                <div key={index} className="track-item">
                  <div className="artwork-container">
                    <img src={track.albumImage} alt={track.name} />
                  </div>
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="qr-actions">
              <button className="btn btn-secondary" onClick={goToHome}>
                <i className="fas fa-home"></i>
                Go Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        // QR Code Generation View
        <div className="qr-content">
          <h1>Quiz Answer Preview</h1>
          <p>퀴즈를 출제하는 분이라면, 정답을 미리 확인하기 위해 QR 코드를 스캔해주세요.</p>
          <p>그렇지 않은 경우, Next 버튼을 눌러주세요.</p>
          
          <div id="qrcode" className="qr-code-container">
            {qrUrl && (
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrUrl}
                viewBox={`0 0 256 256`}
              />
            )}
          </div>

          <div className="qr-actions">
            <button className="btn btn-primary" onClick={goToQuiz}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodePage;
