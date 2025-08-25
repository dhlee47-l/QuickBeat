// Spotify API Service - Converting your APIController module pattern to modern JS

class SpotifyApiService {
  
  async getToken() {
    try {
      const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(
            (window.Config?.SPOTIFY_CLIENT_ID || '__SPOTIFY_CLIENT_ID__') + 
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

  async getGenres(token) {
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

  async getPlaylistByGenre(token, genreName) {
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

  async getTracks(token, tracksEndPoint) {
    const limit = 20;
    try {
      // Extract playlist ID from endpoint
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
}

// Export a single instance (singleton pattern)
export default new SpotifyApiService();

