
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
