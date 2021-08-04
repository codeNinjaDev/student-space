const SPOTIFY_CLIENT_ID = "b213515c9c994acea2b15b7791d5afb4"
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-modify-playback-state'

const spotifyLoginButton = document.querySelector("#spotifySignInButton");
spotifyLoginButton.onclick = () => {
	const authURL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&scope=${SPOTIFY_SCOPES}&redirect_uri=${window.location.href}`;
	spotifyLoginButton.setAttribute("href", authURL);
}
