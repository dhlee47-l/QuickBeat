import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import spotifyApi from '../services/spotifyApi';
import useFormValidation from '../hooks/useFormValidation';
// CSS will be loaded via public/css files

const Shuffle = () => {
  // React State Hooks - replacing vanilla JS variables
  const [token, setToken] = useState('');
  const [genres, setGenres] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Custom hook for form validation
  const { errors, validateForm, validateField, clearErrors, clearFieldError } = useFormValidation();
  
  // React Router hook for navigation
  const navigate = useNavigate();

  // useEffect Hook - equivalent to DOMContentLoaded and initialization
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const accessToken = await spotifyApi.getToken();
        setToken(accessToken);
        const genresList = await spotifyApi.getGenres(accessToken);
        setGenres(genresList);
      } catch (error) {
        console.error('Error loading genres:', error);
        setGlobalError('Failed to load genres. Please refresh the page.');
      }
    };

    loadGenres();
  }, []); // Empty dependency array = run once on mount

  // Handle genre selection
  const handleGenreChange = async (e) => {
    const genreValue = e.target.value;
    setSelectedGenre(genreValue);
    setSelectedPlaylist(''); // Reset playlist
    setPlaylists([]); // Clear playlists
    clearErrors();
    setIsSubmitDisabled(true);
    setShowComingSoon(false);

    // Validate genre
    const error = validateField('genre', genreValue);
    if (error) {
      return;
    }

    try {
      setIsLoading(true);
      const playlistsList = await spotifyApi.getPlaylistByGenre(token, genreValue);

      if (!playlistsList || playlistsList.length === 0) {
        setShowComingSoon(true);
        return;
      }

      setShowComingSoon(false);
      setPlaylists(playlistsList.filter(p => p && p.name && p.tracks && p.tracks.href));
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setShowComingSoon(true);
      setGlobalError('Error loading playlists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle playlist selection
  const handlePlaylistChange = (e) => {
    const playlistValue = e.target.value;
    setSelectedPlaylist(playlistValue);
    clearFieldError('playlist');
    
    const error = validateField('playlist', playlistValue);
    
    if (error) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    setGlobalError('');

    const validation = validateForm(selectedGenre, selectedPlaylist);

    if (!validation.isValid) {
      return;
    }

    try {
      setIsLoading(true);
      const tracks = await spotifyApi.getTracks(token, selectedPlaylist);

      if (!tracks || tracks.length === 0) {
        setGlobalError('No tracks found in this playlist');
        return;
      }

      // Transform track data - removed previewUrl as we now use Spotify embedded player
      const trackData = tracks.filter(e => e.track.name).map(e => ({
        id: e.track.href,
        name: e.track.name,
        artist: e.track.artists[0]?.name,
        albumImage: e.track.album.images[0]?.url,
      }));

      // Store in localStorage and navigate
      localStorage.setItem('trackData', JSON.stringify(trackData));
      navigate('/qr');
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setGlobalError('Error loading tracks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle go back button
  const handleGoBack = () => {
    setShowComingSoon(false);
    setGlobalError('');
    setSelectedGenre('');
    setSelectedPlaylist('');
    setPlaylists([]);
    clearErrors();
    setIsSubmitDisabled(true);
  };

  return (
    <>
      <div className="shuffle-text">
        <h1>Quick Beat</h1>
        <h2>Choose the Genre and Keyword to play!</h2>
        <p className="hero-description">장르와 키워드를 선택해주세요</p>
      </div>

      {/* Main search section */}
      <div className="content-tile" id="search-section" style={{ display: showComingSoon ? 'none' : 'block' }}>
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <select 
                id="select_genre" 
                className={`form-select ${errors.genre ? 'error' : ''}`}
                value={selectedGenre}
                onChange={handleGenreChange}
                required
              >
                <option value="">Genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
              {errors.genre && (
                <div className="field-error" style={{ display: 'block' }}>
                  {errors.genre}
                </div>
              )}
            </div>

            <div className="form-group">
              <select 
                id="select_playlist" 
                className={`form-select ${errors.playlist ? 'error' : ''}`}
                value={selectedPlaylist}
                onChange={handlePlaylistChange}
                required
              >
                <option value="">Keyword</option>
                {playlists.map(playlist => (
                  <option key={playlist.id} value={playlist.tracks.href}>
                    {playlist.name}
                  </option>
                ))}
              </select>
              {errors.playlist && (
                <div className="field-error" style={{ display: 'block' }}>
                  {errors.playlist}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              id="btn_submit" 
              className="submit-button"
              disabled={isSubmitDisabled || isLoading}
              style={{ opacity: isSubmitDisabled || isLoading ? '0.5' : '1' }}
            >
              <span>{isLoading ? 'Loading...' : 'Search'}</span>
              <i className="fas fa-arrow-right"></i>
            </button>

            {globalError && (
              <div id="error-message" className="error-message" style={{ display: 'block' }}>
                {globalError}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Coming Soon section */}
      {showComingSoon && (
        <div className="coming-soon-section" id="coming-soon-section">
          <div className="coming-soon-content">
            <h2>Coming Soon!</h2>
            <p>Your favorite playlists are about to be updated very soon.</p>
            <p>Please choose the genre again!</p>
            <button 
              id="go-back-button" 
              className="go-back-button"
              onClick={handleGoBack}
            >
              <i className="fas fa-arrow-left"></i>
              <span>Go Back and Choose Again!</span>
            </button>
          </div>
        </div>
      )}

      <div className="results-container">
        <div className="song-list"></div>
        <div id="song-detail"></div>
      </div>
    </>
  );
};

export default Shuffle;
