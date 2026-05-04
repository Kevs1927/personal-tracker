const tasks = [];
let editIdx = -1;
// ─── Load saved tasks ───────────────────────────────
const saved = localStorage.getItem("tasks");
if (saved) {
  tasks.push(...JSON.parse(saved));
}
// ─── Restore theme ───────────────────────────────────
const savedTheme = localStorage.getItem("theme") || "light";
document.body.dataset.theme = savedTheme;
const themeIcon = document.getElementById("theme-icon");
if (themeIcon) {
  themeIcon.innerHTML =
    savedTheme === "dark"
      ? '<i class="fa-solid fa-sun text-orange-400"></i>'
      : '<i class="fa-solid fa-moon text-yellow-400"></i>';
}
// ─── Stats ───────────────────────────────────────────
function updateStats() {
  const cards = document.querySelectorAll(".stat-card span");

  if (cards[0]) cards[0].textContent = tasks.length;

  if (cards[1]) {
    cards[1].textContent = tasks.filter((t) => t.status === "process").length;
  }

  if (cards[2]) {
    const storedCompleted = parseInt(localStorage.getItem("completed") || "0");
    const currentCompleted = tasks.filter((t) => t.status === "success").length;
    cards[2].textContent = storedCompleted + currentCompleted;
  }

  if (cards[3]) {
    cards[3].textContent = parseInt(localStorage.getItem("deleted") || "0");
  }
}

// ─── Status & Priority styles ───────────────────────
const statusCls = {
  success: "bg-[var(--success-bg)] text-[var(--success)]",
  process: "bg-[var(--process-bg)] text-[var(--process)]",
  todo: "bg-[var(--info-bg)] text-[var(--info)]",
};

const priorityCls = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-green-100 text-green-700",
};

const statusLabel = {
  success: "Done",
  process: "In progress",
  todo: "To do",
};

function badge(val, map, labels = null) {
  return `
    <span class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${map[val] || ""}">
      ${labels ? labels[val] : val}
    </span>`;
}

// ─── Date format ────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Render ─────────────────────────────────────────
function render(list = tasks) {
  const tb = document.getElementById("table-body");
  const cb = document.getElementById("card-body");
  const em = document.getElementById("empty-msg");

  tb.innerHTML = "";
  cb.innerHTML = "";

  em.classList.toggle("hidden", list.length > 0);

  list.forEach((t, i) => {
    tb.innerHTML += `
      <tr class="hover:bg-[var(--surface-hover)] transition-colors">
        <td class="px-4 py-3 text-xs text-[var(--text-tertiary)] font-mono">
          ${String(i + 1).padStart(2, "0")}
        </td>
        <td class="px-4 py-3 font-medium">${t.name}</td>
        <td class="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">
          ${t.desc || "—"}
        </td>
        <td class="px-4 py-3">
          ${badge(t.status, statusCls, statusLabel)}
        </td>
        <td class="px-4 py-3">${fmtDate(t.deadline)}</td>
        <td class="px-4 py-3">${t.assignee || "—"}</td>
        <td class="px-4 py-3">
          ${badge(t.priority, priorityCls)}
        </td>
        <td class="px-4 py-3 text-center">
          <button onclick="openModal(${i})"
            class="text-xs px-2.5 py-1 rounded-md border border-[var(--border-strong)] hover:bg-[var(--surface-hover)] mr-1">
            Edit
          </button>
          <button onclick="deleteTask(${i})"
            class="text-xs px-2.5 py-1 rounded-md border border-red-200 hover:bg-red-50 text-red-500">
            Delete
          </button>
        </td>
      </tr>`;
    cb.innerHTML += `
      <div class="bg-(--bg-secondary) rounded-xl border border-(--border-strong) p-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs text-(--text-tertiary) font-mono mr-1">${String(i + 1).padStart(2, "0")}</span>
            <span class="font-medium text-sm">${t.name}</span>
          </div>
          ${badge(t.priority, priorityCls)}
        </div>
        <p class="text-xs text-(--text-secondary) mb-3">${t.desc || "—"}</p>
        <div class="flex flex-wrap gap-3 mb-3 text-xs text-(--text-secondary)">
          <span>Assignee: <span class="font-medium">${t.assignee || "—"}</span></span>
          <span>Due: <span class="font-medium">${fmtDate(t.deadline)}</span></span>
        </div>
        <div class="flex items-center justify-between">
          ${badge(t.status, statusCls)}
          <div class="flex gap-1">
            <button onclick="openModal(${i})"
              class="text-xs px-2.5 py-1 rounded-md border border-(--border-strong) hover:bg-(--surface-hover) transition-colors">
              Edit
            </button>
            <button onclick="deleteTask(${i})"
              class="text-xs px-2.5 py-1 rounded-md border border-(--delete) hover:bg-(--delete-bg) text-(--delete) transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>`;
  });

  updateStats();
}

