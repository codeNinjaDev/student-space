const SPOTIFY_CLIENT_ID = "b213515c9c994acea2b15b7791d5afb4";
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state';
const spotifyHeader = {}
const POLL_TIME = 3000;
let race_lock = false;

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
    getCurrentlyPlayingSpotify()
        .then(data => {
            const [isPlaying, song] = data;
            //console.log(song);
            const albumImage = song.album.images[2];
            setTimeout(pollForChanges, POLL_TIME);
            spotifyContainer.innerHTML = `<div id="spotifyControllerContainer" class="card">
                            <div class="card-content">
                                <div id="spotifyController" class="media">
                                    <div class="media-left">
                                        <figure id="spotifyFigure" class="image is-48x48">
                                            <img id="spotifyCurrentSongImage"
                                                src="${albumImage.url}"
                                                alt="${song.album.name}">
                                        </figure>
                                        
                                    </div>
                                    <div class="media-content">

                                        <div id="spotifyPlaybackControlContainer">

                                            <span onclick="skipPrev()"  class="material-icons outlined">
                                                skip_previous
                                            </span>
                                            
                                            <span onclick="togglePlayback()" id="spotifySongStatus" class="material-icons outlined">
                                                ${isPlaying ? 'pause': 'play_arrow' }
                                                
                                            </span>
                                            <span onclick="skipNext()" class="material-icons outlined">
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
        }).catch(err => document.querySelector("#spotify").innerHTML=`<h3 class="title">${err}</h3>`);

}
// Need lock for race-condition
function pollForChanges() {
    if (!race_lock) {
        getCurrentlyPlayingSpotify()
            .then(([isPlaying, song]) => {
                updateSpotifyCard(isPlaying, song);
            });
    }

    setTimeout(pollForChanges, POLL_TIME);
}

// Check if not playing anything
const getCurrentlyPlayingSpotify = async () => {
    const data = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, { headers: spotifyHeader }).then(response => response.json()).catch(err => console.log(err));
    if (!data) {
        throw 'Spotify not playing! To fix: play a song on spotify';
    }
    return [data.is_playing, data.item];
}

const togglePlayback = async () => {
    const [isPlaying, song] = await getCurrentlyPlayingSpotify();
    race_lock = true;
    if (isPlaying) {
        await fetch(`https://api.spotify.com/v1/me/player/pause`, { method: 'PUT', headers: spotifyHeader }).catch(err => console.log(err));
    } else {
        await fetch(`https://api.spotify.com/v1/me/player/play`, { method: 'PUT', headers: spotifyHeader }).catch(err => console.log(err));
    }
    document.querySelector("#spotifySongStatus").textContent = !isPlaying ? 'pause': 'play_arrow';
    race_lock = false;
}

const skipNext = async () => {
    const [oldIsPlaying, oldSong] = await getCurrentlyPlayingSpotify();
    race_lock = true;
    await fetch(`https://api.spotify.com/v1/me/player/next`, { method: 'POST', headers: spotifyHeader }).catch(err => console.log(err));
    const [newIsPlaying, newSong] = await getCurrentlyPlayingSpotify();
    updateSpotifyCard(newIsPlaying, newSong);
    race_lock = false;
}

const skipPrev = async () => {
    const [oldIsPlaying, oldSong] = await getCurrentlyPlayingSpotify();
    race_lock = true;
    await fetch(`https://api.spotify.com/v1/me/player/previous`, { method: 'POST', headers: spotifyHeader }).catch(err => console.log(err));
    const [newIsPlaying, newSong] = await getCurrentlyPlayingSpotify();
    updateSpotifyCard(newIsPlaying, newSong);
    race_lock = false;
}

function updateSpotifyCard(isPlaying, song) {
    document.querySelector("#spotifySongStatus").textContent = isPlaying ? 'pause': 'play_arrow';
    document.querySelector("#spotifySongTitle").textContent = song.name;
    document.querySelector("#spotifySongArtist").textContent = song.artists[0].name;
    const albumImage = song.album.images[2];
    document.querySelector("#spotifyCurrentSongImage").src = albumImage.url;
    document.querySelector("#spotifyCurrentSongImage").alt = song.album.name;
}