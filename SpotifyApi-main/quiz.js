const trackData = JSON.parse(localStorage.getItem('trackData'));
const trackListDiv = document.getElementById('track-list');

function createTrackElement(track, index) {
    return `
                <div class="track-item">
                    <div class="artwork-container">
                        <img src="${track.albumImage}" alt="${track.name}">
                        <div class="play-overlay">
                            <button class="play-button" onclick="togglePlay('audio-${index}')"></button>
                        </div>
                        <audio id="audio-${index}" class="audio-player" src="${track.previewUrl}"></audio>
                    </div>
                    <div class="track-info">
                        <div class="track-name">${track.name}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
            `;
}

function togglePlay(audioId) {
    const audio = document.getElementById(audioId);
    const allAudios = document.querySelectorAll('audio');

    // Pause all other audio elements
    allAudios.forEach(a => {
        if (a.id !== audioId && !a.paused) {
            a.pause();
        }
    });

    // Toggle play/pause for clicked audio
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

if (trackData && trackData.length > 0) {
    trackListDiv.innerHTML = trackData.map((track, index) =>
        createTrackElement(track, index)
    ).join('');
} else {
    trackListDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 32px; color: #666;">No tracks found.</p>';
}