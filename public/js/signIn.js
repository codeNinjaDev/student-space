// Client ID and API key from the Developer Console
var CLIENT_ID = '185013042583-6qagtpd0mcqmlpejkq041gs930r17sao.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDJxECjrZxTpk4klp-irf8h2pxTqp6ngmQ';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
/**
 *  On load, called to load the auth2 library and API client library.
 */

gapi.load('client', initClient);


/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).catch(function (error) {
        console.log(error);
        alert(error);
    });
}
const signIn = async () => {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();
    const token = googleUser.getAuthResponse().id_token;

    const credential = firebase.auth.GoogleAuthProvider.credential(token);
    // console.log(provider)
    firebase.auth()
        .signInWithCredential(credential)
        .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;
            var token = credential.accessToken;

            // The signed-in user info.
            var user = result.user;

            console.log(user.displayName);

            firebase.database().ref(`users/${user.uid}`).update({
                displayName: user.displayName,
            })
                .then(() => {
                    window.location = 'main.html';
                });
        }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            const err = {
                errorCode,
                errorMessage,
                email,
                credential
            };
            console.log(err);
        });
}
