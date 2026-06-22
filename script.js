const taskInput = document.getElementById("taskInput");
const taskDateTime = document.getElementById("taskDateTime");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalTasksEl = document.getElementById("totalTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const completedTasksEl = document.getElementById("completedTasks");

let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
let currentFilter = "all";

// Add task
addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const text = taskInput.value.trim();
  const dateTime = taskDateTime.value;

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  const task = {
    id: Date.now(),
    text,
    dateTime,
    completed: false
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskDateTime.value = "";
}

function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function formatDate(dateTime) {
  if (!dateTime) return "No date & time set";
  const date = new Date(dateTime);
  return date.toLocaleString();
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  updateStats();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <h3>No tasks found</h3>
        <p>Add a new task or change the filter.</p>
      </div>
    `;
    return;
  }

  filteredTasks.forEach(task => {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

    taskItem.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
        <div class="task-content">
          <div class="task-text">${escapeHTML(task.text)}</div>
          <div class="task-date">📅 ${formatDate(task.dateTime)}</div>
          <span class="task-status ${task.completed ? "completed" : "pending"}">
            ${task.completed ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      <div class="task-actions">
        <button class="action-btn edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(taskItem);
  });
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Edit your task:", task.text);
  if (newText === null) return;

  const trimmedText = newText.trim();
  if (trimmedText === "") {
    alert("Task cannot be empty!");
    return;
  }

  const newDateTime = prompt(
    "Edit date & time (format: YYYY-MM-DDTHH:MM)",
    task.dateTime || ""
  );

  task.text = trimmedText;
  if (newDateTime !== null) {
    task.dateTime = newDateTime;
  }

  saveTasks();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = pending;
  completedTasksEl.textContent = completed;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

renderTasks();