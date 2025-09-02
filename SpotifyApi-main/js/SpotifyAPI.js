
const clientId = window.Config?.SPOTIFY_CLIENT_ID || '__SPOTIFY_CLIENT_ID__';
const redirectUri = 'http://localhost:5500/callback'; // TODO : Change if needed


export const _getAuthorization = async (codeChallenge) => {
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

export const _getToken = async (code) => {
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

export const _getUserPlaylist = async () => {
  const token = sessionStorage.getItem('spotify_access_token');
  const result = await fetch("https://api.spotify.com/v1/me/playlists", {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }});

  const data = await result.json();
  return data;
}