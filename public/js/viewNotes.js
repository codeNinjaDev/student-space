let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
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
  for(const noteItem in data) {
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
  innerHTML +=  `<footer class="card-footer">`
  innerHTML +=  `<a id="${noteId}" class="card-footer-item" onclick="editNote(this.id)">Edit</a>`
  innerHTML +=  `<a id="${noteId}" href="#" class="card-footer-item" onclick="deleteNote(this.id)">Delete</a>`
  innerHTML +=  `</footer>`
  innerHTML += `</div>`

  return innerHTML;
};

const getToDo = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}/To-Do`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderToDoDataAsHtml(data);
  });
};

const renderToDoDataAsHtml = (data) => {
  let cards = ``;
  for(const noteItem in data) {
    const note = data[noteItem];
    // For each note create an HTML card
    cards += createToDo(note, noteItem)
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#addList').innerHTML = cards;
};

const submitToDo = () =>{
    const list = document.querySelector(`#toDo`).value;
    console.log(list);
    firebase.database().ref(`users/${googleUserId.uid}/To-Do`).push({
    Task: list,
    Time: Date.now(),
    shared: false
    })
    .then(() => {
        list.value = "";
  });
}

const createToDo = (text) =>{
    let innerHTML = `
        <div id="todoEdit" class="field">
            <label class="checkbox">
                <input type="checkbox">
                    ${text}
                <button class="button is-black">Delete</button>
            </label>
        </div>
    `
    return innerHTML;
}
