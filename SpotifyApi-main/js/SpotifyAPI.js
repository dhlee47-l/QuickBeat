
const clientId = '724a3cf2d2e44418acea58d9eea869af'; // TODO : Replace with global const

export const _getAuthorization = async (codeChallenge) => {
    const redirectUri = 'http://localhost:5500/callback'; // TODO : Register redirect URI in Spotify Developer Dashboard
    const scope = 'user-read-private user-read-email';
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

  const response = await fetch(url, payload);
  if (!res.ok) throw new Error("Token exchange failed");

  return await response.json();
}

