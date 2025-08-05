/* 
Retreive user's playlist 
-> GET https://api.spotify.com/v1/me/playlists
-> GET https://api.spotify.com/v1//users/{user_id}/playlists
Retrieve tracks from playlist
-> GET /playlists/{playlist_id}/tracks
-> RESPONSE
    response.items(array of PlaylistTrackObject).track.id

    Assuming we have the track ID
*/

let trackId = '3M4BUxp3L2RtlFXbysF7p9'

let spotifyPlayer = `<button id="play">▶️</button>`
document.getElementById('spotify-player-container').innerHTML = spotifyPlayer

window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('spotify-embed'); // This gets replaced with the iframe
    document.getElementById('spotify-embed-container').style.display = 'none';
    const options = {
        uri: `spotify:track:${trackId}`
        };
    const callback = (EmbedController) => {
        document.getElementById('play').addEventListener('click', () => {EmbedController.togglePlay();});
    }
    IFrameAPI.createController(element, options, callback);
    element.style.display = 'none'; // Hide iframe

};
