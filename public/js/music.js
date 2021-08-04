const SPOTIFY_CLIENT_ID = "b213515c9c994acea2b15b7791d5afb4";
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-modify-playback-state';
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
	const authURL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&scope=${SPOTIFY_SCOPES}&redirect_uri=${window.location.href}`;
	spotifyLoginButton.setAttribute("href", authURL);
    }
    spotifyContainer.appendChild(spotifyLoginButton);
}

function updateSpotifyHeaders(accessToken) {
    spotifyHeader['Authorization'] = 'Bearer ' + accessToken;
}

function displaySpotifyController() {
    const spotifyContainer = document.querySelector("#spotify");
    spotifyContainer.innerHTML = `<div id="spotifyControllerContainer" class="card">
                            <div class="card-content">
                                <div id="spotifyController" class="media">
                                    <div class="media-left">
                                        <figure class="image is-48x48">
                                            <img id="spotifyCurrentSongImage"
                                                src="https://bulma.io/images/placeholders/96x96.png"
                                                alt="Current album cover">
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
                                        <h5 class="title is-size-6" id="spotifySongTitle">Song Title</h5>
                                        <p class="subtitle is-size-7" id="spotifySongArtist">Song Artist</p>
                                    </div>
                                </div>
                            </div>
                        </div>
        `;
}