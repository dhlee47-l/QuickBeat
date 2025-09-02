
const redirectUri = 'http://localhost:5500/callback'; // TODO : Change if needed
const clientId = window.Config?.SPOTIFY_CLIENT_ID || '__SPOTIFY_CLIENT_ID__';

export const getToken = async() => {
  try {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(
          (clientId || '__SPOTIFY_CLIENT_ID__') + 
          ':' + 
          (window.Config?.SPOTIFY_CLIENT_SECRET || '__SPOTIFY_CLIENT_SECRET__')
        )
      },
      body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
}

export const getGenres = async (token) => {
  try {
    const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=ko_KR`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await result.json();
    return data.categories.items;
  } catch (error) {
    console.error('Error getting genres:', error);
    throw error;
  }
}

export const getPlaylistByGenre = async (token, genreName) => {
  const limit = 50;
  try {
    const queryParam = encodeURIComponent(`${genreName} popular`);
    const result = await fetch(
      `https://api.spotify.com/v1/search?q=${queryParam}&type=playlist&limit=${limit}&market=KR`, 
      {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );

    if (!result.ok) {
      throw new Error(`Search API request failed with status ${result.status}`);
    }

    const data = await result.json();
    const playlists = data.playlists?.items || [];

    console.log('Found Spotify playlists:', playlists.length);
    return playlists.slice(0, 50);
  } catch (error) {
    console.error('Error in getPlaylistByGenre:', error);
    return [];
  }
}

export const getTracks = async (token, tracksEndPoint) => {
  const limit = 20;
  try {
    const playlistId = tracksEndPoint.split('/').find(segment =>
      segment.match(/^[0-9A-Za-z]{22}$/)
    );

    if (!playlistId) {
      console.error('Invalid playlist ID from endpoint:', tracksEndPoint);
      throw new Error('Invalid playlist ID');
    }

    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&market=KR`;
    console.log('Requesting tracks from:', apiUrl);

    const result = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (!result.ok) {
      console.log('API Response Status:', result.status);
      throw new Error(`Failed to fetch tracks: ${result.status}`);
    }

    const data = await result.json();
    console.log('Tracks data received:', data);

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid response structure');
    }

    return data.items;
  } catch (error) {
    console.error('Error in getTracks:', error);
    return [];
  }
}


export const getAuthorization = async (codeChallenge) => {
  const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
  const authUrl = new URL("https://accounts.spotify.com/authorize")

  const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
  }

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

export const getUserToken = async (code) => {
  const codeVerifier = sessionStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const res = await fetch(url, payload);
  if (!res.ok) throw new Error("Token exchange failed");

  return await res.json();
}

export const getUserPlaylist = async () => {
  const token = sessionStorage.getItem('spotify_access_token');
  const result = await fetch("https://api.spotify.com/v1/me/playlists", {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }});

  const data = await result.json();
  return data;
}

