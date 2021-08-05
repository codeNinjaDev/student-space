const noteBody = document.querySelector("#noteBody");
const noteTitleElement = document.querySelector('#noteTitle');

noteBody.addEventListener('keyup', function () {
    if (noteBody.scrollHeight > noteBody.clientHeight) {
        noteBody.style.height = noteBody.scrollHeight + "px";
    }
    localStorage.setItem('currentNoteText', noteBody.value); //add this
});

noteTitleElement.addEventListener('keyup', function () {
    localStorage.setItem('currentNoteTitle', noteTitleElement.value); //add this
});


const saveCreatedNote = () => {
    // 1. Capture the form data
    const noteTitle = document.querySelector('#noteTitle');
    const noteText = document.querySelector('#noteBody');
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
            localStorage.setItem('currentNoteTitle', "");
            localStorage.setItem('currentNoteText', ""); //add this
        });
}
