const SPOTIFY_CLIENT_ID = "b213515c9c994acea2b15b7791d5afb4";
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state';
const spotifyHeader = {}

function renderSpotifyLogin() {
    // Clear container
    const spotifyContainer = document.querySelector("#spotify");
    spotifyContainer.innerHTML = "";

    const spotifyLoginButton = document.createElement("a");
    spotifyLoginButton.classList.add("button", "is-rounded", "is-dark");
    spotifyLoginButton.setAttribute("id", "spotifySignInButton");
    spotifyLoginButton.innerHTML = `
		<figure class="image">
		  <img alt="Spotify Logo" src="images/Spotify_Logo_RGB_Green.png" style="width: 144px">
		</figure>
		`;
    spotifyLoginButton.onclick = () => {
        const authURL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&scope=${SPOTIFY_SCOPES}&redirect_uri=${window.location.href}&show_dialog=true`;
        spotifyLoginButton.setAttribute("href", authURL);
    }
    spotifyContainer.appendChild(spotifyLoginButton);
}

function updateSpotifyHeaders(accessToken) {
    spotifyHeader['Authorization'] = 'Bearer ' + accessToken;
}

function displaySpotifyController() {
    const spotifyContainer = document.querySelector("#spotify");
    fetch(`https://api.spotify.com/v1/me/player/currently-playing`, { headers: spotifyHeader })
        .then(response => response.json())
        .then(data => data.item)
        .then(song => {
            const albumImage = song.album.images[2];
            spotifyContainer.innerHTML = `<div id="spotifyControllerContainer" class="card">
                            <div class="card-content">
                                <div id="spotifyController" class="media">
                                    <div class="media-left">
                                        <figure class="image is-48x48">
                                            <img id="spotifyCurrentSongImage"
                                                src="${albumImage.url}"
                                                alt="${song.album.name}">
                                        </figure>
                                        
                                    </div>
                                    <div class="media-content">

                                        <div id="spotifyPlaybackControlContainer">
                                            <span class="material-icons outlined">
                                                skip_previous
                                            </span>
                                            <span class="material-icons outlined">
                                                play_arrow
                                            </span>
                                            <span class="material-icons outlined">
                                                skip_next
                                            </span>
                                        </div>
                                        <h5 class="title is-size-6" id="spotifySongTitle">${song.name}</h5>
                                        <p class="subtitle is-size-7" id="spotifySongArtist">${song.artists[0].name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        });

}