const APIController = (function () {
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa((window.Config?.SPOTIFY_CLIENT_ID || '__SPOTIFY_CLIENT_ID__') + ':' + (window.Config?.SPOTIFY_CLIENT_SECRET || '__SPOTIFY_CLIENT_SECRET__'))
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=ko_KR`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreName) => {
        const limit = 50; // 더 많은 데이터를 가져옴
        try {
            // popularity 관련 키워드를 추가하여 검색
            const queryParam = encodeURIComponent(`${genreName} popular`);
            const result = await fetch(`https://api.spotify.com/v1/search?q=${queryParam}&type=playlist&limit=${limit}&market=KR`, {
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + token}
            });

            if (!result.ok) {
                throw new Error(`Search API request failed with status ${result.status}`);
            }

            const data = await result.json();
            const playlists = data.playlists?.items || [];

            // // owner.id가 'spotify'인 플레이리스트만 필터링
            // const spotifyPlaylists = playlists.filter(playlist =>
            //     playlist?.owner?.id === 'spotify'
            // );

            console.log('Found Spotify playlists:', playlists.length);
            // return spotifyPlaylists.slice(0, 50); // 상위 50개만 반환
            return playlists.slice(0, 50); // 상위 50개만 반환
        } catch (error) {
            console.error('Error in getPlaylistByGenre:', error);
            return [];
        }
    };


    const _getTracks = async (token, tracksEndPoint) => {
        const limit = 20;
        try {
            // tracksEndPoint에서 playlist ID 추출
            const playlistId = tracksEndPoint.split('/').find(segment =>
                segment.match(/^[0-9A-Za-z]{22}$/));

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

            // preview_url이 아닌 음악 자체를 가져와야 할 듯

            return data.items;
        } catch (error) {
            console.error('Error in _getTracks:', error);
            return [];
        }
    };

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreName) {
            return _getPlaylistByGenre(token, genreName);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
    }
})();


const FormValidator = (function () {
    // Validation rules
    const rules = {
        genre: {
            required: true,
            message: 'Please select a genre'
        },
        playlist: {
            required: true,
            message: 'Please select a keyword'
        }
    };

    const errors = new Map();

    const validateGenre = (value) => {
        if (!value || value === "0" || value === "") {
            return rules.genre.message;
        }
        return null;
    };

    const validatePlaylist = (value) => {
        if (!value || value === "0" || value === "") {
            return rules.playlist.message;
        }
        return null;
    };

    return {
        validateForm(genre, playlist) {
            errors.clear();

            const genreError = validateGenre(genre.value);
            const playlistError = validatePlaylist(playlist.value);

            if (genreError) errors.set('genre', genreError);
            if (playlistError) errors.set('playlist', playlistError);

            return {
                isValid: errors.size === 0,
                errors: Object.fromEntries(errors)
            };
        },

        validateField(field, value) {
            switch (field) {
                case 'genre':
                    return validateGenre(value);
                case 'playlist':
                    return validatePlaylist(value);
                default:
                    return null;
            }
        }
    };
})();

const UIController = (function () {
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list',
        searchSection: '#search-section',
        comingSoonSection: '#coming-soon-section',
        goBackButton: '#go-back-button',
        errorMessage: '#error-message',
        form: '.search-form'
    }

    return {
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail),
                form: document.querySelector(DOMElements.form)
            }
        },

        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '<option value="">Keyword</option>';
            this.resetTracks();
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

        showComingSoon() {
            document.querySelector(DOMElements.searchSection).style.display = 'none';
            document.querySelector(DOMElements.comingSoonSection).style.display = 'block';
        },

        hideComingSoon() {
            document.querySelector(DOMElements.searchSection).style.display = 'block';
            document.querySelector(DOMElements.comingSoonSection).style.display = 'none';
        },


        showFieldError(fieldName, message) {
            const field = document.querySelector(DOMElements[`select${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]);
            field.classList.add('error');

            // Create or update error message element
            let errorDiv = field.nextElementSibling;
            if (!errorDiv || !errorDiv.classList.contains('field-error')) {
                errorDiv = document.createElement('div');
                errorDiv.classList.add('field-error');
                field.parentNode.insertBefore(errorDiv, field.nextSibling);
            }
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        },

        clearFieldError(fieldName) {
            const field = document.querySelector(DOMElements[`select${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]);
            field.classList.remove('error');

            const errorDiv = field.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('field-error')) {
                errorDiv.style.display = 'none';
            }
        },

        showError(message) {
            const errorDiv = document.querySelector(DOMElements.errorMessage);
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        },

        hideError() {
            const errorDiv = document.querySelector(DOMElements.errorMessage);
            errorDiv.style.display = 'none';
        },

        clearAllErrors() {
            ['genre', 'playlist'].forEach(fieldName => {
                this.clearFieldError(fieldName);
            });
            this.hideError();
        },

        disableSubmit() {
            this.inputField().submit.disabled = true;
            this.inputField().submit.style.opacity = '0.5';
        },

        enableSubmit() {
            this.inputField().submit.disabled = false;
            this.inputField().submit.style.opacity = '1';
        },

        getDOMElements() {
            return DOMElements;
        }

    };
})();


