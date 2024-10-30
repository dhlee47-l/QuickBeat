const trackData = JSON.parse(localStorage.getItem('trackData'));

const trackListDiv = document.getElementById('track-list');

trackListDiv.innerHTML = '';

if (trackData && trackData.length > 0) {
    trackData.forEach(track => {

        const trackItemDiv = document.createElement('div');
        trackItemDiv.className = 'list-group-item d-flex align-items-center';

        const img = document.createElement('img');
        img.src = track.albumImage;
        img.alt = track.name;
        img.width = 100;
        img.height = 100;
        img.className = 'mr-3';

        const detailsDiv = document.createElement('div');

        const title = document.createElement('h5');
        title.className = 'mb-1';
        title.textContent = track.name;
        detailsDiv.appendChild(title);

        const artist = document.createElement('p');
        artist.className = 'mb-1';
        artist.textContent = track.artist;
        detailsDiv.appendChild(artist);


        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = track.previewUrl;
        detailsDiv.appendChild(audio);

        trackItemDiv.appendChild(img);
        trackItemDiv.appendChild(detailsDiv);

        trackListDiv.appendChild(trackItemDiv);
    });
} else {
    trackListDiv.innerHTML = '<p>No tracks found.</p>';
}
