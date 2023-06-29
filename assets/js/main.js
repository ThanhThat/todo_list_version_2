const API = "https://todo-list-json-server-zal6.vercel.app/todoList/";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const navLinkElem = $$(".nav-link");
const tabPaneElem = $$(".tab-pane");
const inputTodoElem = $(".input-todo");

// focus to input add todo
inputTodoElem.focus();
renderTodoList($(".nav-link.active"));
/////////////// EVENT //////////////////////////////

// event click .nav-link
navLinkElem.forEach((navItem, index) => {
  navItem.addEventListener("click", selectNavLink.bind(navItem, index));
});

// add todo or submit form add todo
$("#form-add-todo").addEventListener("submit", addTodo);

// //////////////////// FUNCTION /////////////////////////////

// Render all todo list
async function renderTodoList(tabItem) {
  const tabTextValue = tabItem.textContent.trim().toLowerCase();
  if (tabTextValue === "all") {
    renderAll();
  } else if (tabTextValue === "completed") {
    renderCompleted();
  } else if (tabTextValue === "active") {
    renderActive();
  }
}

async function renderAll() {
  let html = "";
  try {
    const res = await fetch(API);
    const data = await res.json();

    data
      .filter((todo) => todo.deleted !== true)
      .forEach((todo) => {
        html += renderTodoItemUi(todo);
      });

    $(".todo-list-state").innerHTML = html;
  } catch (err) {
    console.log(err);
  }
}

// Render active todo list
async function renderActive() {
  let html = "";
  try {
    const res = await fetch(API);
    const data = await res.json();

    data
      .filter((todo) => todo.deleted !== true && todo.completed === false)
      .forEach((todo) => {
        html += renderTodoItemUi(todo);
      });

    $$(".todo-list-state")[1].innerHTML = html;
    console.log(html);
  } catch (err) {
    console.log(err);
  }
}

// Render completed todo list
async function renderCompleted() {
  let html = "";
  try {
    const res = await fetch(API);
    const data = await res.json();

    data
      .filter((todo) => todo.deleted !== true && todo.completed)
      .forEach((todo) => {
        html += renderTodoItemUi(todo);
      });

    $$(".todo-list-state")[2].innerHTML = html;
  } catch (err) {
    console.log(err);
  }
}

// when click .nav-link
function selectNavLink(index) {
  $(".nav-link.active").classList.remove("active");
  this.classList.add("active");

  // console.log(this.textContent.trim().toLowerCase());

  $(".tab-pane.show.active").classList.remove("active", "show");
  tabPaneElem[index].classList.add("active", "show");

  renderTodoList(this);
}

// add todo item to UI
function renderTodoItemUi(todo) {
  return `
        <li class="list-group-item d-flex align-items-center border-0 mb-1 rounded" style="background-color: #f4f6f7" data-id='${
          todo.id
        }'>
          <input
            class="form-check-input me-2"
            type="checkbox"
            value=""
            aria-label="..."
            data-id='${todo.id}'
            onclick="updateCompleted(${todo.id})"
            ${todo.completed ? "checked" : ""}
          />
          ${todo.completed ? "<s>" + todo.content + "</s>" : todo.content}
        </li>`;
}

// add todo
async function addTodo(e) {
  e.preventDefault();
  const inputTodoValue = inputTodoElem.value.trim();
  if (inputTodoValue) {
    const todoItem = {
      id: Date.now(),
      content: inputTodoValue,
      completed: false,
      deleted: false,
    };

    // update ui
    const html = renderTodoItemUi(todoItem);
    $(".todo-list-state").innerHTML += html;
    inputTodoElem.value = "";

    try {
      const res = await fetch(API, {
        method: "POST",
        body: JSON.stringify(todoItem),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }
}

// check completed
async function updateCompleted(todoId) {
  const checkBox = $(`input[data-id='${todoId}']`);

  if (checkBox.checked === true) {
    // get tag li
    const parentElem = checkBox.parentElement;

    // get text in tag li
    const todoContentElem = parentElem.lastChild;

    const todoContentValue = todoContentElem.textContent.trim();

    const strikeThroughElement = document.createElement("s");
    strikeThroughElement.textContent = todoContentValue;

    // Replace old text element.
    parentElem.replaceChild(strikeThroughElement, todoContentElem);

    // call api: Update data
    try {
      await fetch(API + todoId, {
        method: "PATCH",
        body: JSON.stringify({
          completed: true,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    const strikeThroughElement = $(`li[data-id="${todoId}"] > s`);
    const strikeThroughElementTextValue =
      strikeThroughElement.textContent.trim();
    strikeThroughElement.outerHTML = strikeThroughElementTextValue;

    // call api method patch
    try {
      await fetch(API + todoId, {
        method: "PATCH",
        body: JSON.stringify({
          completed: false,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
