let googleUserId2;
const getToDo = (userId) => {
    console.log(userId)
  googleUserId2 = userId;
  const notesRef = firebase.database().ref(`users/${userId}/To-Do`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    console.log("asdfoj");
    renderToDoDataAsHtml(data);
  });
};

const renderToDoDataAsHtml = (data) => {
  let cards = ``;
  document.querySelector('#addList').innerHTML = '';
  for(const ToDoItem in data) {
    const note = data[ToDoItem];
    // For each note create an HTML card
    document.querySelector('#addList').appendChild(createToDo(note, ToDoItem));
  };
  // Inject our string of HTML into our viewNotes.html page
};

const submitToDo = () =>{
    const list = document.querySelector(`#toDo`).value;
    firebase.database().ref(`users/${googleUserId2}/To-Do`).push({
    Task: list,
    Time: Date.now(),
    completed: false
    })
    .then(() => {
        list.value = "";
  });
}

const createToDo = (toDo, toDoItemId) =>{
    const toDoElement = document.createElement("div");
    toDoElement.classList.add("field")
    const checkboxLabel = document.createElement("label")
    checkboxLabel.classList.add("checkbox");
    toDoElement.appendChild(checkboxLabel);    
    const newInput = document.createElement("input");
    newInput.setAttribute("type","checkbox");
    newInput.checked = toDo.completed;


    const todoText = document.createElement("span");
    todoText.textContent = toDo.Task;
    checkboxLabel.appendChild(newInput);
    checkboxLabel.appendChild(todoText);
    const deleteButton =  document.createElement("button");
    deleteButton.classList.add("delete","is-medium");
    checkboxLabel.appendChild(deleteButton);
    deleteButton.addEventListener('click',()=>{
        toDoElement.remove();
        firebase.database().ref(`users/${googleUserId2}/To-Do/${toDoItemId}`).remove();
    })
    newInput.addEventListener("change", e => {
        console.log(e);
        firebase.database().ref(`users/${googleUserId2}/To-Do/${toDoItemId}`).update({
            completed: newInput.checked
        });
    });
    return toDoElement;
    /*
    let innerHTML = `
        <div class="field">
            <label class="checkbox">
                <input type="checkbox">
                    ${text}
                <button class="button is-black">Delete</button>
            </label>
        </div>
    `
    return innerHTML;
    */
}
