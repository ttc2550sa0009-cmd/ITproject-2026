const listEl = document.getElementById('todo-list');
const formEl = document.getElementById('todo-form');
const titleEl = document.getElementById('todo-title');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty-message');

function showError(message) {
  errorEl.textContent = message || '';
}

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'エラーが発生しました。');
  }
  return body;
}

async function listTodos() {
  const body = await handleResponse(await fetch('/api/v1/todos'));
  return body.data || [];
}

async function createTodo(title) {
  const body = await handleResponse(await fetch('/api/v1/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }));
  return body.data;
}

async function updateTodo(id, completed) {
  const body = await handleResponse(await fetch(`/api/v1/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  }));
  return body.data;
}

async function deleteTodo(id) {
  await handleResponse(await fetch(`/api/v1/todos/${id}`, { method: 'DELETE' }));
}

function renderTodos(todos) {
  listEl.innerHTML = '';
  emptyEl.hidden = todos.length !== 0;
  todos.forEach((todo) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', async () => {
      try {
        showError('');
        await updateTodo(todo.id, checkbox.checked);
        await refresh();
      } catch (err) {
        showError(err.message);
        await refresh();
      }
    });
    const span = document.createElement('span');
    span.textContent = todo.title;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '削除';
    button.addEventListener('click', async () => {
      try {
        showError('');
        await deleteTodo(todo.id);
        await refresh();
      } catch (err) {
        showError(err.message);
      }
    });
    li.append(checkbox, span, button);
    listEl.append(li);
  });
}

async function refresh() {
  try {
    showError('');
    renderTodos(await listTodos());
  } catch (err) {
    showError(err.message);
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleEl.value.trim();
  if (!title) {
    showError('タイトルを入力してください。');
    return;
  }
  try {
    showError('');
    await createTodo(title);
    titleEl.value = '';
    await refresh();
  } catch (err) {
    showError(err.message);
  }
});

refresh();
