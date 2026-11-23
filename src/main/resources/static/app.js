const byId = (id) => document.getElementById(id);
const list = byId("task-list");
const filter = byId("priority-filter");
const examples = byId("examples");
const newTask = byId("new-task");
const dialog = byId("task-dialog");
const form = byId("task-form");
const save = byId("save-task");
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const priorities = { alta: "Alta", media: "Média", baixa: "Baixa" };
const sessionKey = "organiza-demo";
let credentials = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
let tasks = [];
let editingId = null;

function message(id, text = "") {
  const element = byId(id);
  element.textContent = text;
  element.hidden = !text;
}

async function request(path, { method = "GET", body, auth = credentials } = {}) {
  const headers = {};
  if (auth) headers.Authorization = "Basic " + btoa(auth.username + ":" + auth.password);
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetch(path, { method, headers, body: JSON.stringify(body) });
  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") || "";
    const detail = response.status === 400 && contentType.startsWith("text/plain")
      ? await response.text()
      : "Não foi possível concluir a solicitação. Tente novamente.";
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function register() {
  const account = {
    username: "demo-" + crypto.randomUUID(),
    name: "Visitante da demo",
    password: crypto.randomUUID(),
  };
  await request("/users/", { method: "POST", body: account, auth: null });
  credentials = { username: account.username, password: account.password };
  sessionStorage.setItem(sessionKey, JSON.stringify(credentials));
}

function clearSession() {
  credentials = null;
  sessionStorage.removeItem(sessionKey);
  tasks = [];
  render();
}

function utcDate(value) {
  return new Date(value + "Z");
}

function taskElement(task) {
  const item = document.createElement("li");
  item.className = "task";
  const details = document.createElement("div");
  details.className = "task-details";
  const title = document.createElement("h3");
  title.textContent = task.title;
  const description = document.createElement("p");
  description.textContent = task.description || "";
  const time = document.createElement("time");
  time.dateTime = task.endAt + "Z";
  time.textContent = "Prazo: " + dateFormat.format(utcDate(task.endAt));
  details.append(title);
  if (task.description) details.append(description);
  details.append(time);

  const priority = document.createElement("span");
  const priorityLabel = Object.hasOwn(priorities, task.priority) ? priorities[task.priority] : task.priority;
  priority.className = "priority " + task.priority;
  priority.textContent = priorityLabel;
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "edit";
  edit.textContent = "Editar";
  edit.setAttribute("aria-label", "Editar " + task.title);
  edit.addEventListener("click", () => openForm(task));
  item.append(details, priority, edit);
  return item;
}

function render() {
  byId("total").textContent = tasks.length;
  byId("high").textContent = tasks.filter((task) => task.priority === "alta").length;
  byId("overdue").textContent = tasks.filter((task) => utcDate(task.endAt) < new Date()).length;
  const visible = tasks
    .filter((task) => !filter.value || task.priority === filter.value)
    .sort((left, right) => left.endAt.localeCompare(right.endAt));
  list.replaceChildren(...visible.map(taskElement));
  message("empty", visible.length ? "" : tasks.length
    ? "Nenhuma tarefa com essa prioridade."
    : "Sua lista está vazia. Crie uma tarefa ou carregue os exemplos.");
}

function inputDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function apiDate(value) {
  return new Date(value).toISOString().slice(0, 19);
}

function openForm(task) {
  editingId = task?.id ?? null;
  form.reset();
  message("form-error");
  byId("dialog-title").textContent = task ? "Editar tarefa" : "Nova tarefa";
  const fields = form.elements;
  fields.title.value = task?.title ?? "";
  fields.description.value = task?.description ?? "";
  fields.priority.value = task?.priority ?? "media";
  fields.startAt.value = inputDate(task ? utcDate(task.startAt) : new Date(Date.now() + 3600000));
  fields.endAt.value = inputDate(task ? utcDate(task.endAt) : new Date(Date.now() + 86400000));
  dialog.showModal();
}

async function createTask(body) {
  if (!credentials) await register();
  try {
    return await request("/tasks/", { method: "POST", body });
  } catch (error) {
    if (error.status !== 401) throw error;
    clearSession();
    await register();
    return request("/tasks/", { method: "POST", body });
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (save.disabled) return;
  const values = Object.fromEntries(new FormData(form));
  values.title = values.title.trim();
  if (!values.title) {
    message("form-error", "Informe um título para a tarefa.");
    return;
  }
  values.startAt = apiDate(values.startAt);
  values.endAt = apiDate(values.endAt);
  if (values.startAt > values.endAt) {
    message("form-error", "O início deve vir antes do término.");
    return;
  }

  save.disabled = true;
  message("form-error");
  try {
    if (editingId) {
      const updated = await request("/tasks/" + editingId, { method: "PUT", body: values });
      tasks = tasks.map((task) => task.id === updated.id ? updated : task);
    } else {
      tasks.push(await createTask(values));
    }
    filter.value = "";
    render();
    dialog.close();
  } catch (error) {
    if (error.status === 401) {
      clearSession();
      dialog.close();
      message("feedback", "A sessão foi reiniciada. Crie uma tarefa para começar de novo.");
    } else {
      message("form-error", error.message);
    }
  } finally {
    save.disabled = false;
  }
});

examples.addEventListener("click", async () => {
  examples.disabled = true;
  newTask.disabled = true;
  message("feedback");
  const examplesToCreate = [
    ["Revisar a documentação", "Atualizar os exemplos de uso da API.", "alta"],
    ["Planejar a próxima entrega", "Organizar o escopo e os prazos da semana.", "media"],
    ["Organizar as anotações", "Reunir referências do projeto em um só lugar.", "baixa"],
  ];
  const start = Date.now() + 3600000;
  try {
    for (const [index, [title, description, priority]] of examplesToCreate.entries()) {
      if (tasks.some((task) => task.title === title)) continue;
      const startAt = new Date(start).toISOString().slice(0, 19);
      const endAt = new Date(start + (index + 1) * 86400000).toISOString().slice(0, 19);
      tasks.push(await createTask({ title, description, priority, startAt, endAt }));
    }
    filter.value = "";
  } catch (error) {
    message("feedback", error.message);
  } finally {
    examples.disabled = false;
    newTask.disabled = false;
    render();
  }
});

function closeForm() {
  if (!save.disabled) dialog.close();
}

dialog.addEventListener("cancel", (event) => {
  if (save.disabled) event.preventDefault();
});
byId("close-dialog").addEventListener("click", closeForm);
byId("cancel-dialog").addEventListener("click", closeForm);
filter.addEventListener("change", render);
newTask.addEventListener("click", () => {
  message("feedback");
  openForm();
});

if (credentials) {
  examples.disabled = true;
  newTask.disabled = true;
  try {
    tasks = await request("/tasks/");
  } catch (error) {
    if (error.status === 401) clearSession();
    else message("feedback", error.message);
  } finally {
    examples.disabled = false;
    newTask.disabled = false;
  }
}
render();
