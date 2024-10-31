const trackData = JSON.parse(localStorage.getItem('trackData'));
const trackListDiv = document.getElementById('track-list');

const modalHTML = `
    <div class="modal-overlay" id="track-modal">
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-track">
                <div class="modal-artwork-container">
                    <div class="modal-artwork">
                        <div class="modal-artwork">
                            <div class="question-mark-overlay">
                                <i class="fa-solid fa-question"></i>
                            </div>
                        <img id="modal-img" src="" alt="">
                        </div>
                    </div>
                    <div class="modal-track-info">
                        <div class="modal-track-name" id="modal-name"></div>
                        <div class="modal-track-artist" id="modal-artist"></div>
                    </div>
                </div>
                <div class="modal-quiz-buttons">
                    <button class="modal-quiz-button modal-o-button" id="modal-o-button">O</button>
                    <button class="modal-play-button" id="modal-play-button">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button class="modal-quiz-button modal-x-button" id="modal-x-button">X</button>
                </div>
            </div>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

function createTrackElement(track, index) {
    return `
        <div class="track-item" onclick="openModal(${index})">
            <div class="track-cover" id="track-cover-${index}">
                <div class="quiz-number">Question ${index + 1}</div>
            </div>
            <div class="artwork-container">
                <img src="${track.albumImage}" alt="${track.name}">
            </div>
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <audio id="audio-${index}" class="audio-player" src="${track.previewUrl}"></audio>
        </div>
    `;
}

let currentAudio = null;
let currentTrackIndex = null;



function openModal(index) {
    const track = trackData[index];
    currentTrackIndex = index;

    const modalImg = document.getElementById('modal-img');
    const modalTrackInfo = document.querySelector('.modal-track-info');
    const questionMarkOverlay = document.querySelector('.question-mark-overlay');

    // Show question mark overlay and hide track info initially
    questionMarkOverlay.classList.remove('hidden');
    modalTrackInfo.classList.remove('visible');

    // Set up the track data
    modalImg.src = track.albumImage;
    document.getElementById('modal-name').textContent = track.name;
    document.getElementById('modal-artist').textContent = track.artist;

    const modal = document.getElementById('track-modal');
    modal.classList.add('active');

    const playButton = document.getElementById('modal-play-button');
    playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    playButton.onclick = () => togglePlay(`audio-${index}`);

    document.getElementById('modal-o-button').onclick = () => handleO(index);
    document.getElementById('modal-x-button').onclick = () => handleX(index);
}

function closeModal() {
    const modal = document.getElementById('track-modal');
    modal.classList.remove('active');

    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
    }
}

function handleO(index) {
    const trackCover = document.getElementById(`track-cover-${index}`);
    trackCover.style.display = 'none';

    const questionMarkOverlay = document.querySelector('.question-mark-overlay');
    const modalTrackInfo = document.querySelector('.modal-track-info');

    // Hide question mark and show track info
    questionMarkOverlay.classList.add('hidden');
    modalTrackInfo.classList.add('visible');

    closeModal();
}


function handleX(index) {
    const trackItem = document.querySelectorAll('.track-item')[index];
    const trackCover = document.getElementById(`track-cover-${index}`);

    const existingXMark = trackItem.querySelector('.x-mark');
    if (existingXMark) {
        existingXMark.remove();
    }

    const xMark = document.createElement('div');
    xMark.className = 'x-mark';
    xMark.textContent = '×';
    trackCover.appendChild(xMark);

    closeModal();
}

function togglePlay(audioId) {
    const audio = document.getElementById(audioId);
    const playButton = document.getElementById('modal-play-button');

    if (currentAudio && currentAudio !== audio && !currentAudio.paused) {
        currentAudio.pause();
    }

    if (audio.paused) {
        audio.play();
        playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        currentAudio = audio;
    } else {
        audio.pause();
        playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
}

document.getElementById('track-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

if (trackData && trackData.length > 0) {
    trackListDiv.innerHTML = trackData.map((track, index) =>
        createTrackElement(track, index)
    ).join('');
} else {
    trackListDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 32px; color: #666;">Coming Soon!</p>';
}

