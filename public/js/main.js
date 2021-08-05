let googleUserId;
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



/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: true
    }, function (authResult) {
        gapi.client.load('calendar', 'v3', getCalendars);
    })
}

window.onload = (event) => {
    // Use this to retain user state between html pages.
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            gapi.load('client:auth2', initClient);
            console.log('Logged in as: ' + user.displayName);
            googleUserId = user.uid;
            console.log(user.photoURL);
            document.querySelector("#profilePicture").src = user.photoURL;
            const currentURLParams = window.location.hash.replace("#", "?");
            const accessToken = new URLSearchParams(currentURLParams).get('access_token');
            if (accessToken) {
                updateSpotifyHeaders(accessToken);
                displaySpotifyController();

            } else {
                renderSpotifyLogin();
            }

            getNotes(googleUserId);
            getToDo(googleUserId);
        } else {
            // If not logged in, navigate back to login page.
            window.location = 'index.html';
        };
    });
};


const getNotes = (userId) => {
    const notesRef = firebase.database().ref(`users/${userId}/notes`);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        renderDataAsHtml(data);
    });
};

const renderDataAsHtml = (data) => {
    let cards = ``;
    for (const noteItem in data) {
        const note = data[noteItem];
        // For each note create an HTML card
        cards += createCard(note, noteItem)
    };
    // Inject our string of HTML into our viewNotes.html page
    document.querySelector('#listView').innerHTML = cards;
};

const editNote = (noteId) => {
    const editNoteModal = document.querySelector('#editNoteModal');
    const notesRef = firebase.database().ref(`users/${googleUserId}/notes`);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const noteDetails = data[noteId];
        document.querySelector('#editNoteId').value = noteId;
        document.querySelector('#editTitleInput').value = noteDetails.title;
        document.querySelector('#editTextInput').value = noteDetails.text;
    });

    editNoteModal.classList.toggle('is-active');
};

const deleteNote = (noteId) => {
    firebase.database().ref(`users/${googleUserId}/notes/${noteId}`).remove();
}

const saveEditedNote = () => {
    const noteId = document.querySelector('#editNoteId').value;
    const noteTitle = document.querySelector('#editTitleInput').value;
    const noteText = document.querySelector('#editTextInput').value;
    const noteEdits = {
        title: noteTitle,
        text: noteText
    };
    firebase.database().ref(`users/${googleUserId}/notes/${noteId}`).update(noteEdits);
    closeEditModal();
}

const closeEditModal = () => {
    const editNoteModal = document.querySelector('#editNoteModal');
    editNoteModal.classList.toggle('is-active');
};

const createNote = () => {
    const createNoteModal = document.querySelector("#createNoteModal");
    createNoteModal.classList.toggle("is-active");
}

const saveCreatedNote = () => {
    // 1. Capture the form data
    const noteTitle = document.querySelector('#createTitleInput');
    const noteText = document.querySelector('#createTextInput');
    // 2. Format the data and write it to our database
    firebase.database().ref(`users/${googleUserId}/notes`).push({
        title: noteTitle.value,
        text: noteText.value,
        time: Date.now(),
        shared: false
    })
        // 3. Clear the form so that we can write a new note
        .then(() => {
            noteTitle.value = "";
            noteText.value = "";
            closeCreateModal();
        });
}

const closeCreateModal = () => {
    const createNoteModal = document.querySelector('#createNoteModal');
    createNoteModal.classList.toggle('is-active');
};

const createCard = (note, noteId) => {
    let innerHTML = "";
    innerHTML += `<div class="card my-note" data-note-id="${noteId}">`
    innerHTML += `<header class="card-header">`
    innerHTML += `<p class="card-header-title">`
    innerHTML += `${note.title}`
    innerHTML += `</p>`
    innerHTML += `</header>`
    innerHTML += `<div class="card-content">`
    innerHTML += `<div class="content">`
    innerHTML += `${note.text}`
    innerHTML += `</div>`
    innerHTML += `</div>`
    innerHTML += `<footer class="card-footer">`
    innerHTML += `<a id="${noteId}" class="card-footer-item" onclick="editNote(this.id)">Edit</a>`
    innerHTML += `<a id="${noteId}" href="#" class="card-footer-item" onclick="deleteNote(this.id)">Delete</a>`
    innerHTML += `</footer>`
    innerHTML += `</div>`

    return innerHTML;
};

const noteSearchInput = document.querySelector("#note-search");
noteSearchInput.addEventListener("keyup", e => {
    const noteArray = document.querySelectorAll(".my-note");
    const searchRe = new RegExp(`.*(${noteSearchInput.value.toLowerCase()}).*`);


    for (let note of noteArray) {
        const noteRef = firebase.database().ref(`users/${googleUserId}/notes/${note.dataset.noteId}`);
        noteRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!searchRe.test(data.title.toLowerCase())) {
                console.log(data);
                note.hidden = true;
            } else {
                note.hidden = false;
            }
        });
    }
});

const normal = () => {
    window.location = 'main.html'
}

const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);
