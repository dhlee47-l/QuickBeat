document.addEventListener('DOMContentLoaded', function() {
    const trackData = JSON.parse(localStorage.getItem('trackData'));
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));

    const answerId = Date.now().toString();
    const answerData = {
        id: answerId,
        tracks: trackData
    };

    localStorage.setItem(`answer_${answerId}`, JSON.stringify(answerData));

    const qrUrl = `${baseUrl}/qr.html?answer=${answerId}`;
    new QRCode(document.getElementById("qrcode"), {
        text: qrUrl,
        width: 256,
        height: 256
    });

    const urlParams = new URLSearchParams(window.location.search);
    const answerId2 = urlParams.get('answer');

    if (answerId2) {
        showAnswerSheet(answerId2);
    }
});

function showAnswerSheet(answerId) {
    const answerData = JSON.parse(localStorage.getItem(`answer_${answerId}`));
    if (!answerData) return;

    document.querySelector('.qr-container').style.display = 'none';
    const answerSheet = document.getElementById('answer-sheet');
    answerSheet.style.display = 'block';

    const trackList = document.getElementById('track-list');
    trackList.innerHTML = answerData.tracks.map((track, index) => `
        <div class="track-item">
            <div class="artwork-container">
                <img src="${track.albumImage}" alt="${track.name}">
            </div>
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
        </div>
    `).join('');
}

function goToQuiz() {
    window.location.href = 'quiz.html';
}