import {getAuthorization, getUserToken} from './spotifyApi';

export const authenticate = async () => {

    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const sha256 = async (plain) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        
        return window.crypto.subtle.digest('SHA-256', data);
    }

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    const codeVerifier = generateRandomString(64);
    sessionStorage.setItem('code_verifier', codeVerifier);

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    getAuthorization(codeChallenge);
}


export const getToken = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    const response = await getUserToken(code);
    sessionStorage.setItem("spotify_access_token", response.access_token);
    return;
}