import React, { useState, useEffect } from 'react';

const Playlist = ({ playlists, selectedPlaylist, handlePlaylistSelect, errors }) => {

    const hasPlaylists = playlists && playlists.length > 0;

  return (
    (
        <div className="playlist-selection-container">
        <h3 className="section-title">Select a Playlist</h3>
        <div className="playlist-grid">
            {playlists.map(playlist => {
            const isSelected = selectedPlaylist === playlist.tracks.href;
            // Safely access image or use a placeholder
            const imageUrl = playlist.images && playlist.images.length > 0 ? playlist.images[0].url : 'https://via.placeholder.com/150';
            
            return (
                <div 
                key={playlist.id} 
                className={`playlist-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePlaylistSelect(playlist.tracks.href)}
                >
                <div className="card-image-wrapper">
                    <img src={imageUrl} alt={playlist.name} loading="lazy" />
                    <div className="card-overlay">
                    <i className={`fas ${isSelected ? 'fa-check-circle' : 'fa-play'}`}></i>
                    </div>
                </div>
                <div className="card-content">
                    <h4 className="playlist-title">{playlist.name}</h4>
                    <div className="playlist-meta">
                    <span className="creator">By {playlist.owner.display_name}</span>
                    <span className="track-count">{playlist.tracks.total} Tracks</span>
                    </div>
                    {playlist.description && (
                    <p className="playlist-desc" dangerouslySetInnerHTML={{__html: playlist.description}}></p>
                    )}
                </div>
                </div>
            );
            })}
        </div>
        {errors.playlist && (
            <div className="field-error" style={{ display: 'block', marginTop: '10px' }}>
            {errors.playlist}
            </div>
        )}
        </div>
    )
  );
};

export default Playlist;

