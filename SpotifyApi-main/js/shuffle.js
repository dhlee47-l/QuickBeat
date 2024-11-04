const APIController = (function () {

    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // client id, secret key
                'Authorization': 'Basic ' + btoa('clientid' + ':' + 'secretkey')
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_KR`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 20;
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {
        const limit = 20;
        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items.filter(item => item.track.preview_url !== null);
    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();

const UIController = (function() {
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

        showError(message) {
            const errorDiv = document.querySelector(DOMElements.errorMessage);
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        },

        hideError() {
            const errorDiv = document.querySelector(DOMElements.errorMessage);
            errorDiv.style.display = 'none';
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
    }
})();

const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();
    const DOMElements = UICtrl.getDOMElements();

    const loadGenres = async () => {
        try {
            const token = await APICtrl.getToken();
            UICtrl.storeToken(token);
            const genres = await APICtrl.getGenres(token);
            genres.forEach(element => UICtrl.createGenre(element.name, element.id));
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
        UICtrl.hideError();
        UICtrl.disableSubmit();

        const genreSelect = DOMInputs.genre;
        if (genreSelect.selectedIndex === 0) {
            return;
        }

        try {
            const token = UICtrl.getStoredToken().token;
            const genreId = genreSelect.options[genreSelect.selectedIndex].value;
            const playlists = await APICtrl.getPlaylistByGenre(token, genreId);

            if (!playlists || playlists.length === 0) {
                UICtrl.showComingSoon();
                return;
            }

            UICtrl.hideComingSoon();
            playlists.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
        } catch (error) {
            console.error('Error fetching playlists:', error);
            UICtrl.showComingSoon();
            UICtrl.showError('Error loading playlists. Please try again.');
        }
    });

    DOMInputs.playlist.addEventListener('change', () => {
        UICtrl.hideError();
        const playlistSelect = DOMInputs.playlist;

        if (playlistSelect.selectedIndex === 0) {
            UICtrl.disableSubmit();
        } else {
            UICtrl.enableSubmit();
        }
    });

    DOMInputs.form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const genreSelect = DOMInputs.genre;
        const playlistSelect = DOMInputs.playlist;

        // Form Validation
        if (genreSelect.selectedIndex === 0) {
            UICtrl.showError('Please select a genre');
            return;
        }

        if (playlistSelect.selectedIndex === 0) {
            UICtrl.showError('Please select a keyword');
            return;
        }

        UICtrl.hideError();
        UICtrl.resetTracks();

        try {
            const token = UICtrl.getStoredToken().token;
            const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
            const tracks = await APICtrl.getTracks(token, tracksEndPoint);

            if (!tracks || tracks.length === 0) {
                UICtrl.showError('No tracks found in this playlist');
                return;
            }

            const trackData = tracks.map(el => ({
                id: el.track.href,
                name: el.track.name,
                artist: el.track.artists[0].name,
                albumImage: el.track.album.images[0].url,
                previewUrl: el.track.preview_url
            }));

            localStorage.setItem('trackData', JSON.stringify(trackData));
            window.location.href = 'quiz.html';
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
})(UIController, APIController);

APPController.init();