// ─── Modal ───────────────────────────────────────────
function openModal(idx = -1) {
  editIdx = idx;

  const t =
    idx >= 0 ? tasks[idx] : { name: "", desc: "", status: "todo", deadline: "", assignee: "", priority: "Medium" };

  document.getElementById("modal-title").textContent = idx >= 0 ? "Edit task" : "Add task";

  document.getElementById("f-name").value = t.name;
  document.getElementById("f-desc").value = t.desc;
  document.getElementById("f-status").value = t.status;
  document.getElementById("f-priority").value = t.priority;
  document.getElementById("f-deadline").value = t.deadline;
  document.getElementById("f-assignee").value = t.assignee;

  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

// ─── Save ───────────────────────────────────────────
function saveTask() {
  const t = {
    name: document.getElementById("f-name").value.trim() || "Untitled",
    desc: document.getElementById("f-desc").value.trim(),
    status: document.getElementById("f-status").value,
    priority: document.getElementById("f-priority").value,
    deadline: document.getElementById("f-deadline").value,
    assignee: document.getElementById("f-assignee").value.trim(),
  };
  for (const id of ["f-name", "f-status", "f-priority", "f-deadline", "f-assignee"]) {
    const el = document.getElementById(id);

    if (!el.value.trim()) {
      alert(`${id.replace("f-", "")} is required!`);
      el.focus();
      return;
    }
  }
  if (editIdx >= 0) {
    tasks[editIdx] = t;
  } else {
    tasks.push(t);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  closeModal();
  render();
}

// ─── Delete ─────────────────────────────────────────
function deleteTask(i) {
  const task = tasks[i];

  if (task.status === "success") {
    const completed = parseInt(localStorage.getItem("completed") || "0") + 1;
    localStorage.setItem("completed", completed);
  }

  tasks.splice(i, 1);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  if (task.status !== "success") {
    const deleted = parseInt(localStorage.getItem("deleted") || "0") + 1;
    localStorage.setItem("deleted", deleted);
  }

  render();
}

// ─── Search ─────────────────────────────────────────
document.getElementById("Search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();

  if (!q) return render();

  const filtered = tasks.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(q) ||
      (t.desc || "").toLowerCase().includes(q) ||
      (t.assignee || "").toLowerCase().includes(q),
  );

  render(filtered);
});
function onSubmit(e) {
  e.preventDefault();
  saveTask();
}
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("theme-icon");

  if (body.dataset.theme === "dark") {
    body.dataset.theme = "light";
    icon.innerHTML = '<i class="fa-solid fa-moon text-yellow-400"></i>';
    localStorage.setItem("theme", "light");
  } else {
    body.dataset.theme = "dark";
    icon.innerHTML = '<i class="fa-solid fa-sun text-orange-400"></i>';
    localStorage.setItem("theme", "dark");
  }
}
// ─── Init ────────────────────────────────────────────
render();
