
const submitToDo = () =>{
    const list = document.querySelector(`#toDo`).value;
    console.log(list);
    /*
    firebase.database().ref(`users/${googleUserId.uid}/To-Do`).push({
    Task: list,
    Date: Date,
    shared: false
    })
    .then(() => {
    list = "";
  });
  */
    document.querySelector("#addList").innerHTML = createToDo(list);
    //createToDo(list);
}

const createToDo = (text) =>{
    let innerHTML = `
        <div id="todoEdit" class="field">
            <label class="checkbox">
                <input type="checkbox">
                    "${text}"
                <button class="button is-black">Delete</button>
            </label>
        </div>
    `
    return innerHTML;
}
