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
            getNotes(googleUserId);
        } else {
            // If not logged in, navigate back to login page.
            window.location = 'index.html';
        };
    });
};


const getCalendars = async () => {
    const listResponse = await gapi.client.calendar.calendarList.list();
    const calendarList = listResponse.result.items;
    const startingDay = new Date();
    startingDay.setDate(startingDay.getDate() - 1);
    const endingDay = new Date();
    endingDay.setDate(startingDay.getDate() + 7);

    const fullCalendar = {}
    for (const calendar of calendarList) {
        console.log(`%c${calendar.summary}`, `color: ${calendar.backgroundColor}`);
        await filterEvents(calendar, startingDay, endingDay, fullCalendar);
    }
    console.log(fullCalendar);
    renderCalendars(fullCalendar, startingDay, endingDay);



};

const renderCalendars = (calendarTable, startingDay, endingDay) => {
    var arrayOfWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const calendarViewDates = getDates(startingDay, endingDay);
    calendarViewDates.forEach(date => {
        const dayIndex = date.getDay();
        const eventCalendarPairs = calendarTable[dayIndex] || [];

        eventCalendarPairs.forEach(([event, calendar]) => {
            console.log(event, calendar);
        });
    });


};
const filterEvents = async (calendar, startingDay, endingDay, calendarTable) => {

    const eventListResponse = await gapi.client.calendar.events.list(
        {
            calendarId: calendar.id,
            timeMin: startingDay.toISOString(),
            timeMax: endingDay.toISOString(),
            showDeleted: false
        }
    )
    const eventList = eventListResponse.result.items;

    for (const eventItem of eventList) {
        const eventResponse = await gapi.client.calendar.events.get({ calendarId: calendar.id, eventId: eventItem.id })
        const event = eventResponse.result;
        if (event.status === "cancelled") {
            return;
        }
        // Date.parse is not recommended, but is best option for parsing API datetime
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        // Get Days of week of event
        const dateRange = getDates(eventStart, eventEnd).map(d => d.getDay());

        for (const day of dateRange) {
            if (!calendarTable.hasOwnProperty(day)) {
                calendarTable[day] = []
            }
            calendarTable[day].push([event, calendar]);
        }
    }

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
    innerHTML += `<div class="card">`
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

// Returns an array of dates between the two dates https://gist.github.com/miguelmota/7905510
function getDates(startDate, endDate) {
    const dates = []
    let currentDate = startDate
    const addDays = function (days) {
        const date = new Date(this.valueOf())
        date.setDate(date.getDate() + days)
        return date
    }
    while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = addDays.call(currentDate, 1)
    }
    return dates
}