const APPController = (function (UICtrl, APICtrl, FormValidator) {
    const DOMInputs = UICtrl.inputField();
    const DOMElements = UICtrl.getDOMElements();

    const loadGenres = async () => {
        try {
            const token = await APICtrl.getToken();
            UICtrl.storeToken(token);
            const genres = await APICtrl.getGenres(token);
            genres.forEach(element => UICtrl.createGenre(element.name, element.name));
        } catch (error) {
            console.error('Error loading genres:', error);
            UICtrl.showError('Failed to load genres. Please refresh the page.');
        }
    }

    document.querySelector(DOMElements.goBackButton).addEventListener('click', () => {
        UICtrl.hideComingSoon();
        UICtrl.hideError();
        DOMInputs.genre.selectedIndex = 0;
        UICtrl.resetPlaylist();
        UICtrl.disableSubmit();
    });

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();
        UICtrl.clearAllErrors();
        UICtrl.disableSubmit();

        const error = FormValidator.validateField('genre', DOMInputs.genre.value);
        if (error) {
            UICtrl.showFieldError('genre', error);
            return;
        }

        try {
            const token = UICtrl.getStoredToken().token;
            const genreName = DOMInputs.genre.options[DOMInputs.genre.selectedIndex].value;
            const playlists = await APICtrl.getPlaylistByGenre(token, genreName);

            if (!playlists || playlists.length === 0) {
                UICtrl.showComingSoon();
                return;
            }

            UICtrl.hideComingSoon();
            playlists.forEach(p => {
                if (p && p.name && p.tracks && p.tracks.href) {
                    UICtrl.createPlaylist(p.name, p.tracks.href);
                }
            });
        } catch (error) {
            console.error('Error fetching playlists:', error);
            UICtrl.showComingSoon();
            UICtrl.showError('Error loading playlists. Please try again.');
        }
    });

    DOMInputs.playlist.addEventListener('change', () => {
        UICtrl.clearFieldError('playlist');
        const error = FormValidator.validateField('playlist', DOMInputs.playlist.value);

        if (error) {
            UICtrl.showFieldError('playlist', error);
            UICtrl.disableSubmit();
        } else {
            UICtrl.enableSubmit();
        }
    });

    DOMInputs.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();
        UICtrl.clearAllErrors();

        const validation = FormValidator.validateForm(DOMInputs.genre, DOMInputs.playlist);

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                UICtrl.showFieldError(field, message);
            });
            return;
        }

        try {
            const token = UICtrl.getStoredToken().token;
            const selectedPlaylist = DOMInputs.playlist;
            const tracksEndPoint = selectedPlaylist.options[selectedPlaylist.selectedIndex].value;

            const tracks = await APICtrl.getTracks(token, tracksEndPoint);

            if (!tracks || tracks.length === 0) {
                UICtrl.showError('No tracks found in this playlist');
                return;
            }

            const trackData = tracks.map(e => ({
                id: e.track.href,
                name: e.track.name,
                artist: e.track.artists[0].name,
                albumImage: e.track.album.images[0].url,
                previewUrl: e.track.preview_url
            }));

            localStorage.setItem('trackData', JSON.stringify(trackData));
            window.location.href = 'qr.html';
        } catch (error) {
            console.error('Error fetching tracks:', error);
            UICtrl.showError('Error loading tracks. Please try again.');
        }
    });

    return {
        init() {
            loadGenres();
            UICtrl.hideComingSoon();
            UICtrl.hideError();
            UICtrl.disableSubmit();
        }
    }

})(UIController, APIController, FormValidator);

APPController.init();

