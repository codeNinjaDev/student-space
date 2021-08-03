let googleUserId2;
const getToDo = (userId) => {
    console.log(userId)
  googleUserId2 = userId;
  const notesRef = firebase.database().ref(`users/${userId}/To-Do`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderToDoDataAsHtml(data);
  });
};

const renderToDoDataAsHtml = (data) => {
  let cards = ``;
  for(const ToDoItem in data) {
    const note = data[ToDoItem];
    // For each note create an HTML card
    cards += createToDo(note.Task)
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#addList').innerHTML = cards;
};

const submitToDo = () =>{
    const list = document.querySelector(`#toDo`).value;
    firebase.database().ref(`users/${googleUserId2}/To-Do`).push({
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
