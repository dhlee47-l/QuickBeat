
export const _getAuthorization = async (codeChallenge) => {
    const clientId = '724a3cf2d2e44418acea58d9eea869af'; // TODO : Replace with global const
    const redirectUri = 'http://localhost:5500/';
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
