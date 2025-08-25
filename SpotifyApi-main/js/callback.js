import * as SpotifyAPI from './SpotifyAPI.js';

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

const response = await SpotifyAPI._getToken(code);

sessionStorage.setItem("spotify_access_token", response.access_token);

window.location.href = "/